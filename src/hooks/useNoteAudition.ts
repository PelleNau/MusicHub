/**
 * @deprecated Use `playAuditionNote` / `stopAuditionNote` from useAudioEngine instead.
 * This file is kept for backward compatibility but delegates to the engine.
 *
 * Piano roll and step sequencer should migrate to the engine's audition API.
 */
import { useRef, useCallback } from "react";

export function useNoteAudition() {
  const ctxRef = useRef<AudioContext | null>(null);
  const activeRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playNote = useCallback(
    (pitch: number, velocity: number = 100) => {
      if (activeRef.current) {
        try {
          const prevCtx = getCtx();
          const now = prevCtx.currentTime;
          activeRef.current.gain.gain.cancelScheduledValues(now);
          activeRef.current.gain.gain.setValueAtTime(activeRef.current.gain.gain.value, now);
          activeRef.current.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
          activeRef.current.osc.stop(now + 0.03);
        } catch { /* already stopped */ }
        activeRef.current = null;
      }

      const ctx = getCtx();
      if (ctx.state === "suspended") ctx.resume();

      const freq = 440 * Math.pow(2, (pitch - 69) / 12);
      const vol = (velocity / 127) * 0.15;

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(vol * 0.6, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      activeRef.current = { osc, gain };

      const releaseTime = ctx.currentTime + 0.3;
      gain.gain.setValueAtTime(vol * 0.6, releaseTime);
      gain.gain.exponentialRampToValueAtTime(0.001, releaseTime + 0.15);
      osc.stop(releaseTime + 0.16);

      setTimeout(() => {
        if (activeRef.current?.osc === osc) {
          activeRef.current = null;
        }
      }, 500);
    },
    [getCtx]
  );

  const stopNote = useCallback(() => {
    if (!activeRef.current) return;
    try {
      const { osc, gain } = activeRef.current;
      const now = gain.context.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.stop(now + 0.03);
    } catch { /* ok */ }
    activeRef.current = null;
  }, []);

  return { playNote, stopNote };
}
