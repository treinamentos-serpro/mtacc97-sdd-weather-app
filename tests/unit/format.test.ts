import { describe, expect, it } from 'vitest';
import { formatDateInTimezone, formatUpdatedAt, formatValueOrUnavailable } from '../../src/lib/format';

describe('formatValueOrUnavailable', () => {
  it('returns the value when not null', () => {
    expect(formatValueOrUnavailable(42)).toBe('42');
    expect(formatValueOrUnavailable('N')).toBe('N');
  });

  it('returns the unavailable label when null', () => {
    expect(formatValueOrUnavailable(null)).toBe('dados indisponíveis no momento');
  });
});

describe('formatDateInTimezone', () => {
  it('formats a date using the given timezone', () => {
    const formatted = formatDateInTimezone('2026-08-12T12:00:00Z', 'UTC');
    expect(formatted).toContain('12');
  });
});

describe('formatUpdatedAt', () => {
  it('formats a timestamp using the given timezone', () => {
    const formatted = formatUpdatedAt('2026-08-12T12:00:00Z', 'UTC');
    expect(formatted).toMatch(/\d{2}:\d{2}/);
  });
});
