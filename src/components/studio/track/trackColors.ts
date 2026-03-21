/* ── Ableton-style color palette ── */
export const TRACK_COLORS: Record<number, string> = {
  0: "hsl(358, 84%, 58%)",
  1: "hsl(18, 92%, 56%)",
  2: "hsl(48, 90%, 68%)",
  3: "hsl(48, 92%, 61%)",
  4: "hsl(80, 58%, 46%)",
  5: "hsl(164, 62%, 42%)",
  6: "hsl(154, 70%, 44%)",
  7: "hsl(191, 67%, 52%)",
  8: "hsl(210, 78%, 58%)",
  9: "hsl(178, 52%, 56%)",
  10: "hsl(154, 71%, 42%)",
  11: "hsl(166, 56%, 55%)",
  12: "hsl(286, 58%, 56%)",
  13: "hsl(353, 86%, 56%)",
  14: "hsl(52, 92%, 64%)",
  15: "hsl(86, 56%, 46%)",
  16: "hsl(340, 82%, 60%)",
  17: "hsl(27, 95%, 57%)",
  18: "hsl(171, 66%, 48%)",
  19: "hsl(198, 70%, 55%)",
  20: "hsl(268, 62%, 60%)",
};

export function getTrackColor(idx: number) {
  return TRACK_COLORS[idx % 21] || "hsl(0,0%,40%)";
}
