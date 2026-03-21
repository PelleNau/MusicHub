import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

export interface QuantizeOptions {
  division: number;
  strength: number;
  quantizeStart: boolean;
  quantizeEnd: boolean;
}

interface QuantizeDialogProps {
  open: boolean;
  initialOptions?: Partial<QuantizeOptions>;
  onApply: (options: QuantizeOptions) => void;
  onClose: () => void;
}

const QUANTIZE_DIVISIONS = [
  { value: 1, label: "1/1 note" },
  { value: 2, label: "1/2 note" },
  { value: 4, label: "1/4 note" },
  { value: 8, label: "1/8 note" },
  { value: 16, label: "1/16 note" },
  { value: 32, label: "1/32 note" },
];

export function QuantizeDialog({
  open,
  initialOptions,
  onApply,
  onClose,
}: QuantizeDialogProps) {
  const [division, setDivision] = useState(4);
  const [strength, setStrength] = useState(100);
  const [quantizeStart, setQuantizeStart] = useState(true);
  const [quantizeEnd, setQuantizeEnd] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDivision(initialOptions?.division ?? 4);
    setStrength(initialOptions?.strength ?? 100);
    setQuantizeStart(initialOptions?.quantizeStart ?? true);
    setQuantizeEnd(initialOptions?.quantizeEnd ?? false);
  }, [initialOptions, open]);

  const handleApply = () => {
    onApply({
      division,
      strength,
      quantizeStart,
      quantizeEnd,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent className="max-w-[400px] border-border/90 bg-[hsl(240_10%_16%)] p-0 text-foreground shadow-2xl">
        <DialogHeader className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <DialogTitle className="text-sm font-semibold">Quantize Notes</DialogTitle>
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
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Grid Division</label>
            <select
              value={division}
              onChange={(event) => setDivision(Number(event.target.value))}
              className="w-full rounded border border-border bg-[var(--surface-1)] px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            >
              {QUANTIZE_DIVISIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Strength</label>
              <span className="text-xs font-mono text-foreground">{strength}%</span>
            </div>
            <Slider value={[strength]} onValueChange={([value]) => setStrength(value)} min={0} max={100} step={5} />
            <p className="mt-1 text-xs text-muted-foreground">
              {strength === 100 ? "Snap exactly to grid" : strength === 0 ? "No quantization" : "Partial quantization"}
            </p>
          </div>

          <div className="space-y-3 rounded border border-border/60 bg-[var(--surface-1)] px-3 py-3">
            <div className="text-xs font-medium text-muted-foreground">Quantize</div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={quantizeStart}
                onChange={(event) => setQuantizeStart(event.target.checked)}
                className="h-4 w-4 rounded border border-border bg-[var(--surface-2)]"
              />
              Note Start Times
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={quantizeEnd}
                onChange={(event) => setQuantizeEnd(event.target.checked)}
                className="h-4 w-4 rounded border border-border bg-[var(--surface-2)]"
              />
              Note End Times
            </label>
          </div>
        </div>

        <DialogFooter className="rounded-b-lg border-t border-border bg-[var(--surface-1)] px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply Quantize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
