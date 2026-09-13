import React from 'react';
import { STAGES } from '../agent/stages';

const DOT = {
  passed: 'bg-signal',
  warned: 'bg-amber-500',
  blocked: 'bg-ink',
  skipped: 'bg-line-2',
  empty: 'bg-line-2',
};

/**
 * The pipeline as a row of dots, drawn from the stage list the agent reports
 * against, so the picture cannot drift from what runs. Dots fill in as a turn
 * reaches them and only the running stage is named — seven labels do not fit a
 * single header line, and the per-answer trace below names every step anyway.
 */
const Graph = ({ trace = [], running = false }) => {
  const status = new Map(trace.map((t) => [t.name, t.status]));
  const current = running && trace.length ? trace[trace.length - 1] : null;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <ol className="flex shrink-0 items-center gap-1" aria-label="Pipeline stages">
        {STAGES.map((s, i) => {
          const state = status.get(s.name);
          const active = current?.name === s.name;
          return (
            <React.Fragment key={s.name}>
              {i ? <li aria-hidden="true" className={`h-px w-1.5 ${state ? 'bg-line-2' : 'bg-line'}`} /> : null}
              <li title={`${s.name} — ${s.blurb}`}>
                <span className={`block h-1.5 w-1.5 rounded-full ${DOT[state] ?? 'bg-line'} ${active ? 'animate-pulse-dot' : ''}`} />
                <span className="sr-only">
                  {s.name}
                  {state ? ` ${state}` : ''}
                </span>
              </li>
            </React.Fragment>
          );
        })}
      </ol>
      <span className="truncate font-mono text-[11px] text-muted" aria-hidden="true">
        {current ? current.name : 'seven steps, every one shown'}
      </span>
    </div>
  );
};

export default Graph;
