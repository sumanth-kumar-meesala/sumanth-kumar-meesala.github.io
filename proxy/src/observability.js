// Two tools, two jobs.
//
// LangSmith traces the graph itself and needs no code here: with nodejs_compat
// and a compatibility date past 2025-04-01, Cloudflare populates process.env
// from the worker's secrets, so LANGSMITH_TRACING and LANGSMITH_API_KEY are all
// @langchain/core needs to emit its run tree.
//
// Langfuse is instrumented by hand, from the base SDK. It carries the things
// worth *showing* rather than debugging — the guardrail verdict, the judge's
// score, whether a retry fired — and it owns the eval datasets and the scores
// the page submits when a visitor rates an answer. (langfuse-langchain's
// callback handler is not used: its peer range stops at langchain <0.4.0.)

import { Langfuse } from 'langfuse';

// The SDK retries failed ingestion with backoff, so flushAsync() can hang for
// a long time against a dead collector. Inside ctx.waitUntil that keeps the
// request alive burning wall time, so the flush is bounded and dropped instead.
const FLUSH_TIMEOUT_MS = 2_000;

/** No keys configured: every call is a no-op and the agent behaves identically. */
const OFF = { traceId: null, step() {}, finish() {}, flush: async () => {} };

const client = (env) =>
  new Langfuse({
    publicKey: env.LANGFUSE_PUBLIC_KEY,
    secretKey: env.LANGFUSE_SECRET_KEY,
    baseUrl: env.LANGFUSE_BASEURL || undefined,
    flushAt: 1000,
  });

/**
 * Attach a visitor's rating to a trace.
 *
 * Langfuse's public key would allow this straight from the page, but that
 * means shipping the SDK to every visitor for one thumbs-up. The worker holds
 * the key and forwards instead: no browser dependency, nothing exposed.
 */
export const score = async (env, { traceId, value, comment }) => {
  if (!env?.LANGFUSE_PUBLIC_KEY || !env?.LANGFUSE_SECRET_KEY) return false;
  try {
    const lf = client(env);
    await lf.score({ traceId, name: 'user-feedback', value, dataType: 'NUMERIC', comment: comment || undefined });
    await Promise.race([lf.flushAsync(), new Promise((r) => setTimeout(r, FLUSH_TIMEOUT_MS))]);
    return true;
  } catch {
    return false;
  }
};

/**
 * @param env      worker env (LANGFUSE_PUBLIC_KEY / _SECRET_KEY / _BASEURL)
 * @param input    { question, history }
 * @returns { traceId, step(entry), finish(result), flush() }
 */
export const observe = (env, input) => {
  if (!env?.LANGFUSE_PUBLIC_KEY || !env?.LANGFUSE_SECRET_KEY) return OFF;

  let lf;
  let trace;
  try {
    lf = client(env);
    trace = lf.trace({
      name: 'ask',
      input: { question: input.question, turns: input.history?.length ?? 0 },
      tags: ['portfolio', 'resume-agent'],
    });
  } catch {
    return OFF; // observability must never be able to break an answer
  }

  const start = Date.now();
  let elapsed = 0; // trace entries carry cumulative ms; spans need a window

  const safely = (fn) => {
    try {
      fn();
    } catch {
      /* dropped on purpose — see above */
    }
  };

  return {
    traceId: trace.id,

    /** One span per stage, with the detail line the visitor also sees. */
    step(entry) {
      safely(() => {
        trace.span({
          name: entry.name,
          startTime: new Date(start + elapsed),
          endTime: new Date(start + entry.ms),
          level: entry.status === 'blocked' ? 'WARNING' : entry.status === 'warned' ? 'WARNING' : 'DEFAULT',
          statusMessage: entry.detail,
          metadata: { status: entry.status, ms: Math.round((entry.ms - elapsed) * 10) / 10 },
        });
        elapsed = entry.ms;
      });
    },

    finish(result) {
      safely(() =>
        trace.update({
          output: { answer: result.parts.map((p) => p.text).join(' '), intent: result.intent, model: result.model },
          metadata: {
            intent: result.intent,
            model: result.model,
            cited: result.parts.filter((p) => p.cite).length,
            uncited: result.parts.filter((p) => !p.cite).length,
            stages: result.trace.map((t) => `${t.name}:${t.status}`),
          },
        }),
      );
    },

    /** Must be awaited inside ctx.waitUntil, or the worker exits mid-send. */
    async flush() {
      let timer;
      try {
        await Promise.race([
          lf.flushAsync(),
          new Promise((resolve) => {
            timer = setTimeout(resolve, FLUSH_TIMEOUT_MS);
          }),
        ]);
      } catch {
        /* dropped on purpose */
      } finally {
        clearTimeout(timer);
      }
    },
  };
};
