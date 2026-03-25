import { useMemo, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { HostConnector } from "@/services/hostConnector";
import { normalizeChainLoadResponseData, type ChainLoadResponse, type ChainNode, type MidiDevice } from "@/services/pluginHostClient";
import type {
  AnalysisData,
  BounceProgress,
  HostConnectorActions,
  SyncStatus,
} from "@/hooks/hostConnectorTypes";

interface UseHostConnectorActionsOptions {
  connector: HostConnector;
  syncTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  setOpenEditors: Dispatch<SetStateAction<Record<string, boolean>>>;
  setBounceProgress: Dispatch<SetStateAction<BounceProgress>>;
  setMidiDevices: Dispatch<SetStateAction<MidiDevice[]>>;
  setRecording: Dispatch<SetStateAction<boolean>>;
  setAnalysisActive: Dispatch<SetStateAction<boolean>>;
  setAnalysisData: Dispatch<SetStateAction<AnalysisData>>;
  setNativeChains: Dispatch<SetStateAction<Record<string, ChainNode[]>>>;
  setSyncStatus: Dispatch<SetStateAction<SyncStatus>>;
}

type ConnectorChainNodeShape = Partial<ChainNode> & {
  id?: string;
  name?: string;
  manufacturer?: string;
  restoredStateBytes?: number;
  parameterCount?: number;
};

type ConnectorChainLoadResponseShape = Partial<ChainLoadResponse> & {
  loadedChain?: {
    sampleRate?: number;
    blockSize?: number;
    plugins?: ConnectorChainNodeShape[];
  };
  manifest?: { name?: string };
  nodes?: ConnectorChainNodeShape[];
};

function normalizeChainLoadResponse(response: ConnectorChainLoadResponseShape, elapsedMs: number): ChainLoadResponse {
  return normalizeChainLoadResponseData(response, elapsedMs);
}

export function useHostConnectorActions({
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
}: UseHostConnectorActionsOptions): HostConnectorActions {
  return useMemo(
    () => ({
      connect: () => connector.connect(),
      disconnect: () => connector.disconnect(),
      restartShellHost: () => connector.restartSidecar(),
      play: (fromBeat = 0) => connector.play(fromBeat),
      pause: () => connector.pause(),
      stop: () => connector.stop(),
      seek: (beat) => connector.seek(beat),
      setTempo: (bpm) => connector.setTempo(bpm),
      setLoop: (enabled, start, end) => connector.setLoop(enabled, start, end),
      setParam: (chainId, nodeIndex, paramId, value) => connector.setParam(chainId, nodeIndex, paramId, value),
      bypass: (chainId, nodeIndex, bypassState) => connector.bypass(chainId, nodeIndex, bypassState),
      reorderChain: (chainId, fromIndex, toIndex) => connector.reorderChain(chainId, fromIndex, toIndex),
      removeFromChain: (chainId, nodeIndex) => connector.removeFromChain(chainId, nodeIndex),
      addToChain: (chainId, pluginId, atIndex) => connector.addToChain(chainId, pluginId, atIndex),
      openEditor: async (chainId, nodeIndex) => {
        try {
          const response = await connector.openEditorHttp({ chainId, nodeIndex });
          setOpenEditors((previous) => ({ ...previous, [`${chainId}:${nodeIndex}`]: true }));
          return response.data;
        } catch {
          return null;
        }
      },
      closeEditor: async (chainId, nodeIndex) => {
        try {
          const response = await connector.closeEditorHttp({ chainId, nodeIndex });
          setOpenEditors((previous) => {
            const next = { ...previous };
            delete next[`${chainId}:${nodeIndex}`];
            return next;
          });
          return response.data;
        } catch {
          return null;
        }
      },
      fetchPluginPresets: async (chainId, nodeIndex) => {
        try {
          const response = await connector.pluginPresets(chainId, nodeIndex);
          return response.data;
        } catch {
          return null;
        }
      },
      loadPluginPreset: async (chainId, nodeIndex, index) => {
        try {
          const response = await connector.loadPluginPreset(chainId, nodeIndex, index);
          return response.data;
        } catch {
          return null;
        }
      },
      savePluginState: async (chainId, nodeIndex) => {
        try {
          const response = await connector.savePluginState(chainId, nodeIndex);
          return response.data;
        } catch {
          return null;
        }
      },
      restorePluginState: async (chainId, nodeIndex, stateId) => {
        try {
          const response = await connector.restorePluginState(chainId, nodeIndex, { stateId });
          return Boolean(response.data.restored);
        } catch {
          return false;
        }
      },
      startBounce: async (request) => {
        setBounceProgress({ renderId: null, progress: 0, complete: false, filePath: null });
        await connector.bounce(request);
      },
      fetchMidiDevices: async () => {
        try {
          const response = await connector.midiDevices();
          setMidiDevices(response.data.devices);
          return response.data.devices;
        } catch {
          return [];
        }
      },
      routeMidi: async (request) => {
        try {
          const response = await connector.midiRoute(request);
          return response.data.routed;
        } catch {
          return false;
        }
      },
      startMidiLearn: (chainId, nodeIndex, paramId) => connector.startMidiLearn(chainId, nodeIndex, paramId),
      cancelMidiLearn: () => connector.cancelMidiLearn(),
      sendNote: (trackId, note, velocity, channel) => connector.sendNote(trackId, note, velocity, channel),
      sendCC: (trackId, cc, value, channel) => connector.sendCC(trackId, cc, value, channel),
      fetchAudioConfig: async (request) => {
        try {
          await connector.audioConfig(request);
        } catch {
          // Intentionally ignored: callers use this as a best-effort hydration path.
        }
      },
      armRecord: async (request) => {
        try {
          const response = await connector.recordArm(request);
          return response.data.armed;
        } catch {
          return false;
        }
      },
      monitorTrack: async (request) => {
        try {
          const response = await connector.monitorTrack(request);
          return response.data.monitoring;
        } catch {
          return false;
        }
      },
      startRecording: async (sessionId) => {
        setRecording(true);
        try {
          await connector.startRecording(sessionId);
        } catch {
          setRecording(false);
        }
      },
      stopRecording: async () => {
        try {
          await connector.stopRecording();
        } finally {
          setRecording(false);
        }
      },
      startAnalysis: (source, trackId) => {
        setAnalysisActive(true);
        connector.startAnalysis(source, trackId);
      },
      stopAnalysis: () => {
        setAnalysisActive(false);
        setAnalysisData({ spectrum: null, lufs: null });
        connector.stopAnalysis();
      },
      openFileBrowser: async (request) => {
        try {
          const response = await connector.fileBrowser(request);
          return response.data;
        } catch {
          return null;
        }
      },
      fetchPlugins: async () => {
        try {
          const response = await connector.plugins();
          return response.data.plugins;
        } catch {
          return [];
        }
      },
      loadChain: async (request) => {
        const response = await connector.loadChain(request);
        const normalized = normalizeChainLoadResponse(response.data as ConnectorChainLoadResponseShape, response.elapsedMs ?? 0);
        setNativeChains((previous) => ({ ...previous, [normalized.chainId]: normalized.nodes }));
        return normalized;
      },
      fetchChainParams: async (chainId) => {
        try {
          const response = await connector.chainParams(chainId);
          return response.data;
        } catch {
          return null;
        }
      },
      syncAudioGraph: async (tracks) => {
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        setSyncStatus({ state: "syncing", lastSyncAt: null, error: null });

        return new Promise<void>((resolve) => {
          syncTimerRef.current = setTimeout(async () => {
            try {
              await connector.syncAudioGraph(tracks);
              setSyncStatus({ state: "synced", lastSyncAt: new Date().toISOString(), error: null });
            } catch (error) {
              setSyncStatus({
                state: "error",
                lastSyncAt: null,
                error: error instanceof Error ? error.message : "Unknown sync failure",
              });
            }
            resolve();
          }, 500);
        });
      },
      onParamChanged: (fn) => connector.on("plugin.paramChanged", fn),
      onChainState: (fn) => connector.on("chain.state", fn),
      onEditorClosed: (fn) => connector.on("plugin.editorClosed", fn),
      onMidiInput: (fn) => connector.on("midi.input", fn),
      onMidiLearnCaptured: (fn) => connector.on("midi.learn.captured", fn),
      onFileDrop: (fn) => connector.on("system.fileDrop", fn),
    }),
    [
      connector,
      setAnalysisActive,
      setAnalysisData,
      setBounceProgress,
      setMidiDevices,
      setNativeChains,
      setOpenEditors,
      setRecording,
      setSyncStatus,
      syncTimerRef,
    ],
  );
}
