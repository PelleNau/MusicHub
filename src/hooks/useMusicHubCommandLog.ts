import { useCallback, useMemo, useState } from "react";
import type { MusicHubCommand, MusicHubCommandAck } from "@/types/musicHubCommands";
import type { GuideObservationBuffer, GuideRuntimeEvent, GuideSelectorSnapshot } from "@/types/musicHubGuideRuntime";
import { createGuideObservationBuffer, type GuideObservationWindow } from "@/domain/guide/guideObservationBuffer";
import type { MusicHubContinuousEdit } from "@/types/musicHubContinuousEdits";

export interface MusicHubCommandLogEntry {
  command: MusicHubCommand;
  ack: MusicHubCommandAck;
  recordedAt: string;
}

interface UseMusicHubCommandLogOptions {
  maxEntries?: number;
}

interface BuildGuideObservationOptions {
  selectors: GuideSelectorSnapshot;
  continuousEdits?: MusicHubContinuousEdit[];
  events?: GuideRuntimeEvent[];
  window?: GuideObservationWindow;
}

export function useMusicHubCommandLog(options: UseMusicHubCommandLogOptions = {}) {
  const { maxEntries = 100 } = options;
  const [entries, setEntries] = useState<MusicHubCommandLogEntry[]>([]);

  const record = useCallback((command: MusicHubCommand, ack: MusicHubCommandAck) => {
    const entry: MusicHubCommandLogEntry = {
      command,
      ack,
      recordedAt: new Date().toISOString(),
    };

    setEntries((previous) => {
      const next = [entry, ...previous];
      return next.slice(0, maxEntries);
    });
  }, [maxEntries]);

  const latest = entries[0] ?? null;

  const latestByType = useMemo(
    () =>
      Object.fromEntries(
        entries.map((entry) => [entry.command.type, entry]).filter(
          (value, index, array) => array.findIndex(([type]) => type === value[0]) === index,
        ),
      ) as Record<string, MusicHubCommandLogEntry>,
    [entries],
  );

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  const buildGuideObservation = useCallback(
    ({
      selectors,
      continuousEdits = [],
      events = [],
      window,
    }: BuildGuideObservationOptions): GuideObservationBuffer =>
      createGuideObservationBuffer({
        selectors,
        commands: entries.map((entry) => entry.command),
        acknowledgments: entries.map((entry) => entry.ack),
        continuousEdits,
        events,
        window,
      }),
    [entries],
  );

  return {
    entries,
    latest,
    latestByType,
    record,
    clear,
    buildGuideObservation,
  };
}
