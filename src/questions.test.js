import test from 'node:test';
import assert from 'node:assert/strict';
import { originalTest, freshTest } from './questions.js';

// Worked by hand from the screenshots, separately from the code that computes the key.
const KEY = [
  '11000 1110',
  '1001 1111',
  '1620AC',
  '7D800',
  '245F',
  '45020',
  '1001 1111 0011',
  '4059',
  '1111 0100 0100',
  '1110 1110 1100',
  '10001110',
  '11011111',
  '00100001',
  '00000001',
  'A',
  '101 0100',
  '1101 0101 1011',
  'DF',
  '1000 0010',
  '100 0010',
];

test('computed key for the original test matches the hand-worked answers', () => {
  assert.deepEqual(
    originalTest().map((q) => q.options[q.answer]),
    KEY,
  );
});

test('generated tests always have 20 well-formed questions', () => {
  for (let i = 0; i < 1000; i++) {
    const t = freshTest();
    assert.equal(t.length, 20);
    for (const q of t) {
      assert.equal(new Set(q.options).size, 4, q.q);
      assert.ok(q.answer >= 0, q.q);
      assert.doesNotMatch(q.q + q.why + q.options, /NaN|undefined/, q.q);
    }
    const even = t[18].options[t[18].answer].replace(/[^1]/g, '').length % 2 === 0;
    assert.ok(even, t[18].q);
  }
});
