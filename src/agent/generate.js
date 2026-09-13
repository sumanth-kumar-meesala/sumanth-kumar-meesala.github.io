// Talking to the worker.
//
// The worker runs the whole graph now, so the browser sends a question and a
// little history and reads back one frame per step. `toParts` stays here
// because both runtimes use it to turn model prose into cited sentences.

export const ENDPOINT = (import.meta.env?.VITE_ASK_ENDPOINT ?? '').trim();

// Generous, because a turn can cost several sequential model calls: generate,
// judge, and one re-generation if the judge sends it back for another pass.
const TIMEOUT_MS = 30_000;

const fail = (message, code) => Object.assign(new Error(message), { code });

/** Pull `event:`/`data:` frames out of a byte stream, one at a time. */
async function* frames(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let split;
    while ((split = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, split);
      buffer = buffer.slice(split + 2);
      const event = /^event: (.*)$/m.exec(frame)?.[1];
      const data = /^data: (.*)$/m.exec(frame)?.[1];
      if (event && data) yield [event, JSON.parse(data)];
    }
  }
}

/**
 * Ask the worker and watch it work.
 * @param onStep  called with each { name, status, detail, ms } as it happens
 * @returns { parts, intent, tokens, model, degraded }
 * @throws  { code } on network, timeout or upstream failure — callers fall back locally
 */
export const askRemote = async ({ question, history, onStep }, { signal } = {}) => {
  if (!ENDPOINT) throw fail('no endpoint configured', 'unconfigured');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  signal?.addEventListener('abort', () => ctrl.abort(), { once: true });
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
      body: JSON.stringify({ question, history }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw fail(`proxy ${res.status}`, res.status === 429 ? 'rate_limited' : res.status === 503 ? 'unconfigured' : 'upstream');
    if (!res.body) throw fail('no response body', 'upstream');

    let done = null;
    for await (const [event, data] of frames(res.body)) {
      if (event === 'step') onStep?.(data);
      else if (event === 'done') done = data;
      else if (event === 'error') throw fail(data.error, 'upstream');
    }
    if (!done?.parts?.length) throw fail('stream ended early', 'upstream');
    return done;
  } catch (err) {
    if (err.name === 'AbortError') throw fail('timed out', 'timeout');
    throw err.code ? err : Object.assign(err, { code: 'network' });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Rate an answer. Fire-and-forget: a rating that does not land is not worth
 * telling the visitor about, and never blocks anything.
 */
export const sendScore = async ({ traceId, value }) => {
  if (!ENDPOINT || !traceId) return false;
  try {
    const res = await fetch(new URL('/score', ENDPOINT), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ traceId, value }),
    });
    return res.ok;
  } catch {
    return false;
  }
};

const MARK = /\[(\d{1,2})\]/g;

/**
 * Split model prose into sentences and attach the cited facts.
 * A sentence citing [n] gets fact n's citation; a sentence with no marker is
 * kept as `meta` (the output guardrail still checks its numbers).
 * Returns { parts, uncited, badRefs }.
 */
export const toParts = (text, facts) => {
  const cleaned = text
    .replace(/[*_`#>]+/g, '') // no markdown survives
    .replace(/\s+/g, ' ')
    .trim();
  const sentences = cleaned.split(/(?<=[.!?](?:\s*\[\d{1,2}\])*)\s+(?=[A-Z“"(])/).map((s) => s.trim()).filter(Boolean);
  const parts = [];
  let uncited = 0;
  let badRefs = 0;
  for (const raw of sentences) {
    const refs = [...raw.matchAll(MARK)].map((m) => Number(m[1]));
    const body = raw.replace(MARK, '').replace(/\s+([.,;:!?])/g, '$1').replace(/\s+/g, ' ').trim();
    if (!body) continue;
    const valid = refs.map((n) => facts[n - 1]).filter(Boolean);
    badRefs += refs.length - valid.length;
    if (valid.length) {
      // Cite the first fact inline; extra facts from the same sentence ride along for the trace.
      parts.push({ text: body, cite: valid[0].cite, also: valid.slice(1).map((f) => f.cite) });
    } else {
      uncited++;
      parts.push({ text: body, meta: true });
    }
  }
  return { parts, uncited, badRefs };
};
