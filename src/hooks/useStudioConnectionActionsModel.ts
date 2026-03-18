import { useMemo } from "react";
import type { StudioConnectionSummary } from "@/domain/studio/studioViewContracts";

interface UseStudioConnectionActionsModelOptions {
  connectionSummary: StudioConnectionSummary;
  onConnect: () => void;
  onDisconnect: () => void;
  onRestartShellHost: () => void;
  onToggleRecord?: () => void;
}

export function useStudioConnectionActionsModel({
  connectionSummary,
  onConnect,
  onDisconnect,
  onRestartShellHost,
  onToggleRecord,
}: UseStudioConnectionActionsModelOptions) {
  return useMemo(
    () => ({
      connectionSummary,
      onConnect,
      onDisconnect,
      onRestartShellHost,
      onToggleRecord,
    }),
    [
      connectionSummary,
      onConnect,
      onDisconnect,
      onRestartShellHost,
      onToggleRecord,
    ],
  );
}

export type StudioConnectionActionsModelResult = ReturnType<typeof useStudioConnectionActionsModel>;
