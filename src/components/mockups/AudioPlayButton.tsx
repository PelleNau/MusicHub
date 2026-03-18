import { useState, useCallback, useRef } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayButtonProps {
  frequency: number;
  duration?: number;
  waveform?: OscillatorType;
  gain?: number;
  label?: string;
  size?: "sm" | "md";
  className?: string;
  audioContext?: AudioContext;
  onPlay?: () => void;
}

/**
 * Reusable play-a-tone button with loading/playing/idle states.
 * Returns the AudioContext for external use.
 */
export function AudioPlayButton({
  frequency,
  duration = 0.8,
  waveform = "sine",
  gain = 0.15,
  label,
  size = "md",
  className = "",
  audioContext,
  onPlay,
}: AudioPlayButtonProps) {
  const [state, setState] = useState<"idle" | "playing">("idle");
  const oscRef = useRef<OscillatorNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(audioContext ?? null);

  const play = useCallback(() => {
    if (state === "playing") return;
    onPlay?.();
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = waveform;
      osc.frequency.value = frequency;
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      oscRef.current = osc;
      setState("playing");
      osc.onended = () => {
        setState("idle");
        oscRef.current = null;
      };
    } catch {
      setState("idle");
    }
  }, [frequency, duration, waveform, gain, state, onPlay]);

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const btnSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className={`${btnSize} rounded-full shrink-0 transition-all ${
          state === "playing"
            ? "text-primary bg-primary/20 shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={play}
      >
        {state === "playing" ? (
          <Volume2 className={`${iconSize} animate-pulse`} />
        ) : (
          <Volume2 className={iconSize} />
        )}
      </Button>
      {label && <span className="text-xs font-mono text-muted-foreground">{label}</span>}
    </div>
  );
}
