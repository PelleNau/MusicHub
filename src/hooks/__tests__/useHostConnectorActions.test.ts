import { act, renderHook } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { useHostConnectorActions } from "@/hooks/useHostConnectorActions";
import type { HostConnector } from "@/services/hostConnector";

function createConnector() {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    restartSidecar: vi.fn(),
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
    openEditorHttp: vi.fn(),
    closeEditorHttp: vi.fn(),
    pluginPresets: vi.fn(),
    loadPluginPreset: vi.fn(),
    savePluginState: vi.fn(),
    restorePluginState: vi.fn(),
    bounce: vi.fn(),
    midiDevices: vi.fn(),
    midiRoute: vi.fn(),
    startMidiLearn: vi.fn(),
    cancelMidiLearn: vi.fn(),
    sendNote: vi.fn(),
    sendCC: vi.fn(),
    audioConfig: vi.fn(),
    recordArm: vi.fn(),
    monitorTrack: vi.fn(),
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    startAnalysis: vi.fn(),
    stopAnalysis: vi.fn(),
    fileBrowser: vi.fn(),
    plugins: vi.fn(),
    loadChain: vi.fn(),
    chainParams: vi.fn(),
    syncAudioGraph: vi.fn(),
    on: vi.fn(),
  } as unknown as HostConnector;
}

describe("useHostConnectorActions", () => {
  it("keeps editor state in sync when open succeeds and close reports alreadyClosed", async () => {
    const connector = createConnector();

    vi.mocked(connector.openEditorHttp).mockResolvedValue({
      requestId: "open-1",
      operation: "plugins.editor.open",
      elapsedMs: 5,
      data: {
        opened: true,
        pluginId: "plugin-1",
        pluginName: "Massive X",
        windowId: "chain-1:0",
      },
    });

    vi.mocked(connector.closeEditorHttp).mockResolvedValue({
      requestId: "close-1",
      operation: "plugins.editor.close",
      elapsedMs: 5,
      data: {
        closed: true,
        alreadyClosed: true,
      },
    });

    const { result } = renderHook(() => {
      const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
      const [openEditors, setOpenEditors] = useState<Record<string, boolean>>({});
      const [, setBounceProgress] = useState({ renderId: null as string | null, progress: 0, complete: false, filePath: null as string | null });
      const [, setMidiDevices] = useState([]);
      const [, setRecording] = useState(false);
      const [, setAnalysisActive] = useState(false);
      const [, setAnalysisData] = useState({ spectrum: null, lufs: null });
      const [, setNativeChains] = useState<Record<string, never[]>>({});
      const [, setSyncStatus] = useState({ state: "idle" as const, lastSyncAt: null as string | null, error: null as string | null });

      const actions = useHostConnectorActions({
        connector,
        syncTimerRef,
        setOpenEditors,
        setBounceProgress,
        setMidiDevices,
        setRecording,
        setAnalysisActive,
        setAnalysisData,
        setNativeChains,
        setSyncStatus,
      });

      return { actions, openEditors };
    });

    await act(async () => {
      const response = await result.current.actions.openEditor("chain-1", 0);
      expect(response?.opened).toBe(true);
    });

    expect(result.current.openEditors).toEqual({ "chain-1:0": true });

    await act(async () => {
      const response = await result.current.actions.closeEditor("chain-1", 0);
      expect(response).toEqual({ closed: true, alreadyClosed: true });
    });

    expect(result.current.openEditors).toEqual({});
  });
});
