export default function computeTrueWeek(): number {
  const now: any = new Date();
  const start: any = new Date(now.getFullYear(), 0, 0);
  const diff: any = now - start;

  const dayMilliseconds = 1000 * 60 * 60 * 24;
  const yearDate = Math.trunc(diff / dayMilliseconds);
  const daysSinceSunday = now.getDay();

  const trueWeek = Math.trunc(1 + (yearDate - daysSinceSunday) / 7);

  return trueWeek;
}
