import { useStudioSessionQueries } from "@/hooks/useStudioSessionQueries";
import { useStudioSessionDomainModel } from "@/hooks/useStudioSessionDomainModel";
import { useStudioSelection } from "@/hooks/useStudioSelection";
import type { StudioSessionRuntimeState } from "@/types/musicHubStudioRuntime";

export function useStudioSessionState(activeSessionId: string | null): StudioSessionRuntimeState {
  const sessionState = useStudioSessionQueries(activeSessionId);
  const selectionState = useStudioSelection();
  const sessionDomainModel = useStudioSessionDomainModel({
    session: sessionState.session,
    tracks: sessionState.tracks,
    activeClipId: selectionState.activeClipId,
    selectedTrackId: selectionState.selectedTrackId,
  });

  return {
    sessionDomainModel,
    ...sessionState,
    ...selectionState,
  };
}
