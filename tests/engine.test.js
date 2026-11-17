'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { calc, ceilTo, APTS } = require('../js/engine.js');
const data = require('../data/data.json');
const expected = require('./expected.json'); // "A pagar" tomados del Excel original

const S = { cfg: { step: 0.1 }, months: {} };
data.months.forEach(m => (S.months[m.k] = m));

test('A pagar coincide con el Excel (2025-2026)', () => {
  let n = 0;
  for (const k in expected) for (const a in expected[k]) {
    if (typeof expected[k][a] !== 'number') continue;
    assert.ok(Math.abs(calc(S, k)[a].pay - expected[k][a]) <= 0.101, `${k} dpto ${a}`); n++;
  }
  assert.ok(n > 100);
});
test('Agua y luz repartidas suman exactamente los recibos', () => {
  for (const k in S.months) {
    const c = calc(S, k), m = S.months[k];
    const w = APTS.reduce((s, a) => s + c[a].w, 0), e = APTS.reduce((s, a) => s + c[a].e, 0);
    const ded = (m.x || []).filter(x => x.ded).reduce((s, x) => s + x.amt, 0);
    const cons = APTS.reduce((s, a) => s + c[a].cons, 0);
    if (cons > 0) assert.ok(Math.abs(w - (m.w - ded)) < 0.01, 'agua ' + k);
    assert.ok(Math.abs(e - m.e) < 0.01, 'luz ' + k);
  }
});
test('Independizados (101, 201) no pagan agua', () => {
  for (const k in S.months) { const c = calc(S, k); assert.strictEqual(c['101'].w + c['201'].w, 0); }
});
test('Redondeo hacia arriba', () => { assert.strictEqual(ceilTo(14.51, 0.1).toFixed(1), '14.6'); assert.strictEqual(ceilTo(119.6, 0.1).toFixed(1), '119.6'); });
