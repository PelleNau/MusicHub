export function volumeToDb(v: number): string {
  if (v <= 0) return "-∞";
  const db = 20 * Math.log10(v);
  if (db <= -70) return "-∞";
  return `${db > 0 ? "+" : ""}${db.toFixed(1)}`;
}

export function panToDisplay(p: number): string {
  if (Math.abs(p) < 0.02) return "C";
  return p < 0 ? `${Math.round(Math.abs(p) * 50)}L` : `${Math.round(p * 50)}R`;
}
