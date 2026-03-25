import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type { HostPlugin, ChainLoadRequest } from "@/services/pluginHostClient";
import type { HostGraphTrack } from "@/services/pluginHostContracts";
import type { HostConnectorActions, HostConnectorState } from "@/hooks/useHostConnector";
import type { NativeSessionTrackState } from "@/services/pluginHostSocket";
import {
  getHostPluginDescriptor,
  isHostBackedDevice,
  type DeviceInstance,
  type SessionTrack,
} from "@/types/studio";

function hasNativePluginMetadata(device: DeviceInstance): boolean {
  return isHostBackedDevice(device);
}

function buildNativeNode(trackId: string, device: DeviceInstance, index: number) {
  const hostPlugin = getHostPluginDescriptor(device);
  return {
    instance_id: `${trackId}-${device.id || `node-${index + 1}`}`,
    plugin_id: hostPlugin?.id ?? "",
    path: hostPlugin?.path ?? "",
    bypass: device.enabled === false,
    parameters: device.params ?? {},
  };
}

function buildNativeChainManifest(track: SessionTrack): ChainLoadRequest | null {
  const nativeDevices = (track.device_chain || []).filter(hasNativePluginMetadata);
  if (nativeDevices.length === 0) return null;

  return {
    manifest: {
      name: `${track.name} Native Chain`,
      sample_rate: 48000,
      block_size: 512,
      chain: nativeDevices.map((device, index) => buildNativeNode(track.id, device, index)),
    },
  };
}

function getNativeChainSignature(track: SessionTrack): string {
  const nativeDevices = (track.device_chain || [])
    .filter(hasNativePluginMetadata)
    .map((device) => ({
      id: device.id,
      enabled: device.enabled,
      hostPlugin: getHostPluginDescriptor(device),
      params: device.params ?? {},
    }))
    .map(({ id, enabled, hostPlugin, params }) => ({
      id,
      enabled,
      pluginId: hostPlugin?.id ?? "",
      pluginPath: hostPlugin?.path ?? "",
      params,
    }));

  return JSON.stringify(nativeDevices);
}

function normalizeTracksForHost(
  tracks: SessionTrack[],
  nativeChainIdsByTrack: Record<string, string>
): HostGraphTrack[] {
  return tracks.map((track) => {
    const chainId = nativeChainIdsByTrack[track.id];
    const muted = Boolean((track as SessionTrack & { muted?: boolean }).is_muted
      ?? (track as SessionTrack & { muted?: boolean }).muted);
    const solo = Boolean((track as SessionTrack & { solo?: boolean }).is_soloed
      ?? (track as SessionTrack & { solo?: boolean }).solo);

    return {
      ...track,
      ...(chainId ? { chainId, chain_id: chainId } : {}),
      muted,
      mute: muted,
      solo,
    };
  });
}

function getHostGraphSignature(
  tracks: SessionTrack[],
  nativeChainIdsByTrack: Record<string, string>
): string {
  return JSON.stringify(normalizeTracksForHost(tracks, nativeChainIdsByTrack));
}

function resolveNativeSessionTrackIdentity(track: NativeSessionTrackState): {
  trackId: string;
  chainId: string;
} | null {
  const trackId = typeof track.id === "string"
    ? track.id
    : (typeof track.trackId === "string" ? track.trackId : "");
  const chainId = typeof track.chainId === "string" ? track.chainId : "";

  if (!trackId || !chainId) return null;
  return { trackId, chainId };
}

interface UseNativeHostSyncArgs {
  tracks: SessionTrack[];
  selectedTrackId: string | null;
  selectedTrack?: SessionTrack;
  selectedClipIsMidi: boolean;
  activeSessionId: string | null;
  isMock: boolean;
  hostState: HostConnectorState;
  hostActions: HostConnectorActions;
  onDeviceChainChange: (trackId: string, devices: DeviceInstance[]) => void;
}

export function useNativeHostSync({
  tracks,
  selectedTrackId,
  selectedTrack,
  selectedClipIsMidi,
  activeSessionId,
  isMock,
  hostState,
  hostActions,
  onDeviceChainChange,
}: UseNativeHostSyncArgs) {
  const [nativeChainIdsByTrack, setNativeChainIdsByTrack] = useState<Record<string, string>>({});
  const [nativeArmedByTrack, setNativeArmedByTrack] = useState<Record<string, boolean>>({});
  const [nativeMonitoringByTrack, setNativeMonitoringByTrack] = useState<Record<string, boolean>>({});
  const [hostPlugins, setHostPlugins] = useState<HostPlugin[]>([]);

  const nativeChainSignaturesRef = useRef<Record<string, string>>({});
  const pendingNativeChainLoadsRef = useRef<Set<string>>(new Set());
  const prevReadySequenceRef = useRef(hostState.readySequence);
  const lastSyncedGraphSignatureRef = useRef<string | null>(null);
  const hydratedSessionChainIdsByTrack = useMemo(() => {
    const nextSessionChainIds: Record<string, string> = {};
    for (const track of hostState.sessionState?.tracks ?? []) {
      const resolvedTrack = resolveNativeSessionTrackIdentity(track);
      if (!resolvedTrack) continue;
      nextSessionChainIds[resolvedTrack.trackId] = resolvedTrack.chainId;
    }
    return nextSessionChainIds;
  }, [hostState.sessionState]);

  const syncHostGraph = useCallback(async (chainIdsByTrack: Record<string, string>) => {
    const nextSignature = getHostGraphSignature(tracks, chainIdsByTrack);
    if (lastSyncedGraphSignatureRef.current === nextSignature) return;

    await hostActions.syncAudioGraph(normalizeTracksForHost(tracks, chainIdsByTrack));
    lastSyncedGraphSignatureRef.current = nextSignature;
  }, [hostActions, tracks]);

  const handleLoadNativeChainForTrack = useCallback(async (trackId: string): Promise<string | null> => {
    const track = tracks.find((candidate) => candidate.id === trackId);
    if (!track) return null;

    const manifestRequest = buildNativeChainManifest(track);
    if (!manifestRequest) {
      toast.info("Add a host-backed plugin to this track first");
      return null;
    }

    try {
      const loaded = await hostActions.loadChain(manifestRequest);
      if (!loaded?.chainId) {
        toast.error("Failed to load native chain");
        return null;
      }

      const nextSignature = getNativeChainSignature(track);
      nativeChainSignaturesRef.current[track.id] = nextSignature;

      setNativeChainIdsByTrack((prev) => {
        const merged = { ...prev, [track.id]: loaded.chainId };
        void syncHostGraph(merged);
        return merged;
      });

      toast.success(`Loaded ${loaded.nodeCount} host node${loaded.nodeCount === 1 ? "" : "s"} for ${track.name}`);
      return loaded.chainId;
    } catch (error) {
      console.error("[Studio] Manual native chain load failed:", error);
      const message = error instanceof Error ? error.message : "Failed to load chain in host";
      toast.error(message);
      return null;
    }
  }, [hostActions, syncHostGraph, tracks]);

  const handleRemoveNativeNode = useCallback((chainId: string, nodeIndex: number) => {
    const trackId = selectedTrackId;
    if (!trackId) return;

    const track = tracks.find((candidate) => candidate.id === trackId);
    if (!track) return;

    const devices = (track.device_chain || []) as DeviceInstance[];
    let nativeOrdinal = -1;
    const nextDevices = devices.filter((device) => {
      const isNative = hasNativePluginMetadata(device);
      if (!isNative) return true;

      nativeOrdinal += 1;
      return nativeOrdinal !== nodeIndex;
    });

    hostActions.removeFromChain(chainId, nodeIndex);
    onDeviceChainChange(trackId, nextDevices);
  }, [selectedTrackId, tracks, hostActions, onDeviceChainChange]);

  const handleToggleNativeNodeBypass = useCallback((chainId: string, nodeIndex: number, bypass: boolean) => {
    const trackId = selectedTrackId;
    if (!trackId) return;

    const track = tracks.find((candidate) => candidate.id === trackId);
    if (!track) return;

    const devices = (track.device_chain || []) as DeviceInstance[];
    let nativeOrdinal = -1;
    const nextDevices = devices.map((device) => {
      if (!hasNativePluginMetadata(device)) return device;

      nativeOrdinal += 1;
      if (nativeOrdinal !== nodeIndex) return device;

      return {
        ...device,
        enabled: !bypass,
      };
    });

    hostActions.bypass(chainId, nodeIndex, bypass);
    onDeviceChainChange(trackId, nextDevices);
  }, [selectedTrackId, tracks, hostActions, onDeviceChainChange]);

  const handleNativeArmToggle = useCallback((trackId: string, armed: boolean) => {
    setNativeArmedByTrack((prev) => ({ ...prev, [trackId]: armed }));
    void hostActions.armRecord({ trackId, armed });
  }, [hostActions]);

  const handleNativeMonitorToggle = useCallback((trackId: string, monitoring: boolean) => {
    setNativeMonitoringByTrack((prev) => ({ ...prev, [trackId]: monitoring }));
    void hostActions.monitorTrack({ trackId, monitoring });
  }, [hostActions]);

  const handleRecordToggle = useCallback(() => {
    if (hostState.recording) {
      void hostActions.stopRecording();
      return;
    }

    void hostActions.startRecording(activeSessionId ?? undefined);
  }, [hostActions, hostState.recording, activeSessionId]);

  const refreshHostPlugins = useCallback(() => {
    hostActions.fetchPlugins().then(setHostPlugins).catch(() => {
      setHostPlugins([]);
    });
  }, [hostActions]);

  useEffect(() => {
    const isConnected = hostState.connectionState === "connected" || hostState.connectionState === "degraded";
    const readyChanged = hostState.readySequence !== prevReadySequenceRef.current;
    prevReadySequenceRef.current = hostState.readySequence;

    if (!isConnected || tracks.length === 0) return;

    if (readyChanged) {
      setNativeChainIdsByTrack({});
      setNativeArmedByTrack({});
      setNativeMonitoringByTrack({});
      nativeChainSignaturesRef.current = {};
      lastSyncedGraphSignatureRef.current = null;
    }

    let cancelled = false;

    void (async () => {
      try {
        const hydratedChainIds = hydratedSessionChainIdsByTrack;
        for (const track of tracks) {
          if (!hydratedChainIds[track.id]) continue;
          nativeChainSignaturesRef.current[track.id] = getNativeChainSignature(track);
        }
        const baselineChainIds = { ...hydratedChainIds, ...nativeChainIdsByTrack };
        await syncHostGraph(baselineChainIds);

        const nextChainIds: Record<string, string> = {};

        for (const track of tracks) {
          const manifestRequest = buildNativeChainManifest(track);
          if (!manifestRequest) continue;

          const nextSignature = getNativeChainSignature(track);
          const currentSignature = nativeChainSignaturesRef.current[track.id];
          const existingChainId = readyChanged
            ? undefined
            : (hydratedSessionChainIdsByTrack[track.id] ?? nativeChainIdsByTrack[track.id]);

          if (existingChainId && currentSignature === nextSignature) continue;

          if (existingChainId && !currentSignature) {
            nativeChainSignaturesRef.current[track.id] = nextSignature;
            continue;
          }

          const loaded = await hostActions.loadChain(manifestRequest);
          if (!loaded?.chainId) continue;

          nextChainIds[track.id] = loaded.chainId;
          nativeChainSignaturesRef.current[track.id] = nextSignature;
        }

        if (!cancelled && Object.keys(nextChainIds).length > 0) {
          const mergedChainIds = { ...baselineChainIds, ...nextChainIds };
          setNativeChainIdsByTrack(mergedChainIds);
          await syncHostGraph(mergedChainIds);
        }
      } catch (error) {
        console.error("[Studio] Native audio graph sync failed:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    tracks,
    hostState.connectionState,
    hostState.readySequence,
    hostActions,
    hydratedSessionChainIdsByTrack,
    nativeChainIdsByTrack,
    syncHostGraph,
  ]);

  useEffect(() => {
    const isConnected = hostState.connectionState === "connected" || hostState.connectionState === "degraded";
    if (!isConnected) return;

    refreshHostPlugins();
  }, [hostState.connectionState, refreshHostPlugins]);

  useEffect(() => {
    if (Object.keys(hydratedSessionChainIdsByTrack).length === 0) return;
    for (const track of tracks) {
      const chainId = hydratedSessionChainIdsByTrack[track.id];
      if (!chainId) continue;
      nativeChainSignaturesRef.current[track.id] = getNativeChainSignature(track);
    }

    setNativeChainIdsByTrack((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const [trackId, chainId] of Object.entries(hydratedSessionChainIdsByTrack)) {
        if (next[trackId] === chainId) continue;
        next[trackId] = chainId;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [hydratedSessionChainIdsByTrack, tracks]);

  useEffect(() => {
    const hostAvailable =
      hostState.connectionState === "connected" ||
      hostState.connectionState === "degraded";
    if (isMock || !hostAvailable || !selectedClipIsMidi || !selectedTrack) return;

    const trackId = selectedTrack.id;
    const hasHostBackedDevice = ((selectedTrack.device_chain || []) as DeviceInstance[]).some(hasNativePluginMetadata);
    const hasNativeChain = Boolean(hydratedSessionChainIdsByTrack[trackId] ?? nativeChainIdsByTrack[trackId]);

    if (!hasHostBackedDevice || hasNativeChain || pendingNativeChainLoadsRef.current.has(trackId)) {
      return;
    }

    pendingNativeChainLoadsRef.current.add(trackId);
    void handleLoadNativeChainForTrack(trackId);

    const timeoutId = window.setTimeout(() => {
      pendingNativeChainLoadsRef.current.delete(trackId);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [
    isMock,
    hydratedSessionChainIdsByTrack,
    hostState.connectionState,
    selectedClipIsMidi,
    selectedTrack,
    nativeChainIdsByTrack,
    handleLoadNativeChainForTrack,
  ]);

  return {
    hostPlugins,
    nativeChainIdsByTrack,
    nativeArmedByTrack,
    nativeMonitoringByTrack,
    refreshHostPlugins,
    handleLoadNativeChainForTrack,
    handleRemoveNativeNode,
    handleToggleNativeNodeBypass,
    handleNativeArmToggle,
    handleNativeMonitorToggle,
    handleRecordToggle,
  };
}
