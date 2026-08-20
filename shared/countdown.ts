export function daysUntilDate(dateValue: string, referenceDate = new Date()): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) return 0;

  const [, year, month, day] = match;
  const target = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const reference = Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  return Math.max(0, Math.ceil((target - reference) / 86_400_000));
}
