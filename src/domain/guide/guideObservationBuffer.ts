import type {
  GuideObservationBuffer,
  GuideRuntimeEvent,
  GuideSelectorSnapshot,
} from "@/types/musicHubGuideRuntime";
import type { MusicHubCommand, MusicHubCommandAck } from "@/types/musicHubCommands";
import type { MusicHubContinuousEdit } from "@/types/musicHubContinuousEdits";

export interface GuideObservationWindow {
  maxCommands?: number;
  maxAcks?: number;
  maxContinuousEdits?: number;
  maxEvents?: number;
}

function takeRecent<T>(values: T[], maxCount: number | undefined): T[] {
  if (typeof maxCount !== "number") return values;
  return values.slice(0, Math.max(0, maxCount));
}

export function createGuideObservationBuffer(input: {
  selectors: GuideSelectorSnapshot;
  commands: MusicHubCommand[];
  acknowledgments: MusicHubCommandAck[];
  continuousEdits?: MusicHubContinuousEdit[];
  events?: GuideRuntimeEvent[];
  window?: GuideObservationWindow;
}): GuideObservationBuffer {
  const {
    selectors,
    commands,
    acknowledgments,
    continuousEdits = [],
    events = [],
    window,
  } = input;

  return {
    selectors,
    commands: takeRecent(commands, window?.maxCommands),
    acknowledgments: takeRecent(acknowledgments, window?.maxAcks),
    continuousEdits: takeRecent(continuousEdits, window?.maxContinuousEdits),
    events: takeRecent(events, window?.maxEvents),
  };
}
