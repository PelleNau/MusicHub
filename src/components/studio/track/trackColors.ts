/* ── Ableton-style color palette ── */
export const TRACK_COLORS: Record<number, string> = {
  0: "hsl(0,75%,50%)", 1: "hsl(20,85%,50%)", 2: "hsl(40,90%,50%)",
  3: "hsl(50,90%,50%)", 4: "hsl(75,65%,45%)", 5: "hsl(120,55%,40%)",
  6: "hsl(155,80%,40%)", 7: "hsl(190,70%,45%)", 8: "hsl(210,70%,50%)",
  9: "hsl(240,55%,50%)", 10: "hsl(270,55%,50%)", 11: "hsl(300,50%,50%)",
  12: "hsl(330,60%,50%)", 13: "hsl(345,70%,50%)", 14: "hsl(55,85%,55%)",
  15: "hsl(80,60%,45%)", 16: "hsl(340,75%,55%)", 17: "hsl(25,90%,55%)",
  18: "hsl(166,80%,45%)", 19: "hsl(200,65%,50%)", 20: "hsl(280,60%,55%)",
};

export function getTrackColor(idx: number) {
  return TRACK_COLORS[idx % 21] || "hsl(0,0%,40%)";
}
