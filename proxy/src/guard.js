// Tier 2 input screening: Llama Prompt Guard 2 (86M), a classifier trained on
// prompt injections and jailbreaks, behind the rule-based tier 1.
//
// Tier 1 already blocks every attack in the eval corpus at zero cost and zero
// latency. This exists for the attacks not in the corpus — obfuscated or
// non-English phrasings that a regex list will not have anticipated.
//
// The model is served through chat completions and its exact encoding of
// `{label, score}` is not pinned down in Groq's docs, so the parser accepts
// every shape it plausibly returns and reports "no opinion" for anything else.
// No opinion means tier 1's verdict stands: an unparseable guard can never
// block a legitimate question, and can never wave an attack through either.

export const DEFAULT_THRESHOLD = 0.9;

/**
 * @returns { jailbreak: boolean, score: number } | null when there is no usable opinion
 */
export const parseGuard = (raw, threshold = DEFAULT_THRESHOLD) => {
  const text = String(raw ?? '').trim();
  if (!text) return null;

  // Shape 1: JSON, either {label, score} or [{label, score}].
  try {
    const data = JSON.parse(text);
    const item = Array.isArray(data) ? data[0] : data;
    if (item && typeof item === 'object' && typeof item.label === 'string') {
      const score = typeof item.score === 'number' && item.score >= 0 && item.score <= 1 ? item.score : 1;
      const jailbreak = /jailbreak|injection|malicious|unsafe/i.test(item.label);
      return { jailbreak: jailbreak && score >= threshold, score };
    }
  } catch {
    /* not JSON — fall through to the label forms */
  }

  // Shape 2: a bare label, which is what a classifier endpoint most often returns.
  if (/^(jailbreak|injection|malicious|unsafe)\b/i.test(text)) return { jailbreak: true, score: 1 };
  if (/^(benign|safe|clean|no)\b/i.test(text)) return { jailbreak: false, score: 0 };

  // Shape 3: a label somewhere inside a sentence. Only trust an explicit one.
  if (/\bjailbreak\b/i.test(text)) return { jailbreak: true, score: 1 };
  if (/\bbenign\b/i.test(text)) return { jailbreak: false, score: 0 };

  return null; // no opinion — tier 1 decides
};
