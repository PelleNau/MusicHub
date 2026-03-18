import type { Dispatch, SetStateAction } from "react";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";
import type { StudioSessionTrackIndex } from "@/domain/studio/studioSessionAdapter";
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
import type { Session, SessionClip, SessionTrack } from "@/types/studio";

export interface StudioSessionDomainRuntimeState {
  trackIndex: StudioSessionTrackIndex;
  sessionMetrics: StudioSessionMetrics;
  selectedClip?: SessionClip;
  selectedTrack?: SessionTrack;
  selectedClipIsMidi: boolean;
  ghostNotes: MidiNote[];
}

export interface StudioSessionMetrics {
  tempo: number;
  timeSignature: string;
  beatsPerBar: number;
  totalBeats: number;
}

export interface StudioSelectionRuntimeState {
  selectedTrackId: string | null;
  setSelectedTrackId: Dispatch<SetStateAction<string | null>>;
  selectedClipIds: Set<string>;
  setSelectedClipIds: Dispatch<SetStateAction<Set<string>>>;
  clearSelectedClipIds: () => void;
  bottomTab: "editor" | "mixer";
  setBottomTab: Dispatch<SetStateAction<"editor" | "mixer">>;
  activeClipId: string | null;
}

export interface StudioSessionPersistenceState {
  session: Session | null | undefined;
  tracks: SessionTrack[];
  isLoading: boolean;
  createSession: CreateSessionMutation;
  updateSession: UpdateSessionMutation;
  addTrack: AddTrackMutation;
  updateTrack: UpdateTrackMutation;
  deleteTrack: DeleteTrackMutation;
  createClip: CreateClipMutation;
  updateClip: UpdateClipMutation;
  deleteClip: DeleteClipMutation;
  deleteSession: {
    mutate: (id: string) => void;
  };
  renameSession: {
    mutate: (variables: { id: string; name: string }) => void;
  };
}

export interface StudioSessionQueryRuntimeState extends StudioSessionPersistenceState {
  sessions: Session[];
}

export interface StudioSessionRuntimeState
  extends StudioSessionQueryRuntimeState,
    StudioSelectionRuntimeState {
  sessionDomainModel: StudioSessionDomainRuntimeState;
}
