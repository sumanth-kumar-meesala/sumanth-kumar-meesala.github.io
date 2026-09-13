// The judge is the one place the agent reasons about its own output, so its
// parser has to be paranoid: a broken judge must read as "no opinion", never
// as a confident verdict in either direction.

import { describe, it, expect } from 'vitest';
import { parseVerdict, buildJudgeMessages, JUDGE_PASS } from './src/judge.js';

const good = { grounded: true, complete: true, score: 0.9, reason: 'cited throughout', missing: [] };

describe('parseVerdict', () => {
  it('reads a well-formed verdict', () => {
    expect(parseVerdict(JSON.stringify(good))).toEqual(good);
  });

  it('digs the object out of prose or a code fence', () => {
    expect(parseVerdict('Sure!\n```json\n' + JSON.stringify(good) + '\n```')).toEqual(good);
  });

  it('returns no opinion for junk rather than guessing', () => {
    for (const junk of ['', '   ', 'not json', '[1,2]', 'null', '{"score":', undefined, null]) {
      expect(parseVerdict(junk)).toBeNull();
    }
  });

  it('coerces out-of-range and wrong-typed fields instead of failing', () => {
    const v = parseVerdict(JSON.stringify({ grounded: 'yes', complete: 1, score: 42, reason: 7, missing: 'nope' }));
    expect(v.score).toBe(1);
    expect(v.grounded).toBe(true);
    expect(Array.isArray(v.missing)).toBe(true);
  });

  it('caps and normalises the missing terms', () => {
    const v = parseVerdict(JSON.stringify({ ...good, missing: ['  RAG ', 'Bedrock', '', 'a', 'b', 'c', 'd'] }));
    expect(v.missing.length).toBeLessThanOrEqual(5);
    expect(v.missing).toContain('rag');
    expect(v.missing).not.toContain('');
  });

  it('keeps a genuinely bad score bad', () => {
    const v = parseVerdict(JSON.stringify({ grounded: false, complete: false, score: 0.2, reason: 'invented a number', missing: ['salary'] }));
    expect(v.score).toBeLessThan(JUDGE_PASS);
    expect(v.missing).toEqual(['salary']);
  });
});

describe('buildJudgeMessages', () => {
  it('shows the judge the facts, the question and the answer, and nothing else', () => {
    const msgs = buildJudgeMessages({ question: 'citizen?', answer: 'He is a citizen.', facts: [{ text: 'Australian citizen' }] });
    expect(msgs[0].role).toBe('system');
    expect(msgs).toHaveLength(2);
    expect(msgs[1].content).toContain('[1] Australian citizen');
    expect(msgs[1].content).toContain('citizen?');
    expect(msgs[1].content).toContain('He is a citizen.');
  });
});
