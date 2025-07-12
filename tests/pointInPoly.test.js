import test from 'node:test';
import assert from 'node:assert/strict';

global.window = global.window || {};

const { pointInPoly } = await import('../js/world.js');

const square = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 }
];

test('returns true for a point inside the polygon', () => {
  assert.strictEqual(pointInPoly(5, 5, square), true);
});

test('returns false for a point outside the polygon', () => {
  assert.strictEqual(pointInPoly(15, 5, square), false);
});
