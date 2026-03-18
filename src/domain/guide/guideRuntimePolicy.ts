import type { GuideObservationWindow } from "@/domain/guide/guideObservationBuffer";

export const DEFAULT_GUIDE_OBSERVATION_WINDOW: GuideObservationWindow = {
  maxCommands: 120,
  maxAcks: 120,
  maxContinuousEdits: 120,
  maxEvents: 60,
};

export const GUIDE_OBSERVATION_WINDOW_BY_LAYOUT = {
  beginner: {
    maxCommands: 80,
    maxAcks: 80,
    maxContinuousEdits: 80,
    maxEvents: 40,
  },
  guided: {
    maxCommands: 120,
    maxAcks: 120,
    maxContinuousEdits: 120,
    maxEvents: 60,
  },
  pro: {
    maxCommands: 160,
    maxAcks: 160,
    maxContinuousEdits: 160,
    maxEvents: 80,
  },
} satisfies Record<string, GuideObservationWindow>;

export function resolveGuideObservationWindow(layoutMode?: string): GuideObservationWindow {
  if (!layoutMode) {
    return DEFAULT_GUIDE_OBSERVATION_WINDOW;
  }

  return GUIDE_OBSERVATION_WINDOW_BY_LAYOUT[layoutMode as keyof typeof GUIDE_OBSERVATION_WINDOW_BY_LAYOUT]
    ?? DEFAULT_GUIDE_OBSERVATION_WINDOW;
}
