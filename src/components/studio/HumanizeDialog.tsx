import { useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

export interface HumanizeOptions {
  timing: number;
  velocity: number;
  duration: number;
  strength: number;
}

interface HumanizeDialogProps {
  open: boolean;
  noteCount: number;
  onApply: (options: HumanizeOptions) => void;
  onClose: () => void;
}

const HUMANIZE_PRESETS: Record<string, HumanizeOptions> = {
  subtle: { timing: 12, velocity: 5, duration: 4, strength: 35 },
  moderate: { timing: 25, velocity: 10, duration: 8, strength: 70 },
  strong: { timing: 40, velocity: 16, duration: 12, strength: 85 },
  extreme: { timing: 65, velocity: 24, duration: 18, strength: 100 },
};

function getHumanizePreview({ timing, velocity, duration, strength }: HumanizeOptions) {
  return {
    timing: `±${timing} ticks (${Math.round((timing / 480) * 1000)}ms at 120 BPM)`,
    velocity: `±${velocity} units`,
    duration: `±${duration}%`,
    strength: `${strength}%`,
  };
}

export function HumanizeDialog({
  open,
  noteCount,
  onApply,
  onClose,
}: HumanizeDialogProps) {
  const [timing, setTiming] = useState(25);
  const [velocity, setVelocity] = useState(10);
  const [duration, setDuration] = useState(8);
  const [strength, setStrength] = useState(70);

  const preview = useMemo(
    () => getHumanizePreview({ timing, velocity, duration, strength }),
    [timing, velocity, duration, strength],
  );

  const applyPreset = (presetName: keyof typeof HUMANIZE_PRESETS) => {
    const preset = HUMANIZE_PRESETS[presetName];
    setTiming(preset.timing);
    setVelocity(preset.velocity);
    setDuration(preset.duration);
    setStrength(preset.strength);
  };

  const handleApply = () => {
    onApply({ timing, velocity, duration, strength });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent className="max-w-[450px] border-border/90 bg-[hsl(240_10%_16%)] p-0 text-foreground shadow-2xl">
        <DialogHeader className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <DialogTitle className="text-sm font-semibold">Humanize Notes</DialogTitle>
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
            <div className="grid grid-cols-4 gap-2">
              {(["subtle", "moderate", "strong", "extreme"] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded bg-[var(--surface-3)] px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
                >
                  {preset[0].toUpperCase() + preset.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Timing Variation</label>
              <span className="text-xs font-mono text-foreground">±{timing} ticks</span>
            </div>
            <Slider value={[timing]} onValueChange={([v]) => setTiming(v)} min={0} max={100} step={1} />
            <p className="mt-1 text-xs text-muted-foreground">
              {timing > 0 ? `~${Math.round((timing / 480) * 1000)}ms at 120 BPM` : "No timing variation"}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Velocity Variation</label>
              <span className="text-xs font-mono text-foreground">±{velocity} units</span>
            </div>
            <Slider value={[velocity]} onValueChange={([v]) => setVelocity(v)} min={0} max={30} step={1} />
            <p className="mt-1 text-xs text-muted-foreground">
              {velocity > 0 ? `Range: ${Math.max(1, 80 - velocity)} - ${Math.min(127, 80 + velocity)}` : "No velocity variation"}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Duration Variation</label>
              <span className="text-xs font-mono text-foreground">±{duration}%</span>
            </div>
            <Slider value={[duration]} onValueChange={([v]) => setDuration(v)} min={0} max={20} step={1} />
            <p className="mt-1 text-xs text-muted-foreground">
              {duration > 0 ? `Notes will be ${100 - duration}% - ${100 + duration}% of original length` : "No duration variation"}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Overall Strength</label>
              <span className="text-xs font-mono text-foreground">{strength}%</span>
            </div>
            <Slider value={[strength]} onValueChange={([v]) => setStrength(v)} min={0} max={100} step={1} />
            <p className="mt-1 text-xs text-muted-foreground">Controls intensity of all humanization</p>
          </div>

          <div className="space-y-2 rounded border border-blue-500/20 bg-blue-500/10 px-3 py-3">
            <p className="text-xs font-semibold text-blue-400">Preview</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-300">
              <div>Timing: <span className="font-mono">{preview.timing}</span></div>
              <div>Velocity: <span className="font-mono">{preview.velocity}</span></div>
              <div>Duration: <span className="font-mono">{preview.duration}</span></div>
              <div>Strength: <span className="font-mono">{preview.strength}</span></div>
            </div>
          </div>

          <div className="rounded border border-amber-500/20 bg-amber-500/10 px-3 py-2">
            <p className="text-xs text-amber-400">
              Humanizing {noteCount} note{noteCount !== 1 ? "s" : ""}. Each apply will create different random variations.
            </p>
          </div>
        </div>

        <DialogFooter className="rounded-b-lg border-t border-border bg-[var(--surface-1)] px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply} className="gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Apply Humanize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
