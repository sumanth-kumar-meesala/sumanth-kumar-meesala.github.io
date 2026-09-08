import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, ChevronRight } from 'lucide-react';
import { ask as runAgent, SUGGESTED } from '../agent/pipeline';
import { ENDPOINT } from '../agent/generate';

const HAS_MODEL = Boolean(ENDPOINT);
const MODEL_NOTE = HAS_MODEL ? 'gpt-oss-120b via Groq' : 'runs in your browser · nothing is sent anywhere';
import { useTypewriter } from '../hooks/useTypewriter';

let nextId = 1;
const uid = () => nextId++;

const OPENING = {
  intent: 'opening',
  parts: [
    {
      text: 'Ask me anything a résumé should be able to answer — production work, stack, work rights, who Sumanth has mentored. Every sentence I say comes from the résumé and carries a citation you can click. If it isn’t in there, I say so — and you can open “how I answered” under any reply to see each step.',
      cite: null,
      meta: true,
    },
  ],
};

const Cite = ({ cite }) =>
  cite ? (
    <a href={`#${cite.anchor}`} className="cite" title={`Source: ${cite.label}`}>
      {cite.label}
    </a>
  ) : null;

const STATUS = {
  passed: 'bg-signal',
  warned: 'bg-amber-500',
  blocked: 'bg-ink',
  skipped: 'bg-line-2',
  empty: 'bg-line-2',
};

/** "How I answered": the pipeline's own record of each step for this reply. */
const Trace = ({ trace }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (open) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [open]);
  if (!trace?.length) return null;
  const last = trace[trace.length - 1];
  const summary = trace
    .filter((t) => t.name !== 'output check')
    .map((t) => `${t.name} ${t.status}`)
    .join(' · ');
  return (
    <div className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex min-h-[28px] items-center gap-1.5 rounded px-1 -ml-1 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-moss"
      >
        <ChevronRight className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden="true" />
        how I answered · {trace.length} steps · {last.ms} ms
      </button>
      {open ? (
        <ol ref={ref} className="mt-1.5 flex flex-col gap-1 border-l border-line pl-3">
          {trace.map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={`mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full ${STATUS[t.status] ?? 'bg-line-2'}`} aria-hidden="true" />
              <span>
                <span className="text-ink-2">{t.name}</span> — {t.detail}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <span className="sr-only">{summary}</span>
      )}
    </div>
  );
};

/** One agent turn: parts stream in as if generated, each followed by its citation. */
const AgentMessage = ({ parts, stream, onSettled }) => {
  const total = useMemo(() => parts.reduce((n, p) => n + p.text.length + 1, 0), [parts]);
  const { shown, done } = useTypewriter(total, { enabled: stream, onDone: onSettled });

  // How much of each part is visible, given the characters revealed so far.
  const visible = [];
  for (let i = 0, budget = shown; i < parts.length; i++) {
    visible.push(Math.max(0, Math.min(parts[i].text.length, budget)));
    budget -= parts[i].text.length + 1;
  }
  return (
    <div className="flex gap-3.5 md:gap-4">
      <span
        aria-hidden="true"
        className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest font-sans text-[12px] font-semibold text-mint"
      >
        S
      </span>
      <p className="pretty font-serif text-[18px] leading-[1.55] text-ink md:text-[19px]">
        {parts.map((p, i) => {
          const complete = visible[i] === p.text.length;
          return (
            <React.Fragment key={i}>
              {p.text.slice(0, visible[i])}
              {complete ? <Cite cite={p.cite} /> : null}
              {complete && i < parts.length - 1 ? ' ' : null}
            </React.Fragment>
          );
        })}
        {!done ? <span aria-hidden="true" className="ml-0.5 inline-block h-[1em] w-[7px] translate-y-[3px] animate-blink bg-moss" /> : null}
      </p>
    </div>
  );
};

const Thinking = () => (
  <div className="flex gap-3.5 md:gap-4" aria-label="Thinking">
    <span aria-hidden="true" className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest font-sans text-[12px] font-semibold text-mint">S</span>
    <span className="mt-2 inline-flex items-center gap-1.5" aria-hidden="true">
      <span className="h-1.5 w-1.5 rounded-full bg-moss animate-blink" />
      <span className="h-1.5 w-1.5 rounded-full bg-moss animate-blink [animation-delay:200ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-moss animate-blink [animation-delay:400ms]" />
    </span>
  </div>
);

const AgentTurn = ({ m, settled }) => {
  const [showTrace, setShowTrace] = useState(!m.stream);
  const onSettled = useCallback(() => {
    setShowTrace(true);
    if (m.stream) settled();
  }, [m.stream, settled]);
  if (m.pending) return <Thinking />;
  return (
    <div className="flex flex-col">
      <AgentMessage parts={m.parts} stream={m.stream} onSettled={onSettled} />
      {showTrace && m.trace ? (
        <div className="pl-[46px] md:pl-[48px]">
          <Trace trace={m.trace} />
        </div>
      ) : null}
    </div>
  );
};

const UserMessage = ({ text }) => (
  <div className="flex justify-end">
    <div className="max-w-[85%] rounded-[14px_14px_4px_14px] bg-ink px-4 py-3 text-[15px] leading-snug text-paper md:max-w-[560px] md:text-[16px]">{text}</div>
  </div>
);

/**
 * The conversation. Local state only: the agent is a deterministic retriever
 * over resume.js, so nothing leaves the page and nothing is stored.
 */
const AskPanel = () => {
  const [messages, setMessages] = useState(() => [{ id: uid(), role: 'agent', ...OPENING, stream: false }]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const historyRef = useRef([]);
  const logRef = useRef(null);
  const inputRef = useRef(null);

  const asked = useMemo(() => new Set(messages.filter((m) => m.role === 'user').map((m) => m.text)), [messages]);
  const prompts = useMemo(() => SUGGESTED.filter((s) => !asked.has(s)).slice(0, busy ? 0 : 4), [asked, busy]);

  // Asking mid-stream is allowed: the previous answer simply finishes at once.
  const ask = useCallback(async (text) => {
    const q = text.trim();
    if (!q) return;
    setBusy(true);
    setDraft('');
    const pendingId = uid();
    setMessages((m) => [
      ...m.map((x) => (x.stream ? { ...x, stream: false } : x)),
      { id: uid(), role: 'user', text: q },
      { id: pendingId, role: 'agent', pending: true, parts: [] },
    ]);
    const a = await runAgent(q, historyRef.current);
    const answerText = a.parts.map((p) => p.text).join(' ');
    historyRef.current = [...historyRef.current.slice(-5), { query: q, answer: answerText, tokens: a.tokens, intent: a.intent }];
    setMessages((m) => m.map((x) => (x.id === pendingId ? { id: pendingId, role: 'agent', ...a, stream: true } : x)));
  }, []);

  const settled = useCallback(() => setBusy(false), []);

  // Keep the newest turn in view as it streams.
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <section id="ask" aria-label="Ask my résumé" className="flex min-h-[80vh] flex-col lg:h-screen">
      <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 md:px-10">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-signal animate-pulse-dot" aria-hidden="true" />
          <span className="whitespace-nowrap text-[14px] font-medium">Ask my résumé</span>
          <span className="hidden truncate font-mono text-[11px] text-muted lg:inline">· guardrails → retrieve → rerank → generate → verify</span>
        </div>
        <span className="hidden whitespace-nowrap font-mono text-[11px] text-muted md:inline">{MODEL_NOTE}</span>
      </div>

      <div ref={logRef} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-[760px] flex-col gap-7">
          {messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="animate-rise">
                <UserMessage text={m.text} />
              </div>
            ) : (
              <div key={m.id} className="animate-rise">
                <AgentTurn m={m} settled={settled} />
              </div>
            ),
          )}
        </div>
      </div>

      <div className="border-t border-line bg-paper px-6 pb-6 pt-4 md:px-10">
        <div className="mx-auto flex max-w-[760px] flex-col gap-3.5">
          {prompts.length ? (
            <ul className="flex flex-wrap gap-2" aria-label="Suggested questions">
              {prompts.map((s) => (
                <li key={s}>
                  <button type="button" className="chip" onClick={() => ask(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(draft);
              inputRef.current?.focus();
            }}
            className="flex items-center gap-2 rounded-xl border border-line-2 bg-card py-1.5 pl-4 pr-1.5 focus-within:border-forest"
          >
            <label htmlFor="ask-input" className="sr-only">
              Ask about Sumanth's experience
            </label>
            <input
              id="ask-input"
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything about Sumanth's experience…"
              autoComplete="off"
              enterKeyHint="send"
              className="h-11 min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Ask"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-forest text-cream transition-colors hover:bg-forest-2 disabled:bg-line disabled:text-muted"
            >
              <ArrowUp className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </form>
          <p className="font-mono text-[11px] leading-relaxed text-muted">
            Answers are grounded in the résumé and every sentence is checked against it. If it isn't in there, the agent says so.{' '}
            {HAS_MODEL ? 'Your question and the retrieved facts are sent to the model; nothing is stored.' : 'Everything runs in your browser.'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AskPanel;
