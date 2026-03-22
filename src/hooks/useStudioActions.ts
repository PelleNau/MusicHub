import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { StudioSessionDomainRuntimeState } from "@/types/musicHubStudioRuntime";
import type { SessionTrack } from "@/types/studio";
import type { UndoRedoState } from "@/hooks/useUndoRedo";
import { useStudioClipActions } from "@/hooks/useStudioClipActions";
import { useStudioTrackActions } from "@/hooks/useStudioTrackActions";
import type {
  AddTrackMutation,
  CreateClipMutation,
  CreateSessionMutation,
  DeleteClipMutation,
  DeleteTrackMutation,
  UpdateClipMutation,
  UpdateSessionMutation,
  UpdateTrackMutation,
} from "@/hooks/studioMutationTypes";
import { toast } from "sonner";

interface UseStudioActionsOptions {
  activeSessionId: string | null;
  tracks: SessionTrack[];
  sessionDomainModel: StudioSessionDomainRuntimeState;
  addTrack: AddTrackMutation;
  createClip: CreateClipMutation;
  updateTrack: UpdateTrackMutation;
  deleteTrack: DeleteTrackMutation;
  updateClip: UpdateClipMutation;
  deleteClip: DeleteClipMutation;
  updateSession: UpdateSessionMutation;
  createSession: CreateSessionMutation;
  selectedTrackId: string | null;
  history: UndoRedoState;
}

export function useStudioActions({
  activeSessionId,
  tracks,
  sessionDomainModel,
  addTrack,
  createClip,
  updateTrack,
  deleteTrack,
  updateClip,
  deleteClip,
  updateSession,
  createSession,
  selectedTrackId,
  history,
}: UseStudioActionsOptions) {
  const { session: authSession } = useAuth();
  const {
    handleCreateMidiClip,
    handleUpdateMidiNotes,
    handleCreateLinkedDuplicate,
    handleDeleteClip,
    handleDuplicateClip,
    handleRenameClip,
    handleClipColorChange,
    handleSplitClip,
    handleMuteClip,
  } = useStudioClipActions({
    activeSessionId,
    tracks,
    sessionDomainModel,
    createClip,
    updateClip,
    deleteClip,
    history,
  });
  const {
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
  } = useStudioTrackActions({
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
    authUserId: authSession?.user?.id ?? null,
  });

  const handleNewSession = useCallback(async () => {
    try {
      const result = await createSession.mutateAsync({ name: "Untitled Session" });
      toast.success("Session created");
      return result.id as string;
    } catch {
      toast.error("Failed to create session");
      return null;
    }
  }, [createSession]);

  return {
    fileInputRef,
    handleNewSession,
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
    handleCreateMidiClip,
    handleUpdateMidiNotes,
    handleCreateLinkedDuplicate,
    handleAutomationAdd,
    handleAutomationChange,
    handleAutomationRemove,
    handleDeleteClip,
    handleDuplicateClip,
    handleRenameClip,
    handleClipColorChange,
    handleSplitClip,
    handleMuteClip,
  };
}

export type StudioActionsResult = ReturnType<typeof useStudioActions>;
