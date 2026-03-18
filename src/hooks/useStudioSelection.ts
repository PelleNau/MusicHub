import { useCallback, useMemo, useState } from "react";

export function useStudioSelection() {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedClipIds, setSelectedClipIds] = useState<Set<string>>(new Set());
  const [bottomTab, setBottomTab] = useState<"editor" | "mixer">("editor");

  const activeClipId = useMemo(() => {
    if (selectedClipIds.size === 1) return [...selectedClipIds][0];
    return null;
  }, [selectedClipIds]);

  const clearSelectedClipIds = useCallback(() => {
    setSelectedClipIds(new Set());
  }, []);

  return {
    selectedTrackId,
    setSelectedTrackId,
    selectedClipIds,
    setSelectedClipIds,
    clearSelectedClipIds,
    bottomTab,
    setBottomTab,
    activeClipId,
  };
}
