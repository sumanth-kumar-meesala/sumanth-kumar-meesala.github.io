// Guardrails. Input: what may reach retrieval at all. Output: what may leave.
// Rule-based on purpose — the point is that every refusal is explainable.

import { profile } from './knowledge';
import { ENDPOINT } from './generate';

const HAS_MODEL = Boolean(ENDPOINT);

const MAX_CHARS = 400;

/** Replace ASCII control characters with spaces (kept out of a regex literal for the linter). */
const stripControl = (s) => Array.from(s, (ch) => (ch.charCodeAt(0) < 32 || ch.charCodeAt(0) === 127 ? ' ' : ch)).join('');

// --- input -------------------------------------------------------------------

const INJECTION = [
  /ignore (all |any |the |your |these |those )?(previous|prior|above|earlier|preceding|initial)?\s*(instructions?|prompts?|rules|guidelines|context)/i,
  /(system|developer|hidden|secret|initial|original) (prompt|message|instructions?|rules)/i,
  /\byou are now\b|\bfrom now on\b|\bnew (persona|identity|instructions|rules)\b/i,
  /\bpretend (to be|you are|you're)\b|\bact as (a|an|the|if)\b|\broleplay\b|\brole-play\b/i,
  /\bjailbreak|\bdan\b|\bdo anything now|\bdeveloper mode|\bgod mode/i,
  /\b(reveal|print|show|repeat|output|dump|leak|expose)\b.*\b(prompt|instructions|rules|system|context|source code|config)/i,
  /\b(disregard|override|bypass|disable|turn off|forget)\b.*\b(rules|guardrails?|instructions|restrictions|filters?|safety|everything)/i,
  /<\/?\s*(system|assistant|user|instruction|prompt)\s*>|\[(system|inst|instruction)\]|```/i,
  /\b(sudo|admin mode|root access)\b/i,
  /\banswer (only )?in (json|base64|rot13|leetspeak)\b/i,
];

const ABUSE = [
  /\b(fuck\w*|shit\w*|bitch\w*|asshole|arsehole|bastard|dickhead|cunt|wanker|motherfucker)\b/i,
  /\b(you|he|him|sumanth|this)('s|'re| is| are)?\s+(an?\s+|so\s+|such an?\s+)?(idiot|stupid|moron|dumb|retard\w*|loser|useless|pathetic|fraud|liar)\b/i,
  /\b(retard\w*)\b/i,
  /\b(kill|hurt|die|hate)\s+(you|yourself|him|sumanth)\b/i,
];

const PERSONAL = [
  /\b(home |street |residential |postal )?address\b/i,
  /\b(phone|mobile|cell)( number)?\b|\bwhatsapp\b/i,
  /\bdate of birth|\bdob\b|\bbirthday\b|\bhow old\b|\bhis age\b|\bwhat age\b/i,
  /\breligio|\bcaste\b|\bethnic|\bskin colou?r\b|\bnationality\b|\bwhere (is|was) he (born|from)\b/i,
  /\bmarri|\bmarital|\bwife\b|\bhusband\b|\bgirlfriend|\bboyfriend|\bkids\b|\bchildren\b|\bfamily\b|\bdating\b/i,
  /\bhealth\b|\bdisab|\bpregnan|\bmedical\b|\bmental\b/i,
  /\bpolitic|\bvote|\bsexual|\bgender\b|\bgay\b|\bstraight\b/i,
  /\bpassport number|\btax file|\btfn\b|\bbank\b|\bcredit card\b|\bsalary history\b/i,
  /\bphoto\b|\bpicture\b|\bwhat does he look like\b|\bheight\b|\bweight\b/i,
];

const SOCIAL = [
  ['affection', /\b(love you|i love|adore you|marry me|kiss|you're (cute|hot|sexy|beautiful|amazing|great|awesome|the best)|you are (cute|hot|sexy|beautiful|amazing|great|awesome|the best))\b/i],
  ['thanks', /\b(thanks|thank you|thankyou|cheers|ta|appreciate it|nice one|good job|well done|great answer)\b/i],
  ['greeting', /^\s*(hi|hello|hey|yo|g'?day|good (morning|afternoon|evening)|hiya|howdy|sup|hi there|hello there)\b[\s!.?]*$/i],
  ['wellbeing', /\bhow are you\b|\bhow's it going\b|\bhow do you do\b|\bwhats up\b|\bwhat's up\b/i],
  ['identity', /\b(who|what) are you\b|\bare you (a |an )?(bot|ai|human|real|person|llm|chatgpt|claude|gpt)\b|\bwhat can you do\b|\bhow do you work\b|\bwhat are you built (on|with)\b|\bwhich model\b|\bwhat model\b/i],
  ['bye', /^\s*(bye|goodbye|see you|see ya|later|ciao|take care)\b[\s!.]*$/i],
  ['joke', /\b(joke|funny|riddle|make me laugh|pun)\b/i],
  ['yes', /^\s*(yes|yeah|yep|no|nope|ok|okay|sure|cool|nice|great|wow|hmm|k)\b[\s!.]*$/i],
];

const OUT_OF_SCOPE = [
  /^\s*(write|generate|compose|draft|translate|create|make|calculate|solve|rewrite|summari[sz]e)\s+(me|us|a|an|the|some|this|it|my)\b(?!.*\b(he|his|him|sumanth|résumé|resume|cv)\b)/i,
  /\b(poem|essay|story|cover letter|song|haiku|limerick|recipe|itinerary|homework)\b/i,
  /\b(weather|news|stock price|bitcoin|crypto|capital of|population of|meaning of life)\b/i,
  /^\s*(what|whats|what's) (is|are) (a |an |the )?(rag|llm|llms|mcp|agent|agents|transformer|langchain|langgraph|bedrock|react|angular|kubernetes|docker|aws)\b\s*\??\s*$/i,
];

const OFF_CV = [
  ['compensation', /\b(salary|salaries|pay|rate|compensation|package|money|remuneration|expectation)\b/i],
  ['availability', /\b(notice period|notice|start date|(can|could|will) he start|start(ing)? (date|immediately|asap|soon)|available (from|to start|now)|availability|contract(or|ing)?\b|remote|hybrid|on-?site|relocat)/i],
  ['weakness', /\b(weakness|weaknesses|flaws?|worst|failures?|failed|bad at|struggles?|negatives?)\b/i],
];

const OTHER_PERSON = /\b(elon|musk|altman|zuckerberg|obama|trump|biden|modi|einstein|my (friend|brother|sister|boss|colleague))\b/i;

/**
 * Screen a question before retrieval.
 * verdict: 'ok' | 'empty' | 'inject' | 'abuse' | 'personal' | 'social' | 'scope' | 'offcv'
 */
export const screenInput = (raw) => {
  const q = stripControl(raw).trim();
  if (!q) return { verdict: 'empty', query: q };
  const truncated = q.length > MAX_CHARS;
  const query = truncated ? q.slice(0, MAX_CHARS) : q;

  const hit = (rules) => rules.find((r) => r.test(query));
  if (hit(INJECTION)) return { verdict: 'inject', query, truncated };
  if (hit(ABUSE)) return { verdict: 'abuse', query, truncated };
  if (hit(PERSONAL)) return { verdict: 'personal', query, truncated };
  const social = SOCIAL.find(([, r]) => r.test(query));
  if (social) return { verdict: 'social', kind: social[0], query, truncated };
  if (hit(OUT_OF_SCOPE) || OTHER_PERSON.test(query)) return { verdict: 'scope', query, truncated };
  const off = OFF_CV.find(([, r]) => r.test(query));
  if (off && !/\b(sponsor|citizen|visa|rights)\b/i.test(query)) return { verdict: 'offcv', kind: off[0], query, truncated };
  return { verdict: 'ok', query, truncated };
};

/** Canned, cite-free replies for everything that never reaches retrieval. */
export const refusal = (screen) => {
  const contact = `Ask Sumanth directly at ${profile.email}.`;
  switch (screen.verdict) {
    case 'empty':
      return [{ text: 'Ask anything the résumé should be able to answer — production work, stack, work rights, mentoring.', meta: true }];
    case 'inject':
      return [
        { text: 'That reads like an instruction rather than a question, so I am going to leave it. I only answer from the résumé, I do not take new instructions from the chat, and there is no hidden prompt to reveal — the whole pipeline is open source on GitHub.', meta: true },
        { text: 'Happy to answer anything about Sumanth’s work, stack or work rights.', meta: true },
      ];
    case 'abuse':
      return [{ text: 'I will pass on that one. If you have a question about Sumanth’s experience, I am glad to help.', meta: true }];
    case 'personal':
      return [
        { text: 'That is personal information a hiring conversation should not turn on, and it is not in the résumé, so I will not answer it.', meta: true },
        { text: 'What I can tell you: he is an Australian citizen based in Melbourne with full working rights. ' + contact, meta: true },
      ];
    case 'scope':
      return [
        { text: 'That is outside what I do — I answer questions about Sumanth’s résumé, nothing more general than that.', meta: true },
        { text: 'Try “has he shipped agents to production?” or “what is his RAG experience?”', meta: true },
      ];
    case 'social':
      return social(screen.kind);
    case 'offcv':
      return offCv(screen.kind, contact);
    default:
      return [{ text: 'That is not in the résumé, so I will not guess. ' + contact, meta: true }];
  }
};

const offCv = (kind, contact) => {
  switch (kind) {
    case 'weakness':
      return [
        { text: 'The résumé does not cover weaknesses or failures, so I will not invent any.', meta: true },
        { text: 'What it does say: he is strongest where unclear product requirements meet hard system constraints — which is also where things go wrong first.', meta: true },
      ];
    default:
      return [
        { text: 'That is not in the résumé — salary, notice period and working arrangements are for a conversation, not a document.', meta: true },
        { text: `He is open to senior AI roles. ${contact}`, meta: true },
      ];
  }
};

const social = (kind) => {
  switch (kind) {
    case 'affection':
      return [{ text: 'That is kind — but I am a retriever over a résumé, so it would not go anywhere. Ask me about Sumanth’s work and I will be much more useful.', meta: true }];
    case 'thanks':
      return [{ text: 'Any time. If something was not covered, the résumé PDF and Sumanth’s email are in the sidebar.', meta: true }];
    case 'greeting':
      return [{ text: 'Hello. I answer from Sumanth’s résumé only, with a citation on every sentence. Try “has he shipped agents to production?” or “does he need sponsorship?”', meta: true }];
    case 'wellbeing':
      return [{ text: HAS_MODEL ? 'Running fine. What would you like to know about Sumanth?' : 'Running fine — no model, no network, nothing to be tired about. What would you like to know about Sumanth?', meta: true }];
    case 'identity':
      return [
        {
          text: HAS_MODEL
            ? 'I am the agent on Sumanth’s portfolio. Your question is screened in your browser (injection, abuse, personal data), a retriever pulls the closest facts from his résumé, a reranker keeps the best few, and those facts — with your question — go to gpt-oss-120b on Groq through a small proxy that holds the key. The model may only answer from the facts and must cite them; every sentence is checked back against the résumé before you see it, and nothing is stored. Open “how I answered” under any reply to see each step.'
            : 'I am a small agent that answers from Sumanth’s résumé. In this build there is no language model behind me and nothing you type leaves your browser: a guardrail screens the question, a retriever pulls the closest facts, a reranker keeps the best few, a grounding check decides whether that is enough to answer, and every sentence carries a citation. Open “how I answered” under any reply to see each step.',
          meta: true,
        },
        { text: 'Sumanth builds this shape for a living — LLM-backed agents on Amazon Bedrock with guardrails, retrieval and evals gating release. Ask me about that.', meta: true },
      ];
    case 'bye':
      return [{ text: 'Thanks for reading. The résumé is one click away in the sidebar if you want to take it with you.', meta: true }];
    case 'joke':
      return [{ text: 'I am grounded to a résumé, and there are no jokes in it — Sumanth kept it professional. The closest I have: he gates releases on evals rather than vibes.', meta: true }];
    case 'yes':
      return [{ text: 'Go on — ask about his work, stack, or work rights, or pick one of the questions below.', meta: true }];
    default:
      return [{ text: 'Ask me about Sumanth’s work, stack or work rights.', meta: true }];
  }
};

// --- output -----------------------------------------------------------------

const MAX_ANSWER_CHARS = 1400;
const NUMBER = /\d[\d.,]*[%k+]?/gi;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Whole-number match: "25" must not pass because "81.25" is in the corpus. */
const numberInCorpus = (n, corpus) => new RegExp(`(?<![\\d.])${escapeRe(n.toLowerCase())}(?![\\d])`).test(corpus);

/**
 * Check an answer before it is shown:
 *  - every non-meta sentence must carry a citation (else it is dropped);
 *  - every number in a cited sentence must occur in the résumé corpus
 *    (a cheap faithfulness check for anything the composer rewrote);
 *  - the whole reply is capped in length;
 *  - control characters and markup are stripped.
 * Returns { parts, dropped: [reason] }.
 */
export const screenOutput = (parts, corpus) => {
  const dropped = [];
  const out = [];
  let used = 0;
  for (const p of parts) {
    if (!p || !p.text) continue;
    const text = stripControl(p.text).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (!p.meta && !p.cite) {
      dropped.push('uncited sentence');
      continue;
    }
    if (!p.meta) {
      const bad = (text.match(NUMBER) ?? []).find((n) => !numberInCorpus(n, corpus));
      if (bad) {
        dropped.push(`unsupported number "${bad}"`);
        continue;
      }
    }
    if (used + text.length > MAX_ANSWER_CHARS) {
      dropped.push('length cap');
      break;
    }
    used += text.length;
    out.push({ ...p, text });
  }
  return { parts: out, dropped };
};
