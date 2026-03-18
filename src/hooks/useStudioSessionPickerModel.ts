import { useCallback, useMemo } from "react";
import { toast } from "sonner";

interface UseStudioSessionPickerModelOptions {
  createSession: { isPending: boolean };
  onCreateSession: () => Promise<string | null>;
  onSelectSession: (id: string | null) => void;
  onSignOut: () => void;
  onDeleteSession: (id: string, options: { onSuccess: () => void; onError: () => void }) => void;
  onRenameSession: (
    payload: { id: string; name: string },
    options: { onSuccess: () => void; onError: () => void },
  ) => void;
}

export function useStudioSessionPickerModel({
  createSession,
  onCreateSession,
  onSelectSession,
  onSignOut,
  onDeleteSession,
  onRenameSession,
}: UseStudioSessionPickerModelOptions) {
  const createAndSelectSession = useCallback(async () => {
    const id = await onCreateSession();
    if (id) onSelectSession(id);
  }, [onCreateSession, onSelectSession]);

  const deleteSession = useCallback(
    (id: string) => {
      onDeleteSession(id, {
        onSuccess: () => toast.success("Session deleted"),
        onError: () => toast.error("Failed to delete session"),
      });
    },
    [onDeleteSession],
  );

  const renameSession = useCallback(
    (id: string, name: string) => {
      onRenameSession(
        { id, name },
        {
          onSuccess: () => toast.success("Session renamed"),
          onError: () => toast.error("Failed to rename session"),
        },
      );
    },
    [onRenameSession],
  );

  return useMemo(
    () => ({
      isCreating: createSession.isPending,
      onNewSession: createAndSelectSession,
      onSelectSession,
      onSignOut,
      onDeleteSession: deleteSession,
      onRenameSession: renameSession,
    }),
    [
      createAndSelectSession,
      createSession.isPending,
      deleteSession,
      onSelectSession,
      onSignOut,
      renameSession,
    ],
  );
}
