/** Format price as "NN DH" / "NN.N DH" with no trailing zeros. Never scale cents. */
export function formatPriceDh(price: number): string {
  return `${parseFloat(Number(price).toFixed(2))} DH`;
}

export function shortId(id: string, length = 8): string {
  return id.length <= length ? id : id.slice(0, length);
}

export function startOfLocalDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfLocalDayOffset(daysAgo: number, from = new Date()): Date {
  const d = startOfLocalDay(from);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export function isSameLocalDay(iso: string, day: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  );
}

/** French short datetime, e.g. "05/08/2026 14:30" */
export function formatDateTimeFr(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

/** French time only */
export function formatTimeFr(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeStyle: "short",
  }).format(new Date(iso));
}

/** Weekday short label in FR, e.g. "lun." */
export function formatWeekdayFr(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date);
}
