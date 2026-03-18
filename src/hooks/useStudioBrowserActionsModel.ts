import { useMemo } from "react";
import type { DeviceType } from "@/types/studio";
import type { HostPlugin } from "@/services/pluginHostClient";
import type { StudioCommandDispatchResult } from "@/hooks/useStudioCommandDispatch";

interface UseStudioBrowserActionsModelOptions {
  hostPlugins: HostPlugin[];
  commandDispatch: StudioCommandDispatchResult;
  onRefreshHostPlugins?: () => void;
}

export function useStudioBrowserActionsModel({
  hostPlugins,
  commandDispatch,
  onRefreshHostPlugins,
}: UseStudioBrowserActionsModelOptions) {
  return useMemo(
    () => ({
      hostPlugins,
      onAddDevice: (type: DeviceType) => commandDispatch.addDevice(type),
      onAddHostPlugin: (plugin: HostPlugin) =>
        commandDispatch.addHostPlugin(plugin.id, plugin.name, plugin.path),
      onRefreshHostPlugins,
    }),
    [commandDispatch, hostPlugins, onRefreshHostPlugins],
  );
}

export type StudioBrowserActionsModelResult = ReturnType<typeof useStudioBrowserActionsModel>;
