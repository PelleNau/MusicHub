import { useMemo } from "react";
import { getStudioLessonById } from "@/content/lessons/studio";
import { resolveGuideObservationWindow } from "@/domain/guide/guideRuntimePolicy";
import {
  createGuideSelectorSnapshot,
  createStudioGuideAnchorRegistry,
  type StudioGuideBridgeInput,
} from "@/domain/studio/studioGuideBridge";
import { useGuideRuntime } from "@/hooks/useGuideRuntime";
import { useGuideRuntimeCommandSync } from "@/hooks/useGuideRuntimeCommandSync";
import type { MusicHubCommandLogEntry } from "@/hooks/useMusicHubCommandLog";
import type { MusicHubContinuousEdit } from "@/types/musicHubContinuousEdits";
import type { MusicHubCommandAck, MusicHubCommand } from "@/types/musicHubCommands";
import type { GuideRuntimeEvent } from "@/types/musicHubGuideRuntime";

interface UseStudioGuideBridgeOptions extends StudioGuideBridgeInput {
  lessonId?: string | null;
  commandEntries: MusicHubCommandLogEntry[];
  continuousEditEntries?: MusicHubContinuousEdit[];
  events?: GuideRuntimeEvent[];
  onCommandRecorded?: (command: MusicHubCommand, ack: MusicHubCommandAck) => void;
}

export function useStudioGuideBridge({
  lessonId,
  commandEntries,
  continuousEditEntries = [],
  events = [],
  onCommandRecorded,
  ...bridgeInput
}: UseStudioGuideBridgeOptions) {
  const {
    transportSummary,
    connectionSummary,
    panelState,
    selectionSummary,
    pianoRollState,
    detailPanelState,
    trackViewStateById,
    displayTracks,
    displayReturnTracks,
  } = bridgeInput;

  const lesson = useMemo(() => getStudioLessonById(lessonId), [lessonId]);

  const selectorSnapshot = useMemo(
    () =>
      createGuideSelectorSnapshot({
        transportSummary,
        connectionSummary,
        panelState,
        selectionSummary,
        pianoRollState,
        detailPanelState,
        trackViewStateById,
        displayTracks,
        displayReturnTracks,
      }),
    [
      connectionSummary,
      detailPanelState,
      displayReturnTracks,
      displayTracks,
      panelState,
      pianoRollState,
      selectionSummary,
      trackViewStateById,
      transportSummary,
    ],
  );

  const anchorRegistry = useMemo(
    () =>
      createStudioGuideAnchorRegistry({
        transportSummary,
        connectionSummary,
        panelState,
        selectionSummary,
        pianoRollState,
        detailPanelState,
        trackViewStateById,
        displayTracks,
        displayReturnTracks,
      }),
    [
      connectionSummary,
      detailPanelState,
      displayReturnTracks,
      displayTracks,
      panelState,
      pianoRollState,
      selectionSummary,
      trackViewStateById,
      transportSummary,
    ],
  );

  const observationWindow = useMemo(
    () => resolveGuideObservationWindow(lesson?.layoutMode),
    [lesson?.layoutMode],
  );

  const boundedCommandEntries = useMemo(() => {
    const maxEntries = Math.max(
      observationWindow.maxCommands ?? 0,
      observationWindow.maxAcks ?? 0,
      1,
    );
    return commandEntries.slice(0, maxEntries);
  }, [commandEntries, observationWindow.maxAcks, observationWindow.maxCommands]);

  const boundedEvents = useMemo(() => {
    const maxEvents = observationWindow.maxEvents;
    if (typeof maxEvents !== "number") return events;
    return events.slice(0, maxEvents);
  }, [events, observationWindow.maxEvents]);

  const boundedContinuousEdits = useMemo(() => {
    const maxContinuousEdits = observationWindow.maxContinuousEdits;
    if (typeof maxContinuousEdits !== "number") return continuousEditEntries;
    return continuousEditEntries.slice(0, maxContinuousEdits);
  }, [continuousEditEntries, observationWindow.maxContinuousEdits]);

  const runtime = useGuideRuntime({
    lesson,
    selectors: selectorSnapshot,
    commandEntries: boundedCommandEntries,
    continuousEditEntries: boundedContinuousEdits,
    events: boundedEvents,
    anchorRegistry,
  });

  useGuideRuntimeCommandSync({
    lesson,
    runtime,
    onCommandRecorded,
  });

  return {
    lesson,
    selectorSnapshot,
    anchorRegistry,
    observationWindow,
    runtime,
  };
}

export type StudioGuideBridgeResult = ReturnType<typeof useStudioGuideBridge>;
