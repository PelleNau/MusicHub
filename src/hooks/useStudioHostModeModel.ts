import { useMemo } from "react";
import type { HostConnectorState } from "@/hooks/useHostConnector";

interface UseStudioHostModeModelOptions {
  hostState: HostConnectorState;
}

export function useStudioHostModeModel({
  hostState,
}: UseStudioHostModeModelOptions) {
  return useMemo(
    () => ({
      browserAudioEnabled: hostState.isMock,
      hostAvailable:
        hostState.connectionState === "connected" ||
        hostState.connectionState === "degraded",
    }),
    [hostState.connectionState, hostState.isMock],
  );
}
