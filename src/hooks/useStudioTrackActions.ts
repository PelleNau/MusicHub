import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  AutomationLaneData,
  AutomationPoint,
  DeviceInstance,
  DeviceType,
  SessionTrack,
  TrackSend,
} from "@/types/studio";
import { DEVICE_DEFS, normalizeDeviceChain } from "@/types/studio";
import type { UndoRedoState } from "@/hooks/useUndoRedo";
import type { HostPlugin } from "@/services/pluginHostClient";
import {
  mapSessionTracks,
  setSessionTracks,
  updateSessionTrackInCache,
} from "@/domain/studio/studioSessionCache";
import { invalidateSessionTracks } from "@/domain/studio/studioSessionQueries";
import type { StudioSessionDomainRuntimeState } from "@/types/musicHubStudioRuntime";
import type {
  AddTrackMutation,
  ClipCreatePayload,
  ClipUpdatePayload,
  TrackUpdatePayload,
  UpdateSessionMutation,
  UpdateTrackMutation,
  UpdateClipMutation,
} from "@/hooks/studioMutationTypes";
import { toast } from "sonner";
import {
  buildDefaultHostBackedDevice,
  buildHostPluginDescriptor,
  resolveHostPluginDeviceType,
} from "@/domain/studio/hostBackedDeviceDefaults";

type ReturnTrackType = Extract<SessionTrack["type"], "return">;

function extractPeaks(buffer: AudioBuffer, numPeaks = 200): number[] {
  const channel = buffer.getChannelData(0);
  const step = Math.floor(channel.length / numPeaks);
  const peaks: number[] = [];

  for (let i = 0; i < numPeaks; i++) {
    let max = 0;
    for (let j = i * step; j < (i + 1) * step && j < channel.length; j++) {
      const abs = Math.abs(channel[j]);
      if (abs > max) max = abs;
    }
    peaks.push(max);
  }

  return peaks;
}

interface UseStudioTrackActionsOptions {
  activeSessionId: string | null;
  tracks: SessionTrack[];
  sessionDomainModel: StudioSessionDomainRuntimeState;
  addTrack: AddTrackMutation;
  updateTrack: UpdateTrackMutation;
  deleteTrack: { mutate: (trackId: string) => void };
  updateClip: UpdateClipMutation;
  updateSession: UpdateSessionMutation;
  selectedTrackId: string | null;
  history: UndoRedoState;
  authUserId: string | null;
}

export function useStudioTrackActions({
  activeSessionId,
  tracks,
  sessionDomainModel,
  addTrack,
  updateTrack,
  deleteTrack,
  updateClip,
  updateSession,
  selectedTrackId,
  history,
  authUserId,
}: UseStudioTrackActionsOptions) {
  const { trackIndex, sessionMetrics } = sessionDomainModel;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const debouncedTrackUpdate = useCallback(
    (trackId: string, updates: TrackUpdatePayload, debounceMs = 300) => {
      updateSessionTrackInCache(queryClient, activeSessionId, trackId, updates);

      const key = `${trackId}:${Object.keys(updates).join(",")}`;
      const existing = debounceTimers.current.get(key);
      if (existing) clearTimeout(existing);

      debounceTimers.current.set(
        key,
        setTimeout(() => {
          debounceTimers.current.delete(key);
          updateTrack.mutate({ trackId, updates });
        }, debounceMs)
      );
    },
    [activeSessionId, queryClient, updateTrack]
  );

  const handleAddTrack = useCallback(
    async (type: "audio" | "midi" = "audio") => {
      if (!activeSessionId) return;
      try {
        await addTrack.mutateAsync({
          name:
            type === "midi"
              ? `MIDI ${tracks.filter((track) => track.type === "midi").length + 1}`
              : `Track ${tracks.length + 1}`,
          type,
          color: tracks.length % 21,
          sort_order: tracks.length,
        });
      } catch {
        toast.error("Failed to add track");
      }
    },
    [activeSessionId, addTrack, tracks]
  );

  const handleAddReturn = useCallback(async () => {
    if (!activeSessionId) return;
    const returnCount = tracks.filter((track) => track.type === "return").length;
    try {
      await addTrack.mutateAsync({
        name: String.fromCharCode(65 + returnCount),
        type: "return" as ReturnTrackType,
        color: (10 + returnCount) % 21,
        sort_order: 900 + returnCount,
      });
    } catch {
      toast.error("Failed to add return track");
    }
  }, [activeSessionId, addTrack, tracks]);

  const handleMuteToggle = useCallback(
    (trackId: string) => {
      const track = tracks.find((candidate) => candidate.id === trackId);
      if (!track) return;
      const previousMuted = track.is_muted;

      updateSessionTrackInCache(queryClient, activeSessionId, trackId, { is_muted: !previousMuted });

      updateTrack.mutate({ trackId, updates: { is_muted: !previousMuted } });
      history.push({
        label: `${!previousMuted ? "Mute" : "Unmute"} ${track.name}`,
        undo: () => updateTrack.mutate({ trackId, updates: { is_muted: previousMuted } }),
        redo: () => updateTrack.mutate({ trackId, updates: { is_muted: !previousMuted } }),
      });
    },
    [activeSessionId, history, queryClient, tracks, updateTrack]
  );

  const handleSoloToggle = useCallback(
    (trackId: string) => {
      const track = tracks.find((candidate) => candidate.id === trackId);
      if (!track) return;

      const previousSoloIds = tracks.filter((candidate) => candidate.is_soloed).map((candidate) => candidate.id);
      const nextSoloIds = track.is_soloed ? [] : [trackId];

      mapSessionTracks(queryClient, activeSessionId, (candidate) => ({
        ...candidate,
        is_soloed: nextSoloIds.includes(candidate.id),
      }));

      for (const candidate of tracks) {
        const nextSoloed = nextSoloIds.includes(candidate.id);
        if (candidate.is_soloed === nextSoloed) continue;
        updateTrack.mutate({ trackId: candidate.id, updates: { is_soloed: nextSoloed } });
      }

      history.push({
        label: `${nextSoloIds.length > 0 ? "Solo" : "Unsolo"} ${track.name}`,
        undo: () => {
          mapSessionTracks(queryClient, activeSessionId, (candidate) => ({
            ...candidate,
            is_soloed: previousSoloIds.includes(candidate.id),
          }));
          for (const candidate of tracks) {
            const restoreSoloed = previousSoloIds.includes(candidate.id);
            if (candidate.is_soloed === restoreSoloed) continue;
            updateTrack.mutate({ trackId: candidate.id, updates: { is_soloed: restoreSoloed } });
          }
        },
        redo: () => {
          mapSessionTracks(queryClient, activeSessionId, (candidate) => ({
            ...candidate,
            is_soloed: nextSoloIds.includes(candidate.id),
          }));
          for (const candidate of tracks) {
            const redoSoloed = nextSoloIds.includes(candidate.id);
            if (candidate.is_soloed === redoSoloed) continue;
            updateTrack.mutate({ trackId: candidate.id, updates: { is_soloed: redoSoloed } });
          }
        },
      });
    },
    [activeSessionId, history, queryClient, tracks, updateTrack]
  );

  const handleVolumeChange = useCallback(
    (trackId: string, volume: number) => {
      debouncedTrackUpdate(trackId, { volume });
    },
    [debouncedTrackUpdate]
  );

  const handlePanChange = useCallback(
    (trackId: string, pan: number) => {
      debouncedTrackUpdate(trackId, { pan });
    },
    [debouncedTrackUpdate]
  );

  const handleSendChange = useCallback(
    (trackId: string, sends: TrackSend[]) => {
      debouncedTrackUpdate(trackId, { sends });
    },
    [debouncedTrackUpdate]
  );

  const handleRenameTrack = useCallback(
    (trackId: string, name: string) => {
      const track = tracks.find((candidate) => candidate.id === trackId);
      if (!track) return;
      const previousName = track.name;
      updateTrack.mutate({ trackId, updates: { name } });
      history.push({
        label: `Rename track "${previousName}" → "${name}"`,
        undo: () => updateTrack.mutate({ trackId, updates: { name: previousName } }),
        redo: () => updateTrack.mutate({ trackId, updates: { name } }),
      });
    },
    [history, tracks, updateTrack]
  );

  const handleDeleteTrack = useCallback(
    (trackId: string) => {
      deleteTrack.mutate(trackId);
      toast.success("Track deleted");
    },
    [deleteTrack]
  );

  const handleColorChange = useCallback(
    (trackId: string, color: number) => {
      const track = tracks.find((candidate) => candidate.id === trackId);
      if (!track) return;
      const previousColor = track.color;
      updateTrack.mutate({ trackId, updates: { color } });
      history.push({
        label: "Change track color",
        undo: () => updateTrack.mutate({ trackId, updates: { color: previousColor } }),
        redo: () => updateTrack.mutate({ trackId, updates: { color } }),
      });
    },
    [history, tracks, updateTrack]
  );

  const handleClipMove = useCallback(
    (clipId: string, newStartBeats: number, targetTrackId?: string) => {
      const sourceTrackId = trackIndex.trackIdByClipId[clipId];
      const sourceTrack = sourceTrackId ? trackIndex.trackById[sourceTrackId] : undefined;
      const clip = trackIndex.clipById[clipId];
      if (!clip || !sourceTrack) return;

      const duration = clip.end_beats - clip.start_beats;
      const previousStart = clip.start_beats;
      const previousEnd = clip.end_beats;
      const previousTrackId = sourceTrack.id;
      const nextTrackId = targetTrackId || sourceTrack.id;
      const isTrackChange = nextTrackId !== previousTrackId;

      const updates: ClipUpdatePayload = {
        start_beats: newStartBeats,
        end_beats: newStartBeats + duration,
      };
      if (isTrackChange) {
        updates.track_id = nextTrackId;
      }

      setSessionTracks(queryClient, activeSessionId, (existingTracks) =>
        existingTracks.map((track) => {
          const clips = track.clips || [];

          if (isTrackChange) {
            if (track.id === previousTrackId) {
              return { ...track, clips: clips.filter((candidate) => candidate.id !== clipId) };
            }
            if (track.id === nextTrackId) {
              return {
                ...track,
                clips: [...clips, { ...clip, ...updates, track_id: nextTrackId }],
              };
            }
            return track;
          }

          if (track.id !== previousTrackId) return track;
          return {
            ...track,
            clips: clips.map((candidate) => (candidate.id === clipId ? { ...candidate, ...updates } : candidate)),
          };
        }),
      );

      updateClip.mutate({ clipId, updates });
      history.push({
        label: `Move clip "${clip.name}"${isTrackChange ? " to another track" : ""}`,
        undo: () => {
          const undoUpdates: ClipUpdatePayload = {
            start_beats: previousStart,
            end_beats: previousEnd,
          };
          if (isTrackChange) {
            undoUpdates.track_id = previousTrackId;
          }
          updateClip.mutate({ clipId, updates: undoUpdates });
          invalidateSessionTracks(queryClient, activeSessionId);
        },
        redo: () => {
          updateClip.mutate({ clipId, updates });
          invalidateSessionTracks(queryClient, activeSessionId);
        },
      });
    },
    [activeSessionId, history, queryClient, trackIndex, updateClip]
  );

  const handleClipResize = useCallback(
    (clipId: string, newStartBeats: number, newEndBeats: number) => {
      const clip = trackIndex.clipById[clipId];
      const previousStart = clip?.start_beats ?? newStartBeats;
      const previousEnd = clip?.end_beats ?? newEndBeats;

      updateClip.mutate({ clipId, updates: { start_beats: newStartBeats, end_beats: newEndBeats } });
      history.push({
        label: "Resize clip",
        undo: () =>
          updateClip.mutate({
            clipId,
            updates: { start_beats: previousStart, end_beats: previousEnd },
          }),
        redo: () =>
          updateClip.mutate({
            clipId,
            updates: { start_beats: newStartBeats, end_beats: newEndBeats },
          }),
      });
    },
    [history, trackIndex, updateClip]
  );

  const handleDeviceChainChange = useCallback(
    (trackId: string, devices: DeviceInstance[]) => {
      const track = tracks.find((candidate) => candidate.id === trackId);
      const previousDevices = normalizeDeviceChain((track?.device_chain || []) as DeviceInstance[]);
      const normalizedDevices = normalizeDeviceChain(devices);

      updateSessionTrackInCache(queryClient, activeSessionId, trackId, { device_chain: normalizedDevices });

      updateTrack.mutate({ trackId, updates: { device_chain: normalizedDevices } });
      history.push({
        label: "Change device chain",
        undo: () => updateTrack.mutate({ trackId, updates: { device_chain: previousDevices } }),
        redo: () => updateTrack.mutate({ trackId, updates: { device_chain: normalizedDevices } }),
      });
    },
    [activeSessionId, history, queryClient, tracks, updateTrack]
  );

  const handleBrowserAddDevice = useCallback(
    (type: DeviceType) => {
      if (!selectedTrackId) {
        toast.info("Select a track first");
        return;
      }

      const track = tracks.find((candidate) => candidate.id === selectedTrackId);
      if (!track) return;

      const definition = DEVICE_DEFS.find((candidate) => candidate.type === type);
      if (!definition) return;

      const defaults: Record<string, number> = {};
      for (const param of definition.params) defaults[param.key] = param.default;

      const newDevice = buildDefaultHostBackedDevice(type, defaults);

      const existing = (track.device_chain || []) as DeviceInstance[];
      handleDeviceChainChange(track.id, [...existing, newDevice]);
      toast.success(`Added ${definition.label} to ${track.name}`);
    },
    [handleDeviceChainChange, selectedTrackId, tracks]
  );

  const handleBrowserAddHostPlugin = useCallback(
    (plugin: HostPlugin) => {
      if (!selectedTrackId) {
        toast.info("Select a track first");
        return;
      }

      const track = tracks.find((candidate) => candidate.id === selectedTrackId);
      if (!track) return;

      const newDevice: DeviceInstance = {
        id: crypto.randomUUID(),
        type: resolveHostPluginDeviceType(plugin),
        enabled: true,
        params: {},
        hostPlugin: buildHostPluginDescriptor(plugin),
      };

      const existing = (track.device_chain || []) as DeviceInstance[];
      handleDeviceChainChange(track.id, [...existing, newDevice]);
      toast.success(`Added ${plugin.name} to ${track.name}`);
    },
    [handleDeviceChainChange, selectedTrackId, tracks]
  );

  const handleReorderTrack = useCallback(
    (trackId: string, direction: "up" | "down") => {
      const index = tracks.findIndex((track) => track.id === trackId);
      if (index < 0) return;

      const track = tracks[index];
      const isReturn = track.type === "return";
      const sameGroup = tracks.filter((candidate) => (candidate.type === "return") === isReturn);
      const groupIndex = sameGroup.findIndex((candidate) => candidate.id === trackId);
      const swapIndex = direction === "up" ? groupIndex - 1 : groupIndex + 1;
      if (swapIndex < 0 || swapIndex >= sameGroup.length) return;

      const swapTrack = sameGroup[swapIndex];
      const sourceSort = track.sort_order;
      const swapSort = swapTrack.sort_order;

      updateTrack.mutate({ trackId: track.id, updates: { sort_order: swapSort } });
      updateTrack.mutate({ trackId: swapTrack.id, updates: { sort_order: sourceSort } });
      history.push({
        label: `Reorder track "${track.name}" ${direction}`,
        undo: () => {
          updateTrack.mutate({ trackId: track.id, updates: { sort_order: sourceSort } });
          updateTrack.mutate({ trackId: swapTrack.id, updates: { sort_order: swapSort } });
        },
        redo: () => {
          updateTrack.mutate({ trackId: track.id, updates: { sort_order: swapSort } });
          updateTrack.mutate({ trackId: swapTrack.id, updates: { sort_order: sourceSort } });
        },
      });
    },
    [history, tracks, updateTrack]
  );

  const handleTempoChange = useCallback(
    (newTempo: number) => {
      if (!activeSessionId) return;
      const previousTempo = sessionMetrics.tempo;
      updateSession.mutate({ tempo: newTempo });
      history.push({
        label: `Tempo ${previousTempo} → ${newTempo}`,
        undo: () => updateSession.mutate({ tempo: previousTempo }),
        redo: () => updateSession.mutate({ tempo: newTempo }),
      });
    },
    [activeSessionId, history, sessionMetrics.tempo, updateSession]
  );

  const handleAudioUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !activeSessionId || !authUserId) return;

      const extension = file.name.split(".").pop() || "wav";
      const storagePath = `${authUserId}/${activeSessionId}/${crypto.randomUUID()}.${extension}`;

      toast.info("Uploading audio…");

      const { error: uploadError } = await supabase.storage.from("audio-clips").upload(storagePath, file);
      if (uploadError) {
        toast.error("Upload failed");
        return;
      }

      const { data: urlData } = supabase.storage.from("audio-clips").getPublicUrl(storagePath);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const peaks = extractPeaks(audioBuffer);
        const currentTempo = sessionMetrics.tempo || 120;
        const rawBeats = (audioBuffer.duration / 60) * currentTempo;
        const beatsPerBar = 4;
        const durationBeats = Math.max(beatsPerBar, Math.ceil(rawBeats / beatsPerBar) * beatsPerBar);

        const trackResult = await addTrack.mutateAsync({
          name: file.name.replace(/\.[^.]+$/, ""),
          type: "audio",
          color: tracks.length % 21,
          sort_order: tracks.length,
        });

        const insertPayload: ClipCreatePayload = {
          track_id: trackResult.id,
          name: file.name.replace(/\.[^.]+$/, ""),
          start_beats: 0,
          end_beats: durationBeats,
          color: tracks.length % 21,
          is_midi: false,
          is_muted: false,
          audio_url: urlData.publicUrl,
          waveform_peaks: peaks,
        };
        const { error } = await supabase.from("session_clips").insert([insertPayload]);
        if (error) throw error;

        await invalidateSessionTracks(queryClient, activeSessionId);
        toast.success("Audio added");
        audioContext.close();
      } catch {
        toast.error("Failed to process audio");
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [activeSessionId, addTrack, authUserId, queryClient, sessionMetrics.tempo, tracks.length]
  );

  const handleAutomationAdd = useCallback(
    (trackId: string, target: string, label: string) => {
      const track = tracks.find((candidate) => candidate.id === trackId);
      if (!track) return;

      const existing = (track.automation_lanes || []) as AutomationLaneData[];
      if (existing.some((lane) => lane.target === target)) return;

      const newLane: AutomationLaneData = {
        id: crypto.randomUUID(),
        target,
        label,
        visible: true,
        points: [],
      };

      const updated = [...existing, newLane];
      updateTrack.mutate({ trackId, updates: { automation_lanes: updated } });
      history.push({
        label: `Add automation: ${label}`,
        undo: () => updateTrack.mutate({ trackId, updates: { automation_lanes: existing } }),
        redo: () => updateTrack.mutate({ trackId, updates: { automation_lanes: updated } }),
      });
    },
    [history, tracks, updateTrack]
  );

  const handleAutomationChange = useCallback(
    (trackId: string, laneId: string, points: AutomationPoint[]) => {
      const track = tracks.find((candidate) => candidate.id === trackId);
      if (!track) return;

      const lanes = (track.automation_lanes || []) as AutomationLaneData[];
      const updated = lanes.map((lane) => (lane.id === laneId ? { ...lane, points } : lane));
      debouncedTrackUpdate(trackId, { automation_lanes: updated }, 500);
    },
    [debouncedTrackUpdate, tracks]
  );

  const handleAutomationRemove = useCallback(
    (trackId: string, laneId: string) => {
      const track = tracks.find((candidate) => candidate.id === trackId);
      if (!track) return;

      const existing = (track.automation_lanes || []) as AutomationLaneData[];
      const lane = existing.find((candidate) => candidate.id === laneId);
      const updated = existing.filter((candidate) => candidate.id !== laneId);
      updateTrack.mutate({ trackId, updates: { automation_lanes: updated } });

      if (lane) {
        history.push({
          label: `Remove automation: ${lane.label}`,
          undo: () => updateTrack.mutate({ trackId, updates: { automation_lanes: existing } }),
          redo: () => updateTrack.mutate({ trackId, updates: { automation_lanes: updated } }),
        });
      }
    },
    [history, tracks, updateTrack]
  );

  return {
    fileInputRef,
    handleAddTrack,
    handleAddReturn,
    handleMuteToggle,
    handleSoloToggle,
    handleVolumeChange,
    handlePanChange,
    handleSendChange,
    handleRenameTrack,
    handleDeleteTrack,
    handleColorChange,
    handleClipMove,
    handleClipResize,
    handleDeviceChainChange,
    handleBrowserAddDevice,
    handleBrowserAddHostPlugin,
    handleReorderTrack,
    handleTempoChange,
    handleAudioUpload,
    handleAutomationAdd,
    handleAutomationChange,
    handleAutomationRemove,
  };
}
