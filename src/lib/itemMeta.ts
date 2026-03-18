/** Shared types used across inventory components */

export type ItemMeta = {
  rating: number;
  tags: string[];
};

/** Ecosystem badge color classes for Tailwind */
export const ECOSYSTEM_BADGE_COLORS: Record<string, string> = {
  Hardware: "bg-primary/20 text-primary",
  Ableton: "bg-blue-500/20 text-blue-400",
  Kontakt: "bg-amber-500/20 text-amber-400",
  Reaktor: "bg-fuchsia-500/20 text-fuchsia-400",
  NI: "bg-orange-500/20 text-orange-400",
  Reason: "bg-red-500/20 text-red-400",
};
