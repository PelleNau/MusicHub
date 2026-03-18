import type { PluginHostSocket } from "@/services/pluginHostSocket";
import type {
  ConnectorInboundEventType,
  ConnectorListenerMap,
} from "@/services/hostConnectorEvents";

export function deriveConnectionState(
  httpOk: boolean,
  wsOk: boolean
): "disconnected" | "connecting" | "connected" | "degraded" {
  if (httpOk && wsOk) return "connected";
  if (httpOk || wsOk) return "degraded";
  return "disconnected";
}

export async function waitForSocketReady(
  wsClient: PluginHostSocket,
  timeoutMs = 2000
): Promise<boolean> {
  if (wsClient.connected) return true;

  return new Promise<boolean>((resolve) => {
    const timeoutId = window.setTimeout(() => {
      unsubscribe();
      resolve(wsClient.connected);
    }, timeoutMs);

    const unsubscribe = wsClient.on("connectionChange", (connected) => {
      if (!connected) return;
      window.clearTimeout(timeoutId);
      unsubscribe();
      resolve(true);
    });
  });
}

export function bindSocketEvents(
  wsClient: PluginHostSocket,
  emit: <K extends ConnectorInboundEventType>(
    event: K,
    data: Parameters<ConnectorListenerMap[K]>[0],
  ) => void,
  onConnectionChange: (connected: boolean) => void
): Array<() => void> {
  return [
    wsClient.on("connectionChange", onConnectionChange),
    wsClient.on("transport.state", (e) => emit("transport.state", e)),
    wsClient.on("meter.update", (e) => emit("meter.update", e)),
    wsClient.on("plugin.paramChanged", (e) => emit("plugin.paramChanged", e)),
    wsClient.on("chain.state", (e) => emit("chain.state", e)),
    wsClient.on("error", (e) => emit("error", e)),
    wsClient.on("plugin.editorClosed", (e) => emit("plugin.editorClosed", e)),
    wsClient.on("render.progress", (e) => emit("render.progress", e)),
    wsClient.on("render.complete", (e) => emit("render.complete", e)),
    wsClient.on("render.error", (e) => emit("render.error", e)),
    wsClient.on("midi.input", (e) => emit("midi.input", e)),
    wsClient.on("midi.deviceChange", (e) => emit("midi.deviceChange", e)),
    wsClient.on("midi.learn.captured", (e) => emit("midi.learn.captured", e)),
    wsClient.on("midi.learn.assigned", (e) => emit("midi.learn.assigned", e)),
    wsClient.on("record.level", (e) => emit("record.level", e)),
    wsClient.on("session.state", (e) => emit("session.state", e)),
    wsClient.on("audio.engine.state", (e) => emit("audio.engine.state", e)),
    wsClient.on("audio.record.state", (e) => emit("audio.record.state", e)),
    wsClient.on("playback.state", (e) => emit("playback.state", e)),
    wsClient.on("session.trackMidi", (e) => emit("session.trackMidi", e)),
    wsClient.on("analysis.spectrum", (e) => emit("analysis.spectrum", e)),
    wsClient.on("analysis.lufs", (e) => emit("analysis.lufs", e)),
    wsClient.on("system.fileDrop", (e) => emit("system.fileDrop", e)),
  ];
}
