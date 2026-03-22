import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStudioInteractionRuntime } from "@/hooks/useStudioInteractionRuntime";

const useNativeHostSyncMock = vi.fn();
const useStudioDomainViewMock = vi.fn();
const useStudioGuideBridgeMock = vi.fn();
const useStudioContinuousEditModelMock = vi.fn();
const useStudioCommandDispatchMock = vi.fn();

vi.mock("@/hooks/useNativeHostSync", () => ({
  useNativeHostSync: (options: unknown) => useNativeHostSyncMock(options),
}));

vi.mock("@/hooks/useStudioDomainView", () => ({
  useStudioDomainView: (options: unknown) => useStudioDomainViewMock(options),
}));

vi.mock("@/hooks/useStudioGuideBridge", () => ({
  useStudioGuideBridge: (options: unknown) => useStudioGuideBridgeMock(options),
}));

vi.mock("@/hooks/useStudioContinuousEditModel", () => ({
  useStudioContinuousEditModel: (options: unknown) => useStudioContinuousEditModelMock(options),
}));

vi.mock("@/hooks/useStudioCommandDispatch", () => ({
  useStudioCommandDispatch: (options: unknown) => useStudioCommandDispatchMock(options),
}));

describe("useStudioInteractionRuntime", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useNativeHostSyncMock.mockReturnValue({
      nativeChainIdsByTrack: {},
      nativeArmedByTrack: {},
      nativeMonitoringByTrack: {},
      handleRecordToggle: vi.fn(),
      handleNativeArmToggle: vi.fn(),
      handleNativeMonitorToggle: vi.fn(),
      hostPlugins: [],
    });

    useStudioDomainViewMock.mockReturnValue({
      transportSummary: {},
      connectionSummary: {},
      panelState: {},
      selectionSummary: {},
      pianoRollState: {},
      detailPanelState: {},
      trackViewStateById: {},
      displayTracks: [],
      displayReturnTracks: [],
      mixerState: {},
    });

    useStudioGuideBridgeMock.mockReturnValue({});
    useStudioContinuousEditModelMock.mockReturnValue({});
    useStudioCommandDispatchMock.mockReturnValue({});
  });

  it("only toggles track mute when the requested boolean differs from runtime state", () => {
    const handleMuteToggle = vi.fn();
    const runtime = createRuntime({
      tracks: [{ id: "track-1", is_muted: true, is_soloed: false }],
      actions: { handleMuteToggle },
    });

    renderHook(() =>
      useStudioInteractionRuntime({
        activeSessionId: "session-1",
        lessonId: null,
        runtime: runtime as never,
        commandLog: { entries: [], record: vi.fn() } as never,
        continuousEditLog: { entries: [], record: vi.fn() } as never,
      }),
    );

    const options = useStudioCommandDispatchMock.mock.calls.at(-1)?.[0] as {
      onUpdateTrack: (trackId: string, patch: { muted?: boolean }) => void;
    };

    options.onUpdateTrack("track-1", { muted: true });
    expect(handleMuteToggle).not.toHaveBeenCalled();

    options.onUpdateTrack("track-1", { muted: false });
    expect(handleMuteToggle).toHaveBeenCalledTimes(1);
  });

  it("only toggles clip mute when the requested boolean differs from runtime state", () => {
    const handleMuteClip = vi.fn();
    const runtime = createRuntime({
      sessionDomainModel: {
        trackIndex: {
          clipById: {
            "clip-1": { id: "clip-1", is_muted: false, midi_data: null },
          },
        },
      },
      actions: { handleMuteClip },
    });

    renderHook(() =>
      useStudioInteractionRuntime({
        activeSessionId: "session-1",
        lessonId: null,
        runtime: runtime as never,
        commandLog: { entries: [], record: vi.fn() } as never,
        continuousEditLog: { entries: [], record: vi.fn() } as never,
      }),
    );

    const options = useStudioCommandDispatchMock.mock.calls.at(-1)?.[0] as {
      onUpdateClip: (clipId: string, patch: { muted?: boolean }) => void;
    };

    options.onUpdateClip("clip-1", { muted: false });
    expect(handleMuteClip).not.toHaveBeenCalled();

    options.onUpdateClip("clip-1", { muted: true });
    expect(handleMuteClip).toHaveBeenCalledTimes(1);
  });

  it("maps clip startBeat and lengthBeats patches onto the live clip resize path", () => {
    const handleClipResize = vi.fn();
    const runtime = createRuntime({
      sessionDomainModel: {
        trackIndex: {
          clipById: {
            "clip-1": { id: "clip-1", start_beats: 4, end_beats: 8, is_muted: false, midi_data: null },
          },
        },
      },
      actions: { handleClipResize },
    });

    renderHook(() =>
      useStudioInteractionRuntime({
        activeSessionId: "session-1",
        lessonId: null,
        runtime: runtime as never,
        commandLog: { entries: [], record: vi.fn() } as never,
        continuousEditLog: { entries: [], record: vi.fn() } as never,
      }),
    );

    const options = useStudioCommandDispatchMock.mock.calls.at(-1)?.[0] as {
      onUpdateClip: (clipId: string, patch: { startBeat?: number; lengthBeats?: number }) => void;
    };

    options.onUpdateClip("clip-1", { startBeat: 6, lengthBeats: 3 });
    expect(handleClipResize).toHaveBeenCalledWith("clip-1", 6, 9);
  });

  it("preserves a custom track name when handling studio.createTrack", () => {
    const handleAddTrack = vi.fn();
    const runtime = createRuntime({
      actions: { handleAddTrack },
    });

    renderHook(() =>
      useStudioInteractionRuntime({
        activeSessionId: "session-1",
        lessonId: null,
        runtime: runtime as never,
        commandLog: { entries: [], record: vi.fn() } as never,
        continuousEditLog: { entries: [], record: vi.fn() } as never,
      }),
    );

    const options = useStudioCommandDispatchMock.mock.calls.at(-1)?.[0] as {
      onCreateTrack: (type: "audio" | "midi" | "return", role?: string, name?: string) => void;
    };

    options.onCreateTrack("midi", undefined, "Lead Synth");
    expect(handleAddTrack).toHaveBeenCalledWith("midi", "Lead Synth");
  });
});

function createRuntime(overrides: Record<string, unknown>) {
  const runtime = {
    tracks: [],
    selectedTrackId: null,
    activeClipId: null,
    bottomTab: "editor",
    hostState: {
      isMock: true,
      connectionState: "disconnected",
      inShell: false,
      sidecarStatus: null,
      syncStatus: {},
      recording: false,
      lastError: null,
      audioEngineState: undefined,
      openEditors: {},
      nativeChains: {},
    },
    hostModeModel: {
      browserAudioEnabled: true,
      hostAvailable: false,
    },
    engine: undefined,
    transport: {
      effectivePlaybackState: "stopped",
      effectiveBeat: 0,
      canPlay: true,
      canPause: false,
      canStop: false,
      mode: "standalone",
      handlePlay: vi.fn(),
      handlePause: vi.fn(),
      handleStop: vi.fn(),
      handleSeek: vi.fn(),
      handleLoopChange: vi.fn(),
      handleLoopToggle: vi.fn(),
      handleTempoChange: vi.fn(),
    },
    selectedClipIds: new Set<string>(),
    sessionDomainModel: {
      selectedClip: null,
      selectedTrack: null,
      ghostNotes: [],
      trackIndex: {
        clipById: {},
      },
    },
    nativeSelectionModel: {
      selectedTrack: null,
      selectedClipIsMidi: false,
    },
    actions: {
      handleDeviceChainChange: vi.fn(),
      handleMuteToggle: vi.fn(),
      handleSoloToggle: vi.fn(),
      handleRenameTrack: vi.fn(),
      handleColorChange: vi.fn(),
      handleDeleteTrack: vi.fn(),
      handleCreateMidiClip: vi.fn(),
      handleRenameClip: vi.fn(),
      handleClipColorChange: vi.fn(),
      handleMuteClip: vi.fn(),
      handleClipResize: vi.fn(),
      handleDeleteClip: vi.fn(),
      handleCreateLinkedDuplicate: vi.fn(),
      handleDuplicateClip: vi.fn(),
      handleAddReturn: vi.fn(),
      handleAddTrack: vi.fn(),
      handleBrowserAddDevice: vi.fn(),
      handleBrowserAddHostPlugin: vi.fn(),
      handleUpdateMidiNotes: vi.fn(),
      handleVolumeChange: vi.fn(),
      handlePanChange: vi.fn(),
      handleSendChange: vi.fn(),
      handleClipMove: vi.fn(),
      handleReorderTrack: vi.fn(),
      handleAutomationChange: vi.fn(),
      handleAutomationAdd: vi.fn(),
      handleAutomationRemove: vi.fn(),
    },
    updateClip: {
      mutate: vi.fn(),
    },
    loopEnabled: false,
    loopStart: 0,
    loopEnd: 4,
    setSelectedTrackId: vi.fn(),
    setSelectedClipIds: vi.fn(),
    setBottomTab: vi.fn(),
  };

  return {
    ...runtime,
    ...overrides,
    actions: {
      ...runtime.actions,
      ...(overrides.actions as object | undefined),
    },
    sessionDomainModel: {
      ...runtime.sessionDomainModel,
      ...(overrides.sessionDomainModel as object | undefined),
    },
  };
}
