import { memo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

interface PianoKeyboardProps {
  octaves?: number;
  startOctave?: number;
  highlightedNotes?: number[];
  activeNotes?: number[];
  rootNote?: number;
  onNoteClick?: (pitchClass: number) => void;
  onNoteRelease?: (pitchClass: number) => void;
  compact?: boolean;
}

const BLACK_KEY_INDICES = new Set([1, 3, 6, 8, 10]);
const WHITE_KEY_OFFSETS: Record<number, number> = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
const BLACK_KEY_LEFT: Record<number, number> = { 1: 0.6, 3: 1.75, 6: 3.6, 8: 4.7, 10: 5.8 };

export const PianoKeyboard = memo(function PianoKeyboard({
  octaves = 2,
  startOctave = 3,
  highlightedNotes = [],
  activeNotes = [],
  rootNote,
  onNoteClick,
  compact = false,
}: PianoKeyboardProps) {
  const highlightSet = new Set(highlightedNotes);
  const activeSet = new Set(activeNotes);
  const isRoot = (pc: number) => rootNote !== undefined && pc === rootNote;
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const whiteKeyW = compact ? 30 : 38;
  const whiteKeyH = compact ? 100 : 130;
  const blackKeyW = compact ? 20 : 24;
  const blackKeyH = compact ? 62 : 82;
  const totalWhiteKeys = octaves * 7;
  const totalWidth = totalWhiteKeys * whiteKeyW;

  const handleClick = useCallback(
    (pc: number, key: string) => {
      setPressedKey(key);
      onNoteClick?.(pc);
      setTimeout(() => setPressedKey(null), 150);
    },
    [onNoteClick],
  );

  const keys: React.ReactNode[] = [];

  for (let oct = 0; oct < octaves; oct++) {
    for (let note = 0; note < 12; note++) {
      const pc = note;
      const isBlack = BLACK_KEY_INDICES.has(note);
      const isHighlighted = highlightSet.has(pc);
      const isActive = activeSet.has(pc);
      const keyId = `${oct}-${note}`;
      const isPressed = pressedKey === keyId;

      const isRootNote = isRoot(pc);

      if (isBlack) {
        const leftPos = (oct * 7 + BLACK_KEY_LEFT[note]) * whiteKeyW;
        keys.push(
          <button
            key={keyId}
            onClick={() => handleClick(pc, keyId)}
            className={cn(
              "absolute top-0 z-10 rounded-b-md border transition-all duration-100 group",
              isPressed && "translate-y-[2px]",
              isRootNote ? "border-accent ring-1 ring-accent" : "border-border/10",
            )}
            style={{
              left: leftPos,
              width: blackKeyW,
              height: blackKeyH,
              background: isRootNote
                ? "linear-gradient(180deg, hsl(var(--accent)) 0%, hsl(var(--accent) / 0.7) 100%)"
                : isActive
                  ? "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)"
                  : isHighlighted
                    ? "linear-gradient(180deg, hsl(var(--primary) / 0.5) 0%, hsl(var(--primary) / 0.3) 100%)"
                    : "linear-gradient(180deg, hsl(0 0% 18%) 0%, hsl(0 0% 8%) 85%, hsl(0 0% 4%) 100%)",
              boxShadow: isRootNote
                ? "0 0 14px 3px hsl(var(--accent) / 0.5), inset 0 -2px 4px hsl(0 0% 0% / 0.3)"
                : isActive
                  ? "0 0 12px 2px hsl(var(--primary) / 0.5), inset 0 -2px 4px hsl(0 0% 0% / 0.3)"
                  : isHighlighted
                    ? "0 0 8px 1px hsl(var(--primary) / 0.25), inset 0 -2px 4px hsl(0 0% 0% / 0.3)"
                    : "0 2px 4px hsl(0 0% 0% / 0.5), inset 0 -1px 2px hsl(0 0% 0% / 0.4), inset 0 1px 1px hsl(0 0% 30% / 0.2)",
            }}
            title={`${NOTE_NAMES[note]}${startOctave + oct}`}
          >
            <span className={cn(
              "absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[7px] font-mono font-bold select-none transition-opacity",
              isRootNote ? "opacity-100 text-accent-foreground" : isActive || isHighlighted ? "opacity-100 text-primary-foreground" : "opacity-0 group-hover:opacity-60 text-muted-foreground",
            )}>
              {NOTE_NAMES[note]}
            </span>
          </button>,
        );
      } else {
        const leftPos = (oct * 7 + WHITE_KEY_OFFSETS[note]) * whiteKeyW;
        keys.push(
          <button
            key={keyId}
            onClick={() => handleClick(pc, keyId)}
            className={cn(
              "absolute top-0 rounded-b-lg border transition-all duration-100 flex items-end justify-center pb-1.5 group",
              isPressed && "translate-y-[1px]",
              isRootNote
                ? "border-accent ring-2 ring-accent/60"
                : isActive
                  ? "border-primary/40"
                  : isHighlighted
                    ? "border-primary/20"
                    : "border-border/30",
            )}
            style={{
              left: leftPos,
              width: whiteKeyW - 1,
              height: whiteKeyH,
              background: isRootNote
                ? "linear-gradient(180deg, hsl(var(--accent) / 0.5) 0%, hsl(var(--accent) / 0.25) 100%)"
                : isActive
                  ? "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)"
                  : isHighlighted
                    ? "linear-gradient(180deg, hsl(var(--primary) / 0.3) 0%, hsl(var(--primary) / 0.15) 100%)"
                    : "linear-gradient(180deg, hsl(0 0% 95%) 0%, hsl(0 0% 85%) 100%)",
              boxShadow: isRootNote
                ? "0 0 14px 3px hsl(var(--accent) / 0.4), inset 0 -3px 6px hsl(var(--accent) / 0.2)"
                : isActive
                  ? "0 0 14px 3px hsl(var(--primary) / 0.4), inset 0 -3px 6px hsl(var(--primary) / 0.2)"
                  : isHighlighted
                    ? "0 0 8px 1px hsl(var(--primary) / 0.15), inset 0 -2px 4px hsl(0 0% 0% / 0.06)"
                    : "inset 0 -3px 6px hsl(0 0% 0% / 0.08), inset 0 1px 1px hsl(0 0% 100% / 0.6), 0 1px 2px hsl(0 0% 0% / 0.1)",
            }}
            title={`${NOTE_NAMES[note]}${startOctave + oct}`}
          >
            <span className={cn(
              "text-[8px] font-mono font-bold select-none transition-opacity",
              isRootNote
                ? "text-accent-foreground opacity-100"
                : isActive
                  ? "text-primary-foreground opacity-100"
                  : isHighlighted
                    ? "text-primary opacity-100"
                    : "text-muted-foreground opacity-0 group-hover:opacity-70",
              note === 0 && "opacity-100",
            )}>
              {note === 0 ? `C${startOctave + oct}` : NOTE_NAMES[note]}
            </span>
          </button>,
        );
      }
    }
  }

  return (
    <div
      className="relative select-none overflow-hidden rounded-lg border border-border/40 p-1"
      style={{
        width: totalWidth + 8,
        height: whiteKeyH + 8,
        background: "linear-gradient(180deg, hsl(var(--muted) / 0.5) 0%, hsl(var(--muted) / 0.8) 100%)",
        boxShadow: "inset 0 1px 3px hsl(0 0% 0% / 0.15), 0 1px 2px hsl(0 0% 0% / 0.1)",
      }}
    >
      <div className="relative" style={{ width: totalWidth, height: whiteKeyH, marginLeft: 0 }}>
        {keys}
      </div>
    </div>
  );
});
