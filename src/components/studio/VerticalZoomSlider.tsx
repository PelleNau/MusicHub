import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerticalZoomSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function VerticalZoomSlider({
  value,
  onChange,
  min = 32,
  max = 200,
  className,
}: VerticalZoomSliderProps) {
  const clampedValue = Math.max(0, Math.min(1, value));
  const currentHeight = Math.round(min + (max - min) * clampedValue);

  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextValue = 1 - (event.clientY - rect.top) / rect.height;
    onChange(Math.max(0, Math.min(1, nextValue)));
  };

  return (
    <div
      className={cn(
        "sticky left-0 z-10 flex w-[52px] shrink-0 flex-col items-center border-r border-border/60 bg-card/95 backdrop-blur-sm",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.min(1, clampedValue + 0.08))}
        className="flex h-8 w-full items-center justify-center border-b border-border/50 text-foreground/55 transition-colors hover:bg-muted/30 hover:text-foreground/80"
        title="Increase track height"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      <div
        className="relative flex-1 w-full cursor-ns-resize"
        onClick={handleTrackClick}
      >
        <div className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-border/70" />
        <div
          className="absolute bottom-3 left-1/2 w-px -translate-x-1/2 bg-primary/70"
          style={{ height: `calc(${clampedValue * 100}% - 12px)` }}
        />
        <div
          className="absolute left-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-primary/40 bg-background shadow-sm"
          style={{ top: `${(1 - clampedValue) * 100}%` }}
          title={`${currentHeight}px track height`}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-primary/70" />
        </div>
      </div>

      <div className="flex h-7 w-full items-center justify-center border-y border-border/50 bg-muted/20 font-mono text-[10px] text-foreground/55">
        {currentHeight}
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.max(0, clampedValue - 0.08))}
        className="flex h-8 w-full items-center justify-center text-foreground/55 transition-colors hover:bg-muted/30 hover:text-foreground/80"
        title="Decrease track height"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
