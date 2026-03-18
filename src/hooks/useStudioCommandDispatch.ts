import { useCallback } from "react";
import type {
  BrowserAddDeviceCommand,
  BrowserAddHostPluginCommand,
  MusicHubCommand,
  MusicHubCommandAck,
  PanelType,
  StudioCreateTrackCommand,
  StudioCreateClipCommand,
  StudioDeleteMidiNotesCommand,
  StudioDeleteTrackCommand,
  StudioDeleteClipCommand,
  StudioDuplicateClipCommand,
  StudioInsertMidiNotesCommand,
  StudioClosePanelCommand,
  StudioOpenPanelCommand,
  StudioSelectCommand,
  StudioUpdateMidiNotesCommand,
  StudioUpdateTrackCommand,
  StudioUpdateClipCommand,
  StudioReplaceMidiNotesCommand,
  TransportPauseCommand,
  TransportPlayCommand,
  TransportSeekCommand,
  TransportSetLoopCommand,
  TransportSetTempoCommand,
  TransportStopCommand,
} from "@/types/musicHubCommands";
import {
  deleteMidiNotes as deleteMidiNotesFromArray,
  extractMidiNotesFromData,
  fromReplaceMidiNotesCommand,
  insertMidiNotes as insertMidiNotesIntoArray,
  updateMidiNotes as updateMidiNotesInArray,
} from "@/domain/studio/studioMidiCommandProtocol";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";

interface UseStudioCommandDispatchOptions {
  sessionId?: string | null;
  projectId?: string | null;
  currentBeat: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  selectedClipIds: Set<string>;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (beat: number) => void;
  onSetLoop: (enabled: boolean, start: number, end: number) => void;
  onToggleLoop: () => void;
  onSetTempo: (bpm: number) => void;
  onCreateTrack?: (
    type: "audio" | "midi" | "group" | "return",
    role?: "standard" | "instrument" | "vocal" | "drum" | "bus",
    name?: string,
  ) => void;
  onUpdateTrack?: (trackId: string, patch: Partial<{
    name: string;
    color: number;
    muted: boolean;
    solo: boolean;
    monitoring: "off" | "auto" | "in";
    armed: boolean;
  }>) => void;
  onDeleteTrack?: (trackId: string) => void;
  onCreateMidiClip?: (trackId: string, startBeats: number, durationBeats?: number) => void;
  onUpdateClip?: (
    clipId: string,
    patch: Partial<{
      startBeat: number;
      lengthBeats: number;
      offsetBeats: number;
      looped: boolean;
      muted: boolean;
      name: string;
      color: number;
      midiData: unknown;
    }>,
  ) => void;
  onReplaceMidiNotes?: (
    clipId: string,
    notes: StudioReplaceMidiNotesCommand["payload"]["notes"],
  ) => void;
  resolveMidiNotes?: (clipId: string) => MidiNote[];
  onDeleteClip?: (clipId: string) => void;
  onDuplicateClip?: (clipId: string, linked?: boolean) => void;
  onAddDevice?: (deviceType: string) => void;
  onAddHostPlugin?: (pluginId: string) => void;
  onCommandRecorded?: (command: MusicHubCommand, ack: MusicHubCommandAck) => void;
  setSelectedTrackId: (trackId: string | null) => void;
  setSelectedClipIds: (ids: Set<string>) => void;
  setBottomTab: React.Dispatch<React.SetStateAction<"editor" | "mixer">>;
}

function createAck(command: MusicHubCommand, affectedIds?: string[]): MusicHubCommandAck {
  return {
    commandId: command.id,
    accepted: true,
    status: "applied_local",
    affectedIds,
  };
}

function createEnvelope<TCommand extends MusicHubCommand>(
  command: TCommand,
  sessionId?: string | null,
  projectId?: string | null,
): TCommand {
  return {
    ...command,
    sessionId: command.sessionId ?? sessionId ?? undefined,
    projectId: command.projectId ?? projectId ?? undefined,
  };
}

export function useStudioCommandDispatch({
  sessionId,
  projectId,
  currentBeat,
  loopEnabled,
  loopStart,
  loopEnd,
  selectedClipIds,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onSetLoop,
  onToggleLoop,
  onSetTempo,
  onCreateTrack,
  onUpdateTrack,
  onDeleteTrack,
  onCreateMidiClip,
  onUpdateClip,
  onReplaceMidiNotes,
  resolveMidiNotes,
  onDeleteClip,
  onDuplicateClip,
  onAddDevice,
  onAddHostPlugin,
  onCommandRecorded,
  setSelectedTrackId,
  setSelectedClipIds,
  setBottomTab,
}: UseStudioCommandDispatchOptions) {
  const dispatch = useCallback(
    (rawCommand: MusicHubCommand): MusicHubCommandAck => {
      const command = createEnvelope(rawCommand, sessionId, projectId);
      let ack: MusicHubCommandAck;

      switch (command.type) {
        case "transport.play":
          onPlay();
          ack = createAck(command);
          break;
        case "transport.pause":
          onPause();
          ack = createAck(command);
          break;
        case "transport.stop":
          onStop();
          ack = createAck(command);
          break;
        case "transport.seek":
          onSeek(command.payload.beat);
          ack = createAck(command);
          break;
        case "transport.setLoop":
          if (command.payload.enabled !== loopEnabled) {
            onToggleLoop();
          }
          onSetLoop(
            command.payload.enabled,
            command.payload.startBeat ?? loopStart,
            command.payload.endBeat ?? loopEnd,
          );
          ack = createAck(command);
          break;
        case "transport.setTempo":
          onSetTempo(command.payload.bpm);
          ack = createAck(command);
          break;
        case "studio.createTrack":
          if (!onCreateTrack) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "Track create handler unavailable",
            };
            break;
          }
          onCreateTrack(command.payload.type, command.payload.role, command.payload.name);
          ack = createAck(command);
          break;
        case "studio.updateTrack":
          if (!onUpdateTrack) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "Track update handler unavailable",
            };
            break;
          }
          onUpdateTrack(command.payload.trackId, command.payload.patch);
          ack = createAck(command, [command.payload.trackId]);
          break;
        case "studio.deleteTrack":
          if (!onDeleteTrack) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "Track delete handler unavailable",
            };
            break;
          }
          onDeleteTrack(command.payload.trackId);
          ack = createAck(command, [command.payload.trackId]);
          break;
        case "studio.createClip":
          if (!onCreateMidiClip || command.payload.clipType !== "midi") {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "Clip creation handler unavailable for requested clip type",
            };
            break;
          }
          onCreateMidiClip(
            command.payload.trackId,
            command.payload.startBeat,
            command.payload.lengthBeats,
          );
          ack = createAck(command, [command.payload.trackId]);
          break;
        case "studio.updateClip":
          if (!onUpdateClip) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "Clip update handler unavailable",
            };
            break;
          }
          onUpdateClip(command.payload.clipId, command.payload.patch);
          ack = createAck(command, [command.payload.clipId]);
          break;
        case "studio.deleteClip":
          if (!onDeleteClip) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "Clip delete handler unavailable",
            };
            break;
          }
          onDeleteClip(command.payload.clipId);
          ack = createAck(command, [command.payload.clipId]);
          break;
        case "studio.replaceMidiNotes":
          if (!onReplaceMidiNotes) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "MIDI note replace handler unavailable",
            };
            break;
          }
          onReplaceMidiNotes(command.payload.clipId, command.payload.notes);
          ack = createAck(command, [command.payload.clipId]);
          break;
        case "studio.insertMidiNotes":
          if (!onReplaceMidiNotes || !resolveMidiNotes) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "MIDI note insert handler unavailable",
            };
            break;
          }
          onReplaceMidiNotes(
            command.payload.clipId,
            insertMidiNotesIntoArray(resolveMidiNotes(command.payload.clipId), command.payload.notes).map((note) => ({
              id: note.id,
              pitch: note.pitch,
              startBeat: note.start,
              lengthBeats: note.duration,
              velocity: note.velocity,
            })),
          );
          ack = createAck(command, [command.payload.clipId]);
          break;
        case "studio.updateMidiNotes":
          if (!onReplaceMidiNotes || !resolveMidiNotes) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "MIDI note update handler unavailable",
            };
            break;
          }
          onReplaceMidiNotes(
            command.payload.clipId,
            updateMidiNotesInArray(resolveMidiNotes(command.payload.clipId), command.payload.notes).map((note) => ({
              id: note.id,
              pitch: note.pitch,
              startBeat: note.start,
              lengthBeats: note.duration,
              velocity: note.velocity,
            })),
          );
          ack = createAck(command, [command.payload.clipId]);
          break;
        case "studio.deleteMidiNotes":
          if (!onReplaceMidiNotes || !resolveMidiNotes) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "MIDI note delete handler unavailable",
            };
            break;
          }
          onReplaceMidiNotes(
            command.payload.clipId,
            deleteMidiNotesFromArray(resolveMidiNotes(command.payload.clipId), command.payload.noteIds).map((note) => ({
              id: note.id,
              pitch: note.pitch,
              startBeat: note.start,
              lengthBeats: note.duration,
              velocity: note.velocity,
            })),
          );
          ack = createAck(command, [command.payload.clipId]);
          break;
        case "studio.duplicateClip":
          if (!onDuplicateClip) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "Clip duplicate handler unavailable",
            };
            break;
          }
          onDuplicateClip(command.payload.clipId, command.payload.linked);
          ack = createAck(command, [command.payload.clipId]);
          break;
        case "studio.select":
          {
            const selectionMode = command.payload.mode ?? "replace";
            let nextClipIds = selectedClipIds;

            if (selectionMode === "clear") {
              nextClipIds = new Set();
            } else if (command.payload.clipId) {
              if (selectionMode === "toggle") {
                nextClipIds = new Set(selectedClipIds);
                if (nextClipIds.has(command.payload.clipId)) nextClipIds.delete(command.payload.clipId);
                else nextClipIds.add(command.payload.clipId);
              } else if (selectionMode === "add") {
                nextClipIds = new Set([...selectedClipIds, command.payload.clipId]);
              } else {
                nextClipIds = new Set([command.payload.clipId]);
              }
            } else if (command.payload.noteIds || command.payload.trackId !== undefined) {
              nextClipIds = new Set();
            }

            if (command.payload.trackId !== undefined) {
              setSelectedTrackId(command.payload.trackId ?? null);
            }
            setSelectedClipIds(nextClipIds);
            if (command.payload.panel === "mixer") {
              setBottomTab("mixer");
            } else if (command.payload.panel) {
              setBottomTab("editor");
            }
            ack = createAck(command, [
              ...(command.payload.trackId ? [command.payload.trackId] : []),
              ...nextClipIds,
            ]);
          }
          break;
        case "studio.openPanel":
          if (command.payload.panel === "mixer") setBottomTab("mixer");
          else setBottomTab("editor");
          ack = createAck(command, [command.payload.panel]);
          break;
        case "studio.closePanel":
          if (command.payload.panel === "mixer") setBottomTab("editor");
          ack = createAck(command, [command.payload.panel]);
          break;
        case "browser.addDevice":
          if (!onAddDevice) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "Browser add-device handler unavailable",
            };
            break;
          }
          onAddDevice(command.payload.deviceType);
          ack = createAck(command, [command.payload.deviceType]);
          break;
        case "browser.addHostPlugin":
          if (!onAddHostPlugin) {
            ack = {
              commandId: command.id,
              accepted: false,
              status: "rejected",
              reason: "Browser add-host-plugin handler unavailable",
            };
            break;
          }
          onAddHostPlugin(command.payload.pluginId);
          ack = createAck(command, [command.payload.pluginId]);
          break;
        default:
          ack = {
            commandId: command.id,
            accepted: false,
            status: "rejected",
            reason: `Unhandled command type: ${command.type}`,
          };
          break;
      }

      onCommandRecorded?.(command, ack);
      return ack;
    },
    [
      loopEnd,
      loopEnabled,
      loopStart,
      onCreateTrack,
      onCommandRecorded,
      onPause,
      onPlay,
      onCreateMidiClip,
      onDeleteTrack,
      onDeleteClip,
      onDuplicateClip,
      onAddDevice,
      onAddHostPlugin,
      onSeek,
      onSetLoop,
      onToggleLoop,
      onSetTempo,
      onStop,
      onUpdateTrack,
      onUpdateClip,
      onReplaceMidiNotes,
      resolveMidiNotes,
      projectId,
      selectedClipIds,
      sessionId,
      setBottomTab,
      setSelectedClipIds,
      setSelectedTrackId,
    ],
  );

  const play = useCallback(() => {
    const command: TransportPlayCommand = {
      id: crypto.randomUUID(),
      type: "transport.play",
      source: "user",
      createdAt: new Date().toISOString(),
      payload: {},
    };
    return dispatch(command);
  }, [dispatch]);

  const pause = useCallback(() => {
    const command: TransportPauseCommand = {
      id: crypto.randomUUID(),
      type: "transport.pause",
      source: "user",
      createdAt: new Date().toISOString(),
      payload: {},
    };
    return dispatch(command);
  }, [dispatch]);

  const stop = useCallback(() => {
    const command: TransportStopCommand = {
      id: crypto.randomUUID(),
      type: "transport.stop",
      source: "user",
      createdAt: new Date().toISOString(),
      payload: {},
    };
    return dispatch(command);
  }, [dispatch]);

  const seek = useCallback(
    (beat: number) => {
      const command: TransportSeekCommand = {
        id: crypto.randomUUID(),
        type: "transport.seek",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { beat },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const setLoop = useCallback(
    (enabled: boolean, startBeat?: number, endBeat?: number) => {
      const command: TransportSetLoopCommand = {
        id: crypto.randomUUID(),
        type: "transport.setLoop",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { enabled, startBeat, endBeat },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const setTempo = useCallback(
    (bpm: number) => {
      const command: TransportSetTempoCommand = {
        id: crypto.randomUUID(),
        type: "transport.setTempo",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { bpm },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const updateTrack = useCallback(
    (trackId: string, patch: StudioUpdateTrackCommand["payload"]["patch"]) => {
      const command: StudioUpdateTrackCommand = {
        id: crypto.randomUUID(),
        type: "studio.updateTrack",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { trackId, patch },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const createTrack = useCallback(
    (
      type: StudioCreateTrackCommand["payload"]["type"],
      options?: Pick<StudioCreateTrackCommand["payload"], "role" | "name">,
    ) => {
      const command: StudioCreateTrackCommand = {
        id: crypto.randomUUID(),
        type: "studio.createTrack",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: {
          type,
          role: options?.role,
          name: options?.name,
        },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const createMidiClip = useCallback(
    (trackId: string, startBeat: number, lengthBeats = 4) => {
      const command: StudioCreateClipCommand = {
        id: crypto.randomUUID(),
        type: "studio.createClip",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: {
          trackId,
          clipType: "midi",
          startBeat,
          lengthBeats,
        },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const deleteTrack = useCallback(
    (trackId: string) => {
      const command: StudioDeleteTrackCommand = {
        id: crypto.randomUUID(),
        type: "studio.deleteTrack",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { trackId },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const updateClip = useCallback(
    (
      clipId: string,
      patch: StudioUpdateClipCommand["payload"]["patch"],
    ) => {
      const command: StudioUpdateClipCommand = {
        id: crypto.randomUUID(),
        type: "studio.updateClip",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { clipId, patch },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const deleteClip = useCallback(
    (clipId: string) => {
      const command: StudioDeleteClipCommand = {
        id: crypto.randomUUID(),
        type: "studio.deleteClip",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { clipId },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const replaceMidiNotes = useCallback(
    (
      clipId: string,
      notes: StudioReplaceMidiNotesCommand["payload"]["notes"],
    ) => {
      const command: StudioReplaceMidiNotesCommand = {
        id: crypto.randomUUID(),
        type: "studio.replaceMidiNotes",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { clipId, notes },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const insertMidiNotes = useCallback(
    (
      clipId: string,
      notes: StudioInsertMidiNotesCommand["payload"]["notes"],
    ) => {
      const command: StudioInsertMidiNotesCommand = {
        id: crypto.randomUUID(),
        type: "studio.insertMidiNotes",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { clipId, notes },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const updateMidiNotes = useCallback(
    (
      clipId: string,
      notes: StudioUpdateMidiNotesCommand["payload"]["notes"],
    ) => {
      const command: StudioUpdateMidiNotesCommand = {
        id: crypto.randomUUID(),
        type: "studio.updateMidiNotes",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { clipId, notes },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const deleteMidiNotes = useCallback(
    (
      clipId: string,
      noteIds: StudioDeleteMidiNotesCommand["payload"]["noteIds"],
    ) => {
      const command: StudioDeleteMidiNotesCommand = {
        id: crypto.randomUUID(),
        type: "studio.deleteMidiNotes",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { clipId, noteIds },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const duplicateClip = useCallback(
    (clipId: string, linked = false) => {
      const command: StudioDuplicateClipCommand = {
        id: crypto.randomUUID(),
        type: "studio.duplicateClip",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { clipId, linked },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const select = useCallback(
    (payload: StudioSelectCommand["payload"]) => {
      const command: StudioSelectCommand = {
        id: crypto.randomUUID(),
        type: "studio.select",
        source: "user",
        createdAt: new Date().toISOString(),
        payload,
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const clearSelection = useCallback(() => {
    return select({ mode: "clear" });
  }, [select]);

  const openPanel = useCallback(
    (panel: PanelType) => {
      const command: StudioOpenPanelCommand = {
        id: crypto.randomUUID(),
        type: "studio.openPanel",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { panel },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const closePanel = useCallback(
    (panel: PanelType) => {
      const command: StudioClosePanelCommand = {
        id: crypto.randomUUID(),
        type: "studio.closePanel",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { panel },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const addDevice = useCallback(
    (deviceType: string) => {
      const command: BrowserAddDeviceCommand = {
        id: crypto.randomUUID(),
        type: "browser.addDevice",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { deviceType },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  const addHostPlugin = useCallback(
    (pluginId: string, pluginName?: string, pluginPath?: string) => {
      const command: BrowserAddHostPluginCommand = {
        id: crypto.randomUUID(),
        type: "browser.addHostPlugin",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { pluginId, pluginName, pluginPath },
      };
      return dispatch(command);
    },
    [dispatch],
  );

  return {
    dispatch,
    play,
    pause,
    stop,
    seek,
    setLoop,
    setTempo,
    createTrack,
    updateTrack,
    deleteTrack,
    createMidiClip,
    updateClip,
    replaceMidiNotes,
    insertMidiNotes,
    updateMidiNotes,
    deleteMidiNotes,
    deleteClip,
    duplicateClip,
    select,
    clearSelection,
    addDevice,
    addHostPlugin,
    openPanel,
    closePanel,
    currentBeat,
    loopEnabled,
  };
}

export type StudioCommandDispatchResult = ReturnType<typeof useStudioCommandDispatch>;
