// Generation: hand the question and the retrieved facts to the proxy, get
// prose back with [n] citations, and turn it into parts the UI can render.
// The endpoint is optional; without it the pipeline composes locally.

export const ENDPOINT = (import.meta.env?.VITE_ASK_ENDPOINT ?? '').trim();
const TIMEOUT_MS = 15_000;

/**
 * Call the proxy. Resolves { text, model, ms } or throws { code, message }.
 */
export const generate = async ({ question, facts, history }, { signal } = {}) => {
  if (!ENDPOINT) throw Object.assign(new Error('no endpoint configured'), { code: 'unconfigured' });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  signal?.addEventListener('abort', () => ctrl.abort(), { once: true });
  const started = performance.now();
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        question,
        facts: facts.map((f) => ({ text: f.text, cite: f.cite?.label ?? '' })),
        history,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const code = res.status === 429 ? 'rate_limited' : res.status === 503 ? 'unconfigured' : 'upstream';
      throw Object.assign(new Error(`proxy ${res.status}`), { code });
    }
    const data = await res.json();
    if (!data.answer) throw Object.assign(new Error('empty answer'), { code: 'upstream' });
    return { text: String(data.answer), model: data.model ?? 'unknown', ms: Math.round(performance.now() - started) };
  } catch (err) {
    if (err.name === 'AbortError') throw Object.assign(new Error('timed out'), { code: 'timeout' });
    throw err.code ? err : Object.assign(err, { code: 'network' });
  } finally {
    clearTimeout(timer);
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
