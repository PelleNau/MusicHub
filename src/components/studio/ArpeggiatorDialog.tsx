import { useState } from "react";
import { Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

export type ArpeggiatorPattern =
  | "up"
  | "down"
  | "upDown"
  | "downUp"
  | "upDownInclusive"
  | "downUpInclusive"
  | "random"
  | "asPlayed";

export interface ArpeggiatorOptions {
  pattern: ArpeggiatorPattern;
  rate: number;
  octaves: number;
  velocity: number;
  gate: number;
}

interface ArpeggiatorDialogProps {
  open: boolean;
  onApply: (options: ArpeggiatorOptions) => void;
  onClose: () => void;
}

const PRESETS: Record<string, ArpeggiatorOptions> = {
  classic16th: { pattern: "up", rate: 0.25, octaves: 1, velocity: 80, gate: 80 },
  rolling8th: { pattern: "upDown", rate: 0.5, octaves: 2, velocity: 90, gate: 72 },
  cascading: { pattern: "down", rate: 0.25, octaves: 3, velocity: 76, gate: 68 },
  staccato: { pattern: "up", rate: 0.25, octaves: 1, velocity: 96, gate: 42 },
  ambient: { pattern: "random", rate: 1, octaves: 2, velocity: 64, gate: 96 },
  triplet: { pattern: "upDownInclusive", rate: 1 / 3, octaves: 1, velocity: 84, gate: 78 },
};

function getPatternName(pattern: ArpeggiatorPattern) {
  const labels: Record<ArpeggiatorPattern, string> = {
    up: "Up",
    down: "Down",
    upDown: "Up/Down",
    downUp: "Down/Up",
    upDownInclusive: "Up/Down (Incl.)",
    downUpInclusive: "Down/Up (Incl.)",
    random: "Random",
    asPlayed: "As Played",
  };
  return labels[pattern];
}

function getRateName(rate: number) {
  if (rate === 0.125) return "1/32";
  if (rate === 0.25) return "1/16";
  if (rate === 1 / 3) return "1/8T";
  if (rate === 0.5) return "1/8";
  if (rate === 1) return "1/4";
  if (rate === 2) return "1/2";
  return `${rate}`;
}

export function ArpeggiatorDialog({
  open,
  onApply,
  onClose,
}: ArpeggiatorDialogProps) {
  const [pattern, setPattern] = useState<ArpeggiatorPattern>("up");
  const [rate, setRate] = useState(0.25);
  const [octaves, setOctaves] = useState(1);
  const [velocity, setVelocity] = useState(80);
  const [gate, setGate] = useState(80);

  const handleApply = () => {
    onApply({ pattern, rate, octaves, velocity, gate });
    onClose();
  };

  const applyPreset = (name: keyof typeof PRESETS) => {
    const preset = PRESETS[name];
    setPattern(preset.pattern);
    setRate(preset.rate);
    setOctaves(preset.octaves);
    setVelocity(preset.velocity);
    setGate(preset.gate);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent className="max-w-[480px] border-border/90 bg-[hsl(240_10%_16%)] p-0 text-foreground shadow-2xl">
        <DialogHeader className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <DialogTitle className="text-sm font-semibold">Arpeggiator</DialogTitle>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Quick Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(PRESETS).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key as keyof typeof PRESETS)}
                  className="rounded bg-[var(--surface-3)] px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
                >
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (match) => match.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Pattern</label>
            <div className="grid grid-cols-2 gap-2">
              {(["up", "down", "upDown", "downUp", "upDownInclusive", "downUpInclusive", "random", "asPlayed"] as ArpeggiatorPattern[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPattern(value)}
                  className={`rounded px-3 py-2 text-xs font-medium transition-colors ${
                    pattern === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-[var(--surface-3)] text-foreground hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
                  }`}
                >
                  {getPatternName(value)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Rate</label>
              <span className="text-xs font-mono text-foreground">{getRateName(rate)}</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {[0.125, 0.25, 1 / 3, 0.5, 1, 2].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRate(value)}
                  className={`rounded px-2 py-1.5 text-xs font-mono transition-colors ${
                    rate === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-[var(--surface-3)] text-foreground hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
                  }`}
                >
                  {getRateName(value)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Octave Range</label>
              <span className="text-xs font-mono text-foreground">{octaves} octave{octaves !== 1 ? "s" : ""}</span>
            </div>
            <Slider value={[octaves]} onValueChange={([value]) => setOctaves(value)} min={1} max={4} step={1} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Velocity</label>
              <span className="text-xs font-mono text-foreground">{velocity}</span>
            </div>
            <Slider value={[velocity]} onValueChange={([value]) => setVelocity(value)} min={1} max={127} step={1} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Gate</label>
              <span className="text-xs font-mono text-foreground">{gate}%</span>
            </div>
            <Slider value={[gate]} onValueChange={([value]) => setGate(value)} min={10} max={100} step={1} />
            <p className="mt-1 text-xs text-muted-foreground">
              {gate < 50 ? "Staccato" : gate < 90 ? "Normal" : "Legato"}
            </p>
          </div>

          <div className="rounded border border-blue-500/20 bg-blue-500/10 px-3 py-3">
            <p className="mb-2 text-xs font-semibold text-blue-400">Preview</p>
            <div className="space-y-1 text-xs text-blue-300">
              <div>Pattern: <span className="ml-2 font-mono">{getPatternName(pattern)}</span></div>
              <div>Rate: <span className="ml-2 font-mono">{getRateName(rate)} notes</span></div>
              <div>Span: <span className="ml-2 font-mono">{octaves} octave{octaves !== 1 ? "s" : ""}</span></div>
            </div>
          </div>
        </div>

        <DialogFooter className="rounded-b-lg border-t border-border bg-[var(--surface-1)] px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply} className="gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Generate Arpeggio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
