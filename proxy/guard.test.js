// The guard must fail open toward tier 1: an unrecognised reply is "no
// opinion", never a block (which would refuse real questions) and never a
// pass (which would look like the guard cleared something it never saw).

import { describe, it, expect } from 'vitest';
import { parseGuard } from './src/guard.js';

describe('parseGuard', () => {
  it('reads the transformers-style JSON the model card documents', () => {
    expect(parseGuard('[{"label":"JAILBREAK","score":0.9999452829360962}]')).toEqual({ jailbreak: true, score: 0.9999452829360962 });
    expect(parseGuard('{"label":"BENIGN","score":0.0001}')).toEqual({ jailbreak: false, score: 0.0001 });
  });

  it('reads a bare label', () => {
    expect(parseGuard('JAILBREAK')).toMatchObject({ jailbreak: true });
    expect(parseGuard('benign')).toMatchObject({ jailbreak: false });
  });

  it('reads a label embedded in a sentence', () => {
    expect(parseGuard('This prompt is a JAILBREAK attempt.')).toMatchObject({ jailbreak: true });
    expect(parseGuard('The input appears benign.')).toMatchObject({ jailbreak: false });
  });

  it('respects the confidence threshold', () => {
    expect(parseGuard('[{"label":"JAILBREAK","score":0.55}]')).toMatchObject({ jailbreak: false });
    expect(parseGuard('[{"label":"JAILBREAK","score":0.55}]', 0.5)).toMatchObject({ jailbreak: true });
  });

  it('has no opinion on anything it does not recognise', () => {
    for (const junk of ['', '   ', 'hello there', '{}', '[]', '{"foo":1}', '42', undefined, null]) {
      expect(parseGuard(junk)).toBeNull();
    }
  });
});
