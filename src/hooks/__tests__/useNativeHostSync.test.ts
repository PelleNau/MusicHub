import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useNativeHostSync } from "@/hooks/useNativeHostSync";
import type { HostConnectorActions, HostConnectorState } from "@/hooks/useHostConnector";
import type { SessionTrack } from "@/types/studio";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

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
    nativeChains: {},
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

function createHostActions(): HostConnectorActions {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    restartShellHost: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    seek: vi.fn(),
    setTempo: vi.fn(),
    setLoop: vi.fn(),
    setParam: vi.fn(),
    bypass: vi.fn(),
    reorderChain: vi.fn(),
    removeFromChain: vi.fn(),
    addToChain: vi.fn(),
    openEditor: vi.fn(),
    closeEditor: vi.fn(),
    fetchPluginPresets: vi.fn(),
    loadPluginPreset: vi.fn(),
    savePluginState: vi.fn(),
    restorePluginState: vi.fn(),
    startBounce: vi.fn(),
    fetchMidiDevices: vi.fn(),
    routeMidi: vi.fn(),
    startMidiLearn: vi.fn(),
    cancelMidiLearn: vi.fn(),
    sendNote: vi.fn(),
    sendCC: vi.fn(),
    fetchAudioConfig: vi.fn(),
    armRecord: vi.fn(),
    monitorTrack: vi.fn(),
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    startAnalysis: vi.fn(),
    stopAnalysis: vi.fn(),
    openFileBrowser: vi.fn(),
    fetchPlugins: vi.fn().mockResolvedValue([]),
    loadChain: vi.fn().mockResolvedValue({
      chainId: "chain-1",
      name: "Track Native Chain",
      sampleRate: 48000,
      blockSize: 512,
      nodeCount: 1,
      nodes: [],
      loadedCount: 1,
      missingCount: 0,
      errorCount: 0,
      totalLatencySamples: 0,
      elapsedMs: 1,
    }),
    fetchChainParams: vi.fn(),
    syncAudioGraph: vi.fn().mockResolvedValue(undefined),
    onParamChanged: vi.fn(),
    onChainState: vi.fn(),
    onEditorClosed: vi.fn(),
    onMidiInput: vi.fn(),
    onMidiLearnCaptured: vi.fn(),
    onFileDrop: vi.fn(),
  };
}

describe("useNativeHostSync", () => {
  it("loads a native chain for a selected MIDI track with a host-backed device", async () => {
    const hostState = createHostState();
    const hostActions = createHostActions();
    const track: SessionTrack = {
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
      created_at: new Date().toISOString(),
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

    renderHook(() =>
      useNativeHostSync({
        tracks: [track],
        selectedTrackId: track.id,
        selectedTrack: track,
        selectedClipIsMidi: true,
        activeSessionId: "session-1",
        isMock: false,
        hostState,
        hostActions,
        onDeviceChainChange: vi.fn(),
      }),
    );

    await waitFor(() => {
      expect(hostActions.loadChain).toHaveBeenCalledWith({
        manifest: expect.objectContaining({
          name: "Synth Native Chain",
          chain: [
            expect.objectContaining({
              plugin_id: "plugin-1",
              path: "AudioUnit:Synths/aumu,samp,appl",
            }),
          ],
        }),
      });
    });

    await waitFor(() => {
      expect(hostActions.syncAudioGraph).toHaveBeenCalled();
    });
  });

  it("does not reload a chain that was already published by session state", async () => {
    const hostState = createHostState();
    hostState.sessionState = {
      type: "session.state",
      sessionId: "session-1",
      tracks: [{ id: "track-1", chainId: "chain-existing" }],
      transport: {
        state: "stopped",
        beat: 0,
        bpm: 120,
      },
    };
    const hostActions = createHostActions();
    const track: SessionTrack = {
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
      created_at: new Date().toISOString(),
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

    const { result } = renderHook(() =>
      useNativeHostSync({
        tracks: [track],
        selectedTrackId: track.id,
        selectedTrack: track,
        selectedClipIsMidi: true,
        activeSessionId: "session-1",
        isMock: false,
        hostState,
        hostActions,
        onDeviceChainChange: vi.fn(),
      }),
    );

    await waitFor(() => {
      expect(result.current.nativeChainIdsByTrack["track-1"]).toBe("chain-existing");
    });

    expect(hostActions.loadChain).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(hostActions.syncAudioGraph).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "track-1",
            chainId: "chain-existing",
            chain_id: "chain-existing",
          }),
        ]),
      );
    });
  });
});
