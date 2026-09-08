import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { answer, SUGGESTED } from '../agent/retriever';
import { useTypewriter } from '../hooks/useTypewriter';

let nextId = 1;
const uid = () => nextId++;

const OPENING = {
  intent: 'opening',
  parts: [
    {
      text: 'Ask me anything a résumé should be able to answer — production work, stack, work rights, who Sumanth has mentored. Every sentence I say comes from the résumé and carries a citation you can click. If it isn’t in there, I say so.',
      cite: null,
    },
  ],
};

const Cite = ({ cite }) =>
  cite ? (
    <a href={`#${cite.anchor}`} className="cite" title={`Source: ${cite.label}`}>
      {cite.label}
    </a>
  ) : null;

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
  const logRef = useRef(null);
  const inputRef = useRef(null);

  const asked = useMemo(() => new Set(messages.filter((m) => m.role === 'user').map((m) => m.text)), [messages]);
  const prompts = useMemo(() => SUGGESTED.filter((s) => !asked.has(s)).slice(0, busy ? 0 : 4), [asked, busy]);

  // Asking mid-stream is allowed: the previous answer simply finishes at once.
  const ask = useCallback((text) => {
    const q = text.trim();
    if (!q) return;
    setBusy(true);
    setDraft('');
    const a = answer(q);
    setMessages((m) => [
      ...m.map((x) => (x.stream ? { ...x, stream: false } : x)),
      { id: uid(), role: 'user', text: q },
      { id: uid(), role: 'agent', ...a, stream: true },
    ]);
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
          <span className="text-[14px] font-medium">Ask my résumé</span>
          <span className="hidden truncate font-mono text-[11px] text-muted md:inline">· an agent grounded in the CV, every answer cited</span>
        </div>
        <span className="hidden font-mono text-[11px] text-muted md:inline">runs in your browser · nothing is sent anywhere</span>
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
                <AgentMessage parts={m.parts} stream={m.stream} onSettled={m.stream ? settled : undefined} />
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
            Answers come only from the résumé and linked projects. If it isn't in there, the agent says so.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AskPanel;
