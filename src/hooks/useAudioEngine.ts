import { useRef, useSyncExternalStore, useCallback, useEffect } from "react";
import { AudioEngine, type PlaybackState, type TrackMeterData } from "@/audio/AudioEngine";
import type { SessionTrack } from "@/types/studio";

/**
 * Thin React bridge around the pure-JS AudioEngine.
 */
export type { PlaybackState, TrackMeterData };

const noop = () => {};
const noopAsync = async () => {};

export function useAudioEngine(tempo: number, beatsPerBar: number = 4, enabled: boolean = true) {
  const engineRef = useRef<AudioEngine | null>(null);

  if (enabled && !engineRef.current) {
    engineRef.current = new AudioEngine();
  }
  const engine = engineRef.current;

  // Push config into the engine (no re-render, just pokes)
  if (enabled && engine) {
    engine.setTempo(tempo);
    engine.setBeatsPerBar(beatsPerBar);
  }

  // Dispose on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (enabled) return;
    engineRef.current?.dispose();
    engineRef.current = null;
  }, [enabled]);

  // ── useSyncExternalStore bridge ──
  const subscribe = useCallback((cb: () => void) => {
    if (!enabled || !engine) return noop;
    return engine.subscribe(cb);
  }, [enabled, engine]);

  const playbackState = useSyncExternalStore(subscribe, () => (enabled && engine ? engine.playbackState : "stopped"));
  const currentBeat = useSyncExternalStore(subscribe, () => (enabled && engine ? engine.currentBeat : 0));
  const loopEnabled = useSyncExternalStore(subscribe, () => (enabled && engine ? engine.loopEnabled : false));
  const loopStart = useSyncExternalStore(subscribe, () => (enabled && engine ? engine.loopStart : 0));
  const loopEnd = useSyncExternalStore(subscribe, () => (enabled && engine ? engine.loopEnd : 0));
  const metronomeEnabled = useSyncExternalStore(subscribe, () => (enabled && engine ? engine.metronomeEnabled : false));

  // ── Stable callbacks ──
  const play = useCallback(async () => {
    if (!enabled || !engine) return;
    try {
      await engine.play();
    } catch (err) {
      console.error("[useAudioEngine] play failed:", err);
    }
  }, [enabled, engine]);

  const pause = useCallback(() => { if (enabled && engine) engine.pause(); }, [enabled, engine]);
  const stop = useCallback(() => { if (enabled && engine) engine.stop(); }, [enabled, engine]);
  const seekToBeat = useCallback((beat: number) => { if (enabled && engine) engine.seekToBeat(beat); }, [enabled, engine]);
  const buildGraph = useCallback((tracks: SessionTrack[]) => { if (enabled && engine) engine.buildGraph(tracks); }, [enabled, engine]);

  // Loop controls
  const setLoopRegion = useCallback((start: number, end: number) => { if (enabled && engine) engine.setLoopRegion(start, end); }, [enabled, engine]);
  const toggleLoop = useCallback(() => { if (enabled && engine) engine.toggleLoop(); }, [enabled, engine]);
  const setLoop = useCallback((loopEnabled: boolean, start?: number, end?: number) => { if (enabled && engine) engine.setLoop(loopEnabled, start, end); }, [enabled, engine]);

  // Metronome
  const toggleMetronome = useCallback(() => { if (enabled && engine) engine.toggleMetronome(); }, [enabled, engine]);

  // Note audition
  const playAuditionNote = useCallback((pitch: number, velocity?: number) => { if (enabled && engine) engine.playAuditionNote(pitch, velocity); }, [enabled, engine]);
  const stopAuditionNote = useCallback(() => { if (enabled && engine) engine.stopAuditionNote(); }, [enabled, engine]);

  // Metering — read directly from engine (updated by worklet at ~60fps)
  const getTrackMeter = useCallback((trackId: string) => (enabled && engine ? engine.getTrackMeter(trackId) : undefined), [enabled, engine]);

  return {
    playbackState,
    currentBeat,
    play,
    pause,
    stop,
    seekToBeat,
    buildGraph,
    loopEnabled,
    loopStart,
    loopEnd,
    setLoopRegion,
    toggleLoop,
    setLoop,
    metronomeEnabled,
    toggleMetronome,
    playAuditionNote,
    stopAuditionNote,
    getTrackMeter,
    engine: enabled ? engine : null,
    masterGain: enabled && engine ? engine.master : null,
    audioContext: enabled && engine ? engine.audioContext : null,
  };
}
