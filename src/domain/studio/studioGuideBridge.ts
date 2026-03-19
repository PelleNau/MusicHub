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
    displayTracks,
  } = input;

  return {
    transport: transportSummary,
    connection: connectionSummary,
    panel: panelState,
    panels: {
      pianoRoll: panelState.showPianoRoll,
      mixer: panelState.showMixer,
      bottomWorkspace: panelState.showBottomWorkspace,
      selectedTrackId: panelState.selectedTrackId,
      activeClipId: panelState.activeClipId,
    },
    selection: {
      ...selectionSummary,
      selectedClipIds: Array.from(panelState.selectedClipIds),
      selectedTrackId: panelState.selectedTrackId,
    },
    tracks: {
      count: Object.keys(trackViewStateById).length,
      items: Object.entries(trackViewStateById).map(([trackId, state]) => ({
        id: trackId,
        type:
          displayTracks.find((track) => track.id === trackId)?.type ?? "audio",
        muted: state.muted,
        solo: state.solo,
        selected: state.selected,
        nativeArmed: state.nativeArmed,
        nativeMonitoring: state.nativeMonitoring,
      })),
      firstMidiTrack: (() => {
        const track = displayTracks.find((candidate) => candidate.type === "midi");
        if (!track) return undefined;
        const state = trackViewStateById[track.id];
        return {
          id: track.id,
          type: track.type,
          muted: state?.muted ?? false,
          solo: state?.solo ?? false,
          selected: state?.selected ?? false,
          nativeArmed: state?.nativeArmed ?? false,
          nativeMonitoring: state?.nativeMonitoring ?? false,
        };
      })(),
      firstAudioTrack: (() => {
        const track = displayTracks.find((candidate) => candidate.type === "audio");
        if (!track) return undefined;
        const state = trackViewStateById[track.id];
        return {
          id: track.id,
          type: track.type,
          muted: state?.muted ?? false,
          solo: state?.solo ?? false,
          selected: state?.selected ?? false,
          nativeArmed: state?.nativeArmed ?? false,
          nativeMonitoring: state?.nativeMonitoring ?? false,
        };
      })(),
    },
    pianoRoll: pianoRollState,
    detailPanel: detailPanelState,
    trackViewStateById,
  };
}

export function createStudioGuideAnchorRegistry(
  input: StudioGuideBridgeInput,
): GuideAnchorRegistryEntry[] {
  const {
    connectionSummary,
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
      highlights: ["loopRegion", "addMidiTrack", "addAudioTrack"],
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
    {
      id: "transport:record",
      targetType: "panel",
      targetId: "transport.record",
      available: connectionSummary.canUseNativeControls,
      panel: "timeline",
      highlights: ["transportRecord"],
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
        highlights: ["trackHeader", "muteToggle", "soloToggle", "monitorToggle", "armToggle"],
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

  const firstMidiTrack = displayTracks.find((track) => track.type === "midi");
  if (firstMidiTrack) {
    entries.push(
      {
        id: "track:first-midi-track",
        targetType: "track",
        targetId: "first-midi-track",
        available: true,
        panel: "timeline",
        highlights: ["trackHeader", "muteToggle", "soloToggle", "monitorToggle", "armToggle"],
        metadata: { trackId: firstMidiTrack.id },
      },
      {
        id: "track-lane:first-midi-track",
        targetType: "track-lane",
        targetId: "first-midi-track",
        available: true,
        panel: "timeline",
        metadata: { trackId: firstMidiTrack.id },
      },
      {
        id: "track-header:first-midi-track",
        targetType: "track-header",
        targetId: "first-midi-track",
        available: true,
        panel: "timeline",
        metadata: { trackId: firstMidiTrack.id },
      },
    );
  }

  const firstAudioTrack = displayTracks.find((track) => track.type === "audio");
  if (firstAudioTrack) {
    entries.push(
      {
        id: "track:first-audio-track",
        targetType: "track",
        targetId: "first-audio-track",
        available: true,
        panel: "timeline",
        highlights: ["trackHeader", "muteToggle", "soloToggle", "monitorToggle", "armToggle"],
        metadata: { trackId: firstAudioTrack.id },
      },
      {
        id: "track-lane:first-audio-track",
        targetType: "track-lane",
        targetId: "first-audio-track",
        available: true,
        panel: "timeline",
        metadata: { trackId: firstAudioTrack.id },
      },
      {
        id: "track-header:first-audio-track",
        targetType: "track-header",
        targetId: "first-audio-track",
        available: true,
        panel: "timeline",
        metadata: { trackId: firstAudioTrack.id },
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

  const firstMidiClip = displayTracks.flatMap((track) => track.clips || []).find((clip) => clip.is_midi);
  if (firstMidiClip) {
    entries.push({
      id: "clip:first-midi-clip",
      targetType: "clip",
      targetId: "first-midi-clip",
      available: true,
      panel: "pianoRoll",
      highlights: ["clipHeader"],
      metadata: { clipId: firstMidiClip.id, trackId: firstMidiClip.track_id },
    });
  }

  const firstAudioClip = displayTracks.flatMap((track) => track.clips || []).find((clip) => !clip.is_midi);
  if (firstAudioClip) {
    entries.push({
      id: "clip:first-audio-clip",
      targetType: "clip",
      targetId: "first-audio-clip",
      available: true,
      panel: "timeline",
      metadata: { clipId: firstAudioClip.id, trackId: firstAudioClip.track_id },
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

  if (displayTracks[0]) {
    entries.push({
      id: "mixer-strip:any",
      targetType: "mixer-strip",
      targetId: "any",
      available: panelState.showMixer,
      panel: "mixer",
      metadata: { trackId: displayTracks[0].id },
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
