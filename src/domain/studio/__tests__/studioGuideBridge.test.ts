import { describe, expect, it } from "vitest";
import {
  createGuideSelectorSnapshot,
  createStudioGuideAnchorRegistry,
} from "@/domain/studio/studioGuideBridge";

function createBridgeInput() {
  return {
    transportSummary: {
      mode: "guided",
      playbackState: "stopped" as const,
      currentBeat: 0,
      isBackendDriven: true,
      hostAvailable: true,
    },
    connectionSummary: {
      connectionState: "connected",
      isMock: false,
      inShell: true,
      sidecarStatus: null,
      syncStatus: { state: "synced" as const, lastSyncAt: null, error: null },
      recording: false,
      lastError: null,
      isConnected: true,
      canUseNativeControls: true,
      openEditors: {},
    },
    panelState: {
      selectedTrackId: "audio-1",
      selectedClipIds: new Set<string>(),
      activeClipId: null,
      bottomTab: "editor" as const,
      showPianoRoll: false,
      showMixer: false,
      showBottomWorkspace: true,
    },
    selectionSummary: {
      selectedClip: undefined,
      selectedTrack: undefined,
      ghostNotes: [],
    },
    pianoRollState: {
      clip: undefined,
      track: undefined,
      ghostNotes: [],
      trackClips: [],
      canUseNativeNoteAudition: false,
    },
    detailPanelState: {
      track: null,
      isConnected: true,
      nativeMonitoring: true,
      nativeArmed: true,
      openEditors: {},
    },
    trackViewStateById: {
      "audio-1": {
        muted: false,
        solo: false,
        nativeMonitoring: true,
        nativeArmed: true,
        meter: null,
        selected: true,
      },
      "midi-1": {
        muted: false,
        solo: false,
        nativeMonitoring: false,
        nativeArmed: false,
        meter: null,
        selected: false,
      },
    },
    displayTracks: [
      { id: "audio-1", type: "audio", clips: [] },
      { id: "midi-1", type: "midi", clips: [] },
    ] as never,
    displayReturnTracks: [] as never,
  };
}

describe("studioGuideBridge", () => {
  it("surfaces first-track recording state in selectors", () => {
    const snapshot = createGuideSelectorSnapshot(createBridgeInput());

    expect(snapshot.tracks.firstAudioTrack).toMatchObject({
      id: "audio-1",
      nativeArmed: true,
      nativeMonitoring: true,
    });
    expect(snapshot.tracks.firstMidiTrack).toMatchObject({
      id: "midi-1",
      nativeArmed: false,
      nativeMonitoring: false,
    });
  });

  it("registers transport record and track arm anchors for lessons", () => {
    const registry = createStudioGuideAnchorRegistry(createBridgeInput());

    expect(registry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          targetType: "panel",
          targetId: "transport.record",
          available: true,
          highlights: expect.arrayContaining(["transportRecord"]),
        }),
        expect.objectContaining({
          targetType: "track",
          targetId: "first-audio-track",
          highlights: expect.arrayContaining(["armToggle", "monitorToggle"]),
        }),
        expect.objectContaining({
          targetType: "track-header",
          targetId: "first-audio-track",
          available: true,
        }),
      ]),
    );
  });
});
