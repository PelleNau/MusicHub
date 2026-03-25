import { useMemo } from "react";
import type { ChainNode, ChainParamsResponse, PluginPresetsResponse } from "@/services/pluginHostClient";
import type { PluginParamChangedEvent } from "@/services/pluginHostSocket";
import type { DeviceInstance, SessionTrack } from "@/types/studio";

interface UseStudioDetailPanelModelOptions {
  track: SessionTrack | null;
  onDeviceChainChange: (trackId: string, devices: DeviceInstance[]) => void;
  onClose: () => void;
  isConnected: boolean;
  nativeChainId?: string;
  nativeChainNodes?: ChainNode[];
  nativeNodeCount: number;
  hasHostBackedDevices: boolean;
  canLoadNativeChain: boolean;
  openEditors: Record<string, boolean>;
  onLoadNativeChain?: (trackId: string) => Promise<string | null>;
  onFetchChainParams?: (chainId: string) => Promise<ChainParamsResponse | null>;
  onFetchPluginPresets?: (chainId: string, nodeIndex: number) => Promise<PluginPresetsResponse | null>;
  onLoadPluginPreset?: (chainId: string, nodeIndex: number, index: number) => Promise<{ loaded: boolean; name: string } | null>;
  onSavePluginState?: (chainId: string, nodeIndex: number) => Promise<{ stateId: string } | null>;
  onRestorePluginState?: (chainId: string, nodeIndex: number, stateId: string) => Promise<boolean>;
  onSetParam?: (chainId: string, nodeIndex: number, paramId: number, value: number) => void;
  onParamChanged?: (fn: (e: PluginParamChangedEvent) => void) => () => void;
  onOpenEditor?: (chainId: string, nodeIndex: number) => Promise<unknown> | unknown;
  onCloseEditor?: (chainId: string, nodeIndex: number) => Promise<unknown> | unknown;
  onToggleNativeNodeBypass?: (chainId: string, nodeIndex: number, bypass: boolean) => void;
  onRemoveNativeNode?: (chainId: string, nodeIndex: number) => void;
}

export function useStudioDetailPanelModel(options: UseStudioDetailPanelModelOptions) {
  return useMemo(
    () => ({
      track: options.track,
      onDeviceChainChange: options.onDeviceChainChange,
      onClose: options.onClose,
      isConnected: options.isConnected,
      nativeChainId: options.nativeChainId,
      nativeChainNodes: options.nativeChainNodes,
      nativeNodeCount: options.nativeNodeCount,
      hasHostBackedDevices: options.hasHostBackedDevices,
      canLoadNativeChain: options.canLoadNativeChain,
      openEditors: options.openEditors,
      onLoadNativeChain: options.onLoadNativeChain,
      onFetchChainParams: options.onFetchChainParams,
      onFetchPluginPresets: options.onFetchPluginPresets,
      onLoadPluginPreset: options.onLoadPluginPreset,
      onSavePluginState: options.onSavePluginState,
      onRestorePluginState: options.onRestorePluginState,
      onSetParam: options.onSetParam,
      onParamChanged: options.onParamChanged,
      onOpenEditor: options.onOpenEditor,
      onCloseEditor: options.onCloseEditor,
      onToggleNativeNodeBypass: options.onToggleNativeNodeBypass,
      onRemoveNativeNode: options.onRemoveNativeNode,
    }),
    [options],
  );
}

export type StudioDetailPanelModelResult = ReturnType<typeof useStudioDetailPanelModel>;
