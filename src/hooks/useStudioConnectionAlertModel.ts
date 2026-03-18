import type { StudioConnectionSummary } from "@/domain/studio/studioViewContracts";
import type { HostErrorEvent } from "@/services/pluginHostSocket";
import type { ConnectionState } from "@/services/hostConnector";

interface UseStudioConnectionAlertModelOptions {
  connectionSummary: StudioConnectionSummary;
}

export function useStudioConnectionAlertModel({
  connectionSummary,
}: UseStudioConnectionAlertModelOptions) {
  return {
    connectionState: connectionSummary.connectionState as ConnectionState,
    isMock: connectionSummary.isMock,
    inShell: connectionSummary.inShell,
    sidecarStatus: connectionSummary.sidecarStatus,
    lastError: connectionSummary.lastError as HostErrorEvent | null,
  };
}
