import type {
  GuideAnchorRegistryEntry,
  GuideSelectorSnapshot,
} from "@/types/musicHubGuideRuntime";
import type {
  StudioConnectionSummary,
  StudioDetailPanelState,
  StudioPanelState,
  StudioPianoRollState,
  StudioSelectionSummary,
  StudioTrackViewState,
  StudioTransportSummary,
} from "@/domain/studio/studioViewContracts";
import type { SessionTrack } from "@/types/studio";

export interface StudioGuideBridgeInput {
  transportSummary: StudioTransportSummary;
  connectionSummary: StudioConnectionSummary;
  panelState: StudioPanelState;
  selectionSummary: StudioSelectionSummary;
  pianoRollState: StudioPianoRollState;
  detailPanelState: StudioDetailPanelState;
  trackViewStateById: Record<string, StudioTrackViewState>;
  displayTracks: SessionTrack[];
  displayReturnTracks: SessionTrack[];
}

export function createGuideSelectorSnapshot(input: StudioGuideBridgeInput): GuideSelectorSnapshot {
  const {
    transportSummary,
    connectionSummary,
    panelState,
    selectionSummary,
    pianoRollState,
    detailPanelState,
    trackViewStateById,
  } = input;

  return {
    transport: transportSummary,
    connection: connectionSummary,
    panel: panelState,
    selection: selectionSummary,
    pianoRoll: pianoRollState,
    detailPanel: detailPanelState,
    trackViewStateById,
  };
}

export function createStudioGuideAnchorRegistry(
  input: StudioGuideBridgeInput,
): GuideAnchorRegistryEntry[] {
  const {
    panelState,
    selectionSummary,
    pianoRollState,
    detailPanelState,
    displayTracks,
    displayReturnTracks,
  } = input;

  const entries: GuideAnchorRegistryEntry[] = [
    {
      id: "panel:browser",
      targetType: "panel",
      targetId: "browser",
      available: true,
      panel: "browser",
    },
    {
      id: "panel:timeline",
      targetType: "panel",
      targetId: "timeline",
      available: true,
      panel: "timeline",
      highlights: ["loopRegion"],
    },
    {
      id: "panel:detail",
      targetType: "panel",
      targetId: "detail",
      available: Boolean(panelState.selectedTrackId && !panelState.showPianoRoll && !panelState.showMixer),
      panel: "detail",
      highlights: ["deviceChain", "pluginSlot", "pitchControl"],
    },
    {
      id: "panel:mixer",
      targetType: "panel",
      targetId: "mixer",
      available: panelState.showMixer,
      panel: "mixer",
    },
    {
      id: "panel:pianoRoll",
      targetType: "panel",
      targetId: "pianoRoll",
      available: panelState.showPianoRoll,
      panel: "pianoRoll",
      highlights: ["noteGrid", "velocityLane", "clipHeader"],
    },
    {
      id: "panel:lesson",
      targetType: "lesson-panel",
      targetId: "lesson",
      available: true,
      panel: "lesson",
    },
    {
      id: "transport:play",
      targetType: "panel",
      targetId: "transport.play",
      available: true,
      panel: "timeline",
      highlights: ["transportPlay"],
    },
    {
      id: "transport:stop",
      targetType: "panel",
      targetId: "transport.stop",
      available: true,
      panel: "timeline",
      highlights: ["transportStop"],
    },
    {
      id: "transport:tempo",
      targetType: "panel",
      targetId: "transport.tempo",
      available: true,
      panel: "timeline",
      highlights: ["tempoControl"],
    },
  ];

  for (const track of displayTracks) {
    entries.push(
      {
        id: `track:${track.id}`,
        targetType: "track",
        targetId: track.id,
        available: true,
        panel: "timeline",
        highlights: ["trackHeader", "muteToggle", "soloToggle"],
        metadata: { trackType: track.type },
      },
      {
        id: `track-header:${track.id}`,
        targetType: "track-header",
        targetId: track.id,
        available: true,
        panel: "timeline",
      },
      {
        id: `track-lane:${track.id}`,
        targetType: "track-lane",
        targetId: track.id,
        available: true,
        panel: "timeline",
      },
      {
        id: `mixer-strip:${track.id}`,
        targetType: "mixer-strip",
        targetId: track.id,
        available: panelState.showMixer,
        panel: "mixer",
      },
    );
  }

  for (const clip of displayTracks.flatMap((track) => track.clips || [])) {
    entries.push({
      id: `clip:${clip.id}`,
      targetType: "clip",
      targetId: clip.id,
      available: true,
      panel: clip.is_midi ? "pianoRoll" : "timeline",
      highlights: clip.is_midi ? ["clipHeader"] : undefined,
      metadata: { trackId: clip.track_id },
    });
  }

  if (selectionSummary.selectedTrack) {
    entries.push({
      id: `selected-track:${selectionSummary.selectedTrack.id}`,
      targetType: "track",
      targetId: selectionSummary.selectedTrack.id,
      available: true,
      panel: panelState.showMixer ? "mixer" : "timeline",
    });
  }

  if (selectionSummary.selectedClip) {
    entries.push({
      id: `selected-clip:${selectionSummary.selectedClip.id}`,
      targetType: "clip",
      targetId: selectionSummary.selectedClip.id,
      available: true,
      panel: panelState.showPianoRoll ? "pianoRoll" : "timeline",
    });
  }

  if (detailPanelState.track) {
    entries.push({
      id: `detail-track:${detailPanelState.track.id}`,
      targetType: "track",
      targetId: detailPanelState.track.id,
      available: detailPanelState.isConnected || Boolean(detailPanelState.track),
      panel: "detail",
      highlights: ["deviceChain", "pluginSlot"],
    });
  }

  if (pianoRollState.clip) {
    entries.push({
      id: `pianoroll-clip:${pianoRollState.clip.id}`,
      targetType: "clip",
      targetId: pianoRollState.clip.id,
      available: panelState.showPianoRoll,
      panel: "pianoRoll",
      highlights: ["noteGrid", "velocityLane"],
    });
  }

  for (const returnTrack of displayReturnTracks) {
    entries.push({
      id: `send:${returnTrack.id}`,
      targetType: "send",
      targetId: returnTrack.id,
      available: true,
      panel: panelState.showMixer ? "mixer" : "timeline",
    });
  }

  return entries;
}
