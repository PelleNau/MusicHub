import { useCallback, useMemo, useState } from "react";
import type { MusicHubContinuousEdit } from "@/types/musicHubContinuousEdits";

interface UseMusicHubContinuousEditLogOptions {
  maxEntries?: number;
}

export function useMusicHubContinuousEditLog(
  options: UseMusicHubContinuousEditLogOptions = {},
) {
  const { maxEntries = 200 } = options;
  const [entries, setEntries] = useState<MusicHubContinuousEdit[]>([]);

  const record = useCallback(
    (entry: Omit<MusicHubContinuousEdit, "id" | "occurredAt">) => {
      const completeEntry: MusicHubContinuousEdit = {
        ...entry,
        id: crypto.randomUUID(),
        occurredAt: new Date().toISOString(),
      };

      setEntries((previous) => [completeEntry, ...previous].slice(0, maxEntries));
      return completeEntry;
    },
    [maxEntries],
  );

  const latest = entries[0] ?? null;

  const latestByKind = useMemo(
    () =>
      Object.fromEntries(
        entries
          .map((entry) => [entry.kind, entry] as const)
          .filter(
            (value, index, array) => array.findIndex(([kind]) => kind === value[0]) === index,
          ),
      ) as Record<string, MusicHubContinuousEdit>,
    [entries],
  );

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    latest,
    latestByKind,
    record,
    clear,
  };
}
