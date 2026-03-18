/**
 * usePluginHostSocket — React hook wrapping the WebSocket client for
 * real-time transport state, meter data, and plugin parameter sync
 * with the native plugin-host.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  pluginHostSocket,
  PluginHostSocket,
  type MeterLevel,
  type TransportStateEvent,
  type PluginParamChangedEvent,
  type ChainStateEvent,
  type HostErrorEvent,
  type OutboundMessage,
} from "@/services/pluginHostSocket";

export type EngineMode = "standalone" | "connected";

export interface NativeTransportState {
  state: "playing" | "paused" | "stopped";
  beat: number;
  bpm: number;
}

export interface PluginHostSocketState {
  mode: EngineMode;
  connected: boolean;
  transport: NativeTransportState | null;
  masterMeter: MeterLevel | null;
  trackMeters: Record<string, MeterLevel>;
  lastError: HostErrorEvent | null;
}

export interface PluginHostSocketActions {
  connect: () => void;
  disconnect: () => void;
  send: (msg: OutboundMessage) => void;
  play: (fromBeat?: number) => void;
  pause: () => void;
  stop: () => void;
  seek: (beat: number) => void;
  setTempo: (bpm: number) => void;
  setLoop: (enabled: boolean, start: number, end: number) => void;
  setParam: (chainId: string, nodeIndex: number, paramId: number, value: number) => void;
  bypass: (chainId: string, nodeIndex: number, bypass: boolean) => void;
  onParamChanged: (fn: (e: PluginParamChangedEvent) => void) => () => void;
  onChainState: (fn: (e: ChainStateEvent) => void) => () => void;
}

export function usePluginHostSocket(): [PluginHostSocketState, PluginHostSocketActions] {
  const socketRef = useRef<PluginHostSocket>(pluginHostSocket);
  const socket = socketRef.current;

  const [connected, setConnected] = useState(socket.connected);
  const [transport, setTransport] = useState<NativeTransportState | null>(null);
  const [masterMeter, setMasterMeter] = useState<MeterLevel | null>(null);
  const [trackMeters, setTrackMeters] = useState<Record<string, MeterLevel>>({});
  const [lastError, setLastError] = useState<HostErrorEvent | null>(null);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(socket.on("connectionChange", (c) => setConnected(c)));

    unsubs.push(socket.on("transport.state", (e: TransportStateEvent) => {
      setTransport({ state: e.state, beat: e.beat, bpm: e.bpm });
    }));

    unsubs.push(socket.on("meter.update", (e) => {
      setMasterMeter(e.master);
      setTrackMeters(e.tracks);
    }));

    unsubs.push(socket.on("error", (e: HostErrorEvent) => {
      setLastError(e);
    }));

    // Auto-connect on mount
    socket.connect();

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [socket]);

  const mode: EngineMode = connected ? "connected" : "standalone";

  const actions: PluginHostSocketActions = {
    connect: useCallback(() => socket.connect(), [socket]),
    disconnect: useCallback(() => socket.disconnect(), [socket]),
    send: useCallback((msg) => socket.send(msg), [socket]),
    play: useCallback((fromBeat = 0) => socket.play(fromBeat), [socket]),
    pause: useCallback(() => socket.pause(), [socket]),
    stop: useCallback(() => socket.stop(), [socket]),
    seek: useCallback((beat) => socket.seek(beat), [socket]),
    setTempo: useCallback((bpm) => socket.setTempo(bpm), [socket]),
    setLoop: useCallback((enabled, start, end) => socket.setLoop(enabled, start, end), [socket]),
    setParam: useCallback((chainId, nodeIndex, paramId, value) =>
      socket.setParam(chainId, nodeIndex, paramId, value), [socket]),
    bypass: useCallback((chainId, nodeIndex, bypass) =>
      socket.bypass(chainId, nodeIndex, bypass), [socket]),
    onParamChanged: useCallback((fn) => socket.on("plugin.paramChanged", fn), [socket]),
    onChainState: useCallback((fn) => socket.on("chain.state", fn), [socket]),
  };

  const state: PluginHostSocketState = {
    mode,
    connected,
    transport,
    masterMeter,
    trackMeters,
    lastError,
  };

  return [state, actions];
}
