import { useMemo } from "react";
import type { ChainNode, ChainParamsResponse, PluginPresetsResponse } from "@/services/pluginHostClient";
import type { PluginParamChangedEvent } from "@/services/pluginHostSocket";

interface UseStudioNativeDetailActionsModelOptions {
  nativeChainId?: string;
  nativeChainNodes?: ChainNode[];
  openEditors: Record<string, boolean>;
  onLoadNativeChain?: (trackId: string) => Promise<string | null>;
  onFetchChainParams?: (chainId: string) => Promise<ChainParamsResponse | null>;
  onFetchPluginPresets?: (chainId: string, nodeIndex: number) => Promise<PluginPresetsResponse | null>;
  onLoadPluginPreset?: (chainId: string, nodeIndex: number, index: number) => Promise<{ loaded: boolean; name: string } | null>;
  onSavePluginState?: (chainId: string, nodeIndex: number) => Promise<{ stateId: string } | null>;
  onRestorePluginState?: (chainId: string, nodeIndex: number, stateId: string) => Promise<boolean>;
  onSetParam?: (chainId: string, nodeIndex: number, paramId: number, value: number) => void;
  onParamChanged?: (fn: (e: PluginParamChangedEvent) => void) => () => void;
  onOpenEditor?: (chainId: string, nodeIndex: number) => void;
  onCloseEditor?: (chainId: string, nodeIndex: number) => void;
  onToggleNativeNodeBypass?: (chainId: string, nodeIndex: number, bypass: boolean) => void;
  onRemoveNativeNode?: (chainId: string, nodeIndex: number) => void;
}

export function useStudioNativeDetailActionsModel({
  nativeChainId,
  nativeChainNodes,
  openEditors,
  onLoadNativeChain,
  onFetchChainParams,
  onFetchPluginPresets,
  onLoadPluginPreset,
  onSavePluginState,
  onRestorePluginState,
  onSetParam,
  onParamChanged,
  onOpenEditor,
  onCloseEditor,
  onToggleNativeNodeBypass,
  onRemoveNativeNode,
}: UseStudioNativeDetailActionsModelOptions) {
  return useMemo(
    () => ({
      nativeChainId,
      nativeChainNodes,
      openEditors,
      onLoadNativeChain,
      onFetchChainParams,
      onFetchPluginPresets,
      onLoadPluginPreset,
      onSavePluginState,
      onRestorePluginState,
      onSetParam,
      onParamChanged,
      onOpenEditor,
      onCloseEditor,
      onToggleNativeNodeBypass,
      onRemoveNativeNode,
    }),
    [
      nativeChainId,
      nativeChainNodes,
      openEditors,
      onLoadNativeChain,
      onFetchChainParams,
      onFetchPluginPresets,
      onLoadPluginPreset,
      onSavePluginState,
      onRestorePluginState,
      onSetParam,
      onParamChanged,
      onOpenEditor,
      onCloseEditor,
      onToggleNativeNodeBypass,
      onRemoveNativeNode,
    ],
  );
}
