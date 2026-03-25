import { useMemo } from "react";
import type { TrackMeterData } from "@/hooks/useAudioEngine";
import type { HostConnectorState } from "@/hooks/useHostConnector";
import type { StudioSessionDomainRuntimeState } from "@/types/musicHubStudioRuntime";
import { isHostBackedDevice, type SessionTrack } from "@/types/studio";
import {
  getDisplayReturnTracks,
  normalizeDisplayTracks,
} from "@/domain/studio/studioSessionAdapter";
import {
  resolveMasterMeter,
  resolveTrackMeters,
} from "@/domain/studio/studioHostRuntimeAdapter";
import type {
  StudioConnectionSummary,
  StudioDetailPanelState,
  StudioMixerState,
  StudioPanelState,
  StudioPianoRollState,
  StudioPlaybackState,
  StudioSelectionSummary,
  StudioTrackViewState,
  StudioTransportSummary,
} from "@/domain/studio/studioViewContracts";

interface UseStudioDomainViewOptions {
  tracks: SessionTrack[];
  selectedClipIds: Set<string>;
  selectedTrackId: string | null;
  activeClipId: string | null;
  bottomTab: "editor" | "mixer";
  hostState: HostConnectorState;
  browserAudioEnabled: boolean;
  hostAvailable: boolean;
  engine?: {
    masterMeterData?: Readonly<TrackMeterData>;
    getTrackMeter: (trackId: string) => Readonly<TrackMeterData> | undefined;
  };
  effectivePlaybackState: StudioPlaybackState;
  effectiveBeat: number;
  mode: string;
  selectedClip: StudioSessionDomainRuntimeState["selectedClip"];
  selectedTrack: StudioSessionDomainRuntimeState["selectedTrack"];
  ghostNotes: StudioSessionDomainRuntimeState["ghostNotes"];
  nativeChainIdsByTrack?: Record<string, string | undefined>;
  nativeArmedByTrack?: Record<string, boolean>;
  nativeMonitoringByTrack?: Record<string, boolean>;
}

export function useStudioDomainView({
  tracks,
  selectedClipIds,
  selectedTrackId,
  activeClipId,
  bottomTab,
  hostState,
  browserAudioEnabled,
  hostAvailable,
  engine,
  effectivePlaybackState,
  effectiveBeat,
  mode,
  selectedClip,
  selectedTrack,
  ghostNotes,
  nativeChainIdsByTrack = {},
  nativeArmedByTrack = {},
  nativeMonitoringByTrack = {},
}: UseStudioDomainViewOptions) {
  const displayTracks = useMemo(() => {
    return normalizeDisplayTracks(tracks);
  }, [tracks]);

  const displayReturnTracks = useMemo(
    () => getDisplayReturnTracks(displayTracks),
    [displayTracks],
  );

  const masterMeter = useMemo(
    () => resolveMasterMeter({ hostState, hostAvailable, engine }),
    [engine, hostAvailable, hostState],
  );

  const trackMeters = useMemo(
    () => resolveTrackMeters({ tracks: displayTracks, hostState, hostAvailable, engine }),
    [displayTracks, engine, hostAvailable, hostState],
  );

  const trackViewStateById = useMemo<Record<string, StudioTrackViewState>>(
    () =>
      Object.fromEntries(
        displayTracks.map((track) => [
          track.id,
          {
            muted: Boolean(track.is_muted),
            solo: Boolean(track.is_soloed),
            nativeMonitoring: nativeMonitoringByTrack[track.id] ?? false,
            nativeArmed: nativeArmedByTrack[track.id] ?? false,
            meter: trackMeters[track.id] ?? null,
            selected: selectedTrackId === track.id,
          },
        ]),
      ),
    [displayTracks, nativeArmedByTrack, nativeMonitoringByTrack, selectedTrackId, trackMeters],
  );

  const transportSummary = useMemo<StudioTransportSummary>(
    () => ({
      mode,
      playbackState: effectivePlaybackState,
      currentBeat: effectiveBeat,
      isBackendDriven: !browserAudioEnabled,
      hostAvailable,
    }),
    [browserAudioEnabled, effectiveBeat, effectivePlaybackState, hostAvailable, mode],
  );

  const showPianoRoll = Boolean(selectedClip?.is_midi);
  const showMixer = bottomTab === "mixer";

  const panelState = useMemo<StudioPanelState>(
    () => ({
      selectedTrackId,
      selectedClipIds,
      activeClipId,
      bottomTab,
      showPianoRoll,
      showMixer,
      showBottomWorkspace: Boolean(showPianoRoll || selectedTrackId || showMixer),
    }),
    [activeClipId, bottomTab, selectedClipIds, selectedTrackId, showMixer, showPianoRoll],
  );

  const connectionSummary = useMemo<StudioConnectionSummary>(
    () => ({
      connectionState: hostState.connectionState,
      isMock: hostState.isMock,
      inShell: hostState.inShell,
      sidecarStatus: hostState.sidecarStatus,
      syncStatus: hostState.syncStatus,
      recording: hostState.recording,
      lastError: hostState.lastError,
      isConnected: hostState.connectionState === "connected" || hostState.connectionState === "degraded",
      canUseNativeControls: !hostState.isMock && hostAvailable,
      audioEngineState: hostState.audioEngineState,
      openEditors: hostState.openEditors,
    }),
    [hostAvailable, hostState],
  );

  const pianoRollState = useMemo<StudioPianoRollState>(
    () => ({
      clip: selectedClip,
      track: selectedTrack,
      ghostNotes,
      trackClips: (selectedTrack?.clips || []).filter((clip) => clip.is_midi),
      canUseNativeNoteAudition:
        !hostState.isMock && hostAvailable && Boolean(selectedTrack),
    }),
    [ghostNotes, hostAvailable, hostState.isMock, selectedClip, selectedTrack],
  );

  const detailPanelState = useMemo<StudioDetailPanelState>(() => {
    const candidateNativeChainId = selectedTrackId ? nativeChainIdsByTrack[selectedTrackId] : undefined;
    const nativeChainId =
      candidateNativeChainId && Object.prototype.hasOwnProperty.call(hostState.nativeChains, candidateNativeChainId)
        ? candidateNativeChainId
        : undefined;
    const nativeChainNodes =
      selectedTrackId && nativeChainId ? hostState.nativeChains[nativeChainId] ?? [] : undefined;
    const track = selectedTrack ?? null;
    const hasHostBackedDevices = ((track?.device_chain ?? []) as SessionTrack["device_chain"]).some((device) =>
      isHostBackedDevice(device),
    );
    const isConnected = hostState.connectionState === "connected" || hostState.connectionState === "degraded";

    return {
      track,
      isConnected,
      nativeChainId,
      nativeChainNodes,
      nativeNodeCount: nativeChainNodes?.length ?? 0,
      hasHostBackedDevices,
      canLoadNativeChain: isConnected && hasHostBackedDevices && !nativeChainId,
      nativeMonitoring: selectedTrackId ? nativeMonitoringByTrack[selectedTrackId] ?? false : false,
      nativeArmed: selectedTrackId ? nativeArmedByTrack[selectedTrackId] ?? false : false,
      openEditors: hostState.openEditors,
    };
  }, [
    hostState.connectionState,
    hostState.nativeChains,
    hostState.openEditors,
    nativeArmedByTrack,
    nativeChainIdsByTrack,
    nativeMonitoringByTrack,
    selectedTrackId,
    selectedTrack,
  ]);

  const mixerState = useMemo<StudioMixerState>(
    () => ({
      tracks: displayTracks,
      selectedTrackId,
      masterMeter,
      trackMeters,
    }),
    [displayTracks, masterMeter, selectedTrackId, trackMeters],
  );

  return {
    displayTracks,
    displayReturnTracks,
    masterMeter,
    trackMeters,
    trackViewStateById,
    transportSummary,
    connectionSummary,
    panelState,
    selectionSummary: {
      selectedClip,
      selectedTrack,
      ghostNotes,
    } satisfies StudioSelectionSummary,
    pianoRollState,
    detailPanelState,
    mixerState,
  };
}
