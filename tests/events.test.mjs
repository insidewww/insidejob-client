import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partialDate } from '../src/lib/partial-date.ts';
import { isUpcoming, isExpired, parseDate } from '../src/utils/helpers.ts';
const now = new Date(2026, 9, 22, 12, 0);
const date = (year, month, day, time) => ({ year, month, day, ...(time ? { time } : {}) });
test('ACF dates use human month numbers; frontend retains January = 0', () => {
  assert.deepEqual(partialDate({ year: '2026', month: '1', day: '2', time: '09:15:00' }), date(2026, 0, 2, '09:15'));
  assert.deepEqual(partialDate({ year: 2026, month: '', day: '', time: '' }), { year: 2026 });
  assert.equal(partialDate({ year: '', month: '', day: '' }), null);
  assert.equal(partialDate(false), null);
  assert.match(parseDate(partialDate({ year: 2026, month: 1, day: 2 })), /2 January 2026/);
});
test('future, ongoing and expired events preserve the existing calendar rules', () => {
  const future = { start_date: date(2026, 10, 1), end_date: null };
  const ongoing = { start_date: date(2026, 9, 1), end_date: date(2026, 10, 1) };
  const ended = { start_date: date(2026, 9, 1), end_date: date(2026, 9, 20) };
  assert.equal(isUpcoming(future, now), true);
  assert.equal(isUpcoming(ongoing, now), false);
  assert.equal(isExpired(ongoing, now), false);
  assert.equal(isExpired(ended, now), true);
});
test('no end date remains ongoing; no start is not upcoming; exact boundary stays visible', () => {
  assert.equal(isExpired({ start_date: date(2020, 0, 1), end_date: null }, now), false);
  assert.equal(isUpcoming({ start_date: null }, now), false);
  assert.equal(isExpired({ end_date: date(2026, 9, 22, '12:00') }, now), false);
  assert.equal(isExpired({ end_date: date(2026, 9, 22) }, now), true);
  assert.equal(isUpcoming({ start_date: date(2026, 9, 22, '12:00') }, now), false);
});
