import { memo, useMemo } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import type { GridMode, GridDivision } from "@/hooks/useTimelineGrid";
import { getDivisionBeats } from "@/hooks/useTimelineGrid";
import {
  TRACK_HEADER_WIDTH,
  GRID_EPSILON,
  beatToContentX,
  generateGridBeats,
  getBarOffsetBeats,
  isBarDownbeat,
} from "./timelineMath";

interface GridOverlayProps {
  totalBeats: number;
  pixelsPerBeat: number;
  beatsPerBar: number;
  activeDivision: GridDivision;
  tripletMode: boolean;
  height: string;
}

/** Transparent grid lines rendered behind clips in the track area */
export const GridOverlay = memo(function GridOverlay({
  totalBeats,
  pixelsPerBeat,
  beatsPerBar,
  activeDivision,
  tripletMode,
  height,
}: GridOverlayProps) {
  const totalWidth = beatToContentX(totalBeats, pixelsPerBeat);

  const { barMarks, subMarks } = useMemo(() => {
    const barOffsetBeats = getBarOffsetBeats(beatsPerBar);

    // Bar marks — index-based, no cumulative addition
    const barBeats = generateGridBeats(totalBeats, beatsPerBar, barOffsetBeats);
    const bars = barBeats.map((beat) => beatToContentX(beat, pixelsPerBeat));

    let divBeats = getDivisionBeats(activeDivision, beatsPerBar);
    if (tripletMode) divBeats = divBeats * (2 / 3);

    const subs: { x: number; isBeat: boolean }[] = [];
    if (divBeats < beatsPerBar) {
      // Index-based subdivision generation
      const subPositions = generateGridBeats(totalBeats, divBeats, 0);
      for (const beat of subPositions) {
        if (isBarDownbeat(beat, beatsPerBar, barOffsetBeats)) continue;
        subs.push({
          x: beatToContentX(beat, pixelsPerBeat),
          isBeat: Math.abs(beat % 1) < GRID_EPSILON,
        });
      }
    }

    return { barMarks: bars, subMarks: subs };
  }, [totalBeats, beatsPerBar, pixelsPerBeat, activeDivision, tripletMode]);

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{ left: TRACK_HEADER_WIDTH, width: totalWidth, height }}
    >
      {barMarks.map((x, i) => (
        <div
          key={`bar-${i}`}
          className="absolute top-0 bottom-0"
          style={{ left: x, borderLeft: "1px solid hsl(var(--foreground) / 0.28)" }}
        />
      ))}
      {subMarks.map(({ x, isBeat }, i) => (
        <div
          key={`sub-${i}`}
          className="absolute bottom-0"
          style={{
            left: x,
            height: isBeat ? "60%" : "35%",
            borderLeft: `1px solid ${isBeat ? "hsl(var(--foreground) / 0.18)" : "hsl(var(--foreground) / 0.1)"}`,
          }}
        />
      ))}
    </div>
  );
});

/* ── Grid Context Menu ── */
interface GridContextMenuProps {
  children: React.ReactNode;
  gridMode: GridMode;
  fixedDivision: GridDivision;
  activeDivision: GridDivision;
  snapEnabled: boolean;
  tripletMode: boolean;
  onSetGridMode: (mode: GridMode) => void;
  onSetFixedDivision: (div: GridDivision) => void;
  onToggleSnap: () => void;
  onToggleTriplet: () => void;
  onNarrow: () => void;
  onWiden: () => void;
}

const DIVISIONS: { label: string; value: GridDivision }[] = [
  { label: "Bar", value: "1" },
  { label: "1/2", value: "1/2" },
  { label: "1/4 (Beat)", value: "1/4" },
  { label: "1/8", value: "1/8" },
  { label: "1/16", value: "1/16" },
  { label: "1/32", value: "1/32" },
];

export function GridContextMenu({
  children,
  gridMode,
  fixedDivision,
  activeDivision,
  snapEnabled,
  tripletMode,
  onSetGridMode,
  onSetFixedDivision,
  onToggleSnap,
  onToggleTriplet,
  onNarrow,
  onWiden,
}: GridContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52 font-mono text-xs">
        <ContextMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Grid — {activeDivision}{tripletMode ? "T" : ""}
        </ContextMenuLabel>
        <ContextMenuSeparator />

        <ContextMenuCheckboxItem checked={snapEnabled} onCheckedChange={onToggleSnap}>
          Snap to Grid
          <span className="ml-auto text-[9px] text-muted-foreground">⌘4</span>
        </ContextMenuCheckboxItem>

        <ContextMenuSeparator />

        <ContextMenuCheckboxItem
          checked={gridMode === "adaptive"}
          onCheckedChange={() => onSetGridMode(gridMode === "adaptive" ? "fixed" : "adaptive")}
        >
          Adaptive Grid
          <span className="ml-auto text-[9px] text-muted-foreground">⌘5</span>
        </ContextMenuCheckboxItem>

        <ContextMenuSeparator />

        {DIVISIONS.map((d) => (
          <ContextMenuCheckboxItem
            key={d.value}
            checked={gridMode === "fixed" && fixedDivision === d.value}
            onCheckedChange={() => {
              onSetGridMode("fixed");
              onSetFixedDivision(d.value);
            }}
          >
            {d.label}
          </ContextMenuCheckboxItem>
        ))}

        <ContextMenuSeparator />

        <ContextMenuCheckboxItem checked={tripletMode} onCheckedChange={onToggleTriplet}>
          Triplet Grid
          <span className="ml-auto text-[9px] text-muted-foreground">⌘3</span>
        </ContextMenuCheckboxItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onNarrow}>
          Narrower
          <span className="ml-auto text-[9px] text-muted-foreground">⌘1</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onWiden}>
          Wider
          <span className="ml-auto text-[9px] text-muted-foreground">⌘2</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
