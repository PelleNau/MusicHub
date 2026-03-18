import type { OutboundMessage } from "@/services/pluginHostSocket";

export function createConnectorCommands(send: (message: OutboundMessage) => void) {
  return {
    play(fromBeat = 0) {
      send({ type: "transport.play", fromBeat });
    },
    pause() {
      send({ type: "transport.pause" });
    },
    stop() {
      send({ type: "transport.stop" });
    },
    seek(beat: number) {
      send({ type: "transport.seek", beat });
    },
    setTempo(bpm: number) {
      send({ type: "transport.tempo", bpm });
    },
    setLoop(enabled: boolean, start: number, end: number) {
      send({ type: "transport.loop", enabled, start, end });
    },
    setParam(chainId: string, nodeIndex: number, paramId: number, value: number) {
      send({ type: "plugin.setParam", chainId, nodeIndex, paramId, value });
    },
    bypass(chainId: string, nodeIndex: number, bypassState: boolean) {
      send({ type: "plugin.bypass", chainId, nodeIndex, bypass: bypassState });
    },
    reorderChain(chainId: string, fromIndex: number, toIndex: number) {
      send({ type: "chain.reorder", chainId, fromIndex, toIndex });
    },
    removeFromChain(chainId: string, nodeIndex: number) {
      send({ type: "chain.remove", chainId, nodeIndex });
    },
    addToChain(chainId: string, pluginId: string, atIndex: number) {
      send({ type: "chain.add", chainId, pluginId, atIndex });
    },
    openEditor(chainId: string, nodeIndex: number) {
      send({ type: "editor.open", chainId, nodeIndex });
    },
    closeEditor(chainId: string, nodeIndex: number) {
      send({ type: "editor.close", chainId, nodeIndex });
    },
    startAnalysis(source: "master" | "track", trackId?: string, fftSize?: 1024 | 2048 | 4096 | 8192) {
      send({ type: "analysis.start", source, trackId, fftSize });
    },
    stopAnalysis() {
      send({ type: "analysis.stop" });
    },
    startMidiLearn(chainId: string, nodeIndex: number, paramId: number) {
      send({ type: "midi.learn.start", chainId, nodeIndex, paramId });
    },
    cancelMidiLearn() {
      send({ type: "midi.learn.cancel" });
    },
    sendNote(trackId: string, note: number, velocity: number, channel = 1) {
      send({ type: "midi.sendNote", trackId, note, velocity, channel });
    },
    sendCC(trackId: string, cc: number, value: number, channel = 1) {
      send({ type: "midi.sendCC", trackId, cc, value, channel });
    },
  };
}
