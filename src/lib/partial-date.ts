import type { PartialDate } from './content.types';
export function partialDate(value: unknown): PartialDate | null {
  if (!value || typeof value !== 'object') return null;
  const date = value as Record<string, unknown>;
  if (!date.year) return null;
  return { year: Number(date.year), ...(date.month ? { month: Number(date.month) - 1 } : {}), ...(date.day ? { day: Number(date.day) } : {}), ...(date.time ? { time: String(date.time).slice(0, 5) } : {}) };
}
