import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useStudioDomainView } from "@/hooks/useStudioDomainView";
import type { HostConnectorState } from "@/hooks/useHostConnector";
import type { SessionTrack } from "@/types/studio";

function createHostState(): HostConnectorState {
  return {
    connectionState: "connected",
    isMock: false,
    inShell: false,
    readySequence: 1,
    shellInfo: null,
    sidecarStatus: null,
    transport: null,
    playback: null,
    masterMeter: null,
    trackMeters: {},
    nativeChains: {
      "chain-1": [
        {
          index: 0,
          instanceId: "track-1-device-1",
          pluginId: "plugin-1",
          pluginName: "AUSampler",
          vendor: "Apple",
          format: "AudioUnit",
          path: "AudioUnit:Synths/aumu,samp,appl",
          status: "loaded",
          bypass: false,
          editorOpen: false,
          latencySamples: 0,
          paramCount: 12,
        },
      ],
    },
    openEditors: {},
    lastError: null,
    errors: [],
    syncStatus: { state: "idle", lastSyncAt: null, error: null },
    midiDevices: [],
    bounceProgress: { renderId: null, progress: 0, complete: false, filePath: null },
    analysisData: { spectrum: null, lufs: null },
    analysisActive: false,
    recording: false,
    recordLevels: {},
    sessionState: null,
    audioEngineState: null,
  };
}

function createTrack(): SessionTrack {
  return {
    id: "track-1",
    session_id: "session-1",
    name: "Synth",
    type: "midi",
    color: 1,
    volume: 0.8,
    pan: 0,
    is_muted: false,
    is_soloed: false,
    sort_order: 0,
    sends: [],
    input_from: null,
    created_at: "",
    clips: [],
    device_chain: [
      {
        id: "device-1",
        type: "sampler",
        enabled: true,
        params: {},
        hostPlugin: {
          id: "plugin-1",
          path: "AudioUnit:Synths/aumu,samp,appl",
          name: "AUSampler",
          vendor: "Apple",
          format: "AudioUnit",
          role: "instrument",
          scanStatus: "ok",
        },
      },
    ],
  };
}

describe("useStudioDomainView", () => {
  it("derives host-backed detail panel workflow state from the selected track", () => {
    const track = createTrack();
    const hostState = createHostState();

    const { result } = renderHook(() =>
      useStudioDomainView({
        tracks: [track],
        selectedClipIds: new Set(),
        selectedTrackId: track.id,
        activeClipId: null,
        bottomTab: "editor",
        hostState,
        browserAudioEnabled: false,
        hostAvailable: true,
        effectivePlaybackState: "stopped",
        effectiveBeat: 0,
        mode: "connected",
        selectedClip: undefined,
        selectedTrack: track,
        ghostNotes: [],
        nativeChainIdsByTrack: { [track.id]: "chain-1" },
        nativeArmedByTrack: {},
        nativeMonitoringByTrack: {},
      }),
    );

    expect(result.current.detailPanelState.hasHostBackedDevices).toBe(true);
    expect(result.current.detailPanelState.nativeNodeCount).toBe(1);
    expect(result.current.detailPanelState.canLoadNativeChain).toBe(false);
    expect(result.current.detailPanelState.nativeChainId).toBe("chain-1");
  });

  it("marks a selected host-backed track as loadable when connected and not yet loaded", () => {
    const track = createTrack();
    const hostState = createHostState();
    hostState.nativeChains = {};

    const { result } = renderHook(() =>
      useStudioDomainView({
        tracks: [track],
        selectedClipIds: new Set(),
        selectedTrackId: track.id,
        activeClipId: null,
        bottomTab: "editor",
        hostState,
        browserAudioEnabled: false,
        hostAvailable: true,
        effectivePlaybackState: "stopped",
        effectiveBeat: 0,
        mode: "connected",
        selectedClip: undefined,
        selectedTrack: track,
        ghostNotes: [],
        nativeChainIdsByTrack: {},
        nativeArmedByTrack: {},
        nativeMonitoringByTrack: {},
      }),
    );

    expect(result.current.detailPanelState.hasHostBackedDevices).toBe(true);
    expect(result.current.detailPanelState.nativeNodeCount).toBe(0);
    expect(result.current.detailPanelState.canLoadNativeChain).toBe(true);
  });
});
