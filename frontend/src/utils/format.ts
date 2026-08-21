/** Formatiranje datuma, vremena i novca za srpski (latinični) locale. */

const LOCALE = "sr-Latn-RS";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", year: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "RSD",
  maximumFractionDigits: 0,
});

/** "2026-07-01" -> "1. jul 2026." */
export function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(date.getTime()) ? isoDate : dateFormatter.format(date);
}

/** ISO timestamp -> "1. jul 2026. 14:30" */
export function formatDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  return Number.isNaN(date.getTime()) ? isoTimestamp : dateTimeFormatter.format(date);
}

export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

/** "14:30:00" -> "14:30" */
export function formatTime(time: string): string {
  return time?.slice(0, 5) ?? "";
}

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/** Broj noćenja/dana između dva datuma, uključivo. */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

/** "Vasilije Vasić" -> "VV" (za avatar). */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
