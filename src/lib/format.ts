export const UNAVAILABLE_LABEL = 'dados indisponíveis no momento';

export function formatValueOrUnavailable(value: number | string | null): string {
  return value === null ? UNAVAILABLE_LABEL : String(value);
}

export function formatDateInTimezone(isoDate: string, timezone: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

export function formatUpdatedAt(isoDate: string, timezone: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
