import { useSession, useSessions } from "@/hooks/useSession";

export function useStudioSessionQueries(activeSessionId: string | null) {
  const { data: sessions = [] } = useSessions();
  const sessionState = useSession(activeSessionId);

  return {
    sessions,
    ...sessionState,
  };
}

export type StudioSessionQueriesResult = ReturnType<typeof useStudioSessionQueries>;
