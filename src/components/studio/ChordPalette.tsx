import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ChordType {
  name: string;
  intervals: number[]; // semitones from root
}

export const CHORD_TYPES: ChordType[] = [
  { name: "Maj", intervals: [0, 4, 7] },
  { name: "Min", intervals: [0, 3, 7] },
  { name: "Dim", intervals: [0, 3, 6] },
  { name: "Aug", intervals: [0, 4, 8] },
  { name: "7", intervals: [0, 4, 7, 10] },
  { name: "m7", intervals: [0, 3, 7, 10] },
  { name: "Maj7", intervals: [0, 4, 7, 11] },
  { name: "Sus2", intervals: [0, 2, 7] },
  { name: "Sus4", intervals: [0, 5, 7] },
  { name: "add9", intervals: [0, 4, 7, 14] },
];

interface ChordPaletteProps {
  activeChord: ChordType | null;
  onSelectChord: (chord: ChordType | null) => void;
  children: React.ReactNode;
}

export function ChordPalette({ activeChord, onSelectChord, children }: ChordPaletteProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-56 p-2" side="bottom" align="start">
        <div className="text-[9px] font-mono text-foreground/60 mb-1.5 px-1">CHORD STAMP</div>
        <div className="grid grid-cols-5 gap-1">
          {CHORD_TYPES.map((chord) => (
            <button
              key={chord.name}
              onClick={() => onSelectChord(activeChord?.name === chord.name ? null : chord)}
              className={`h-7 rounded text-[9px] font-mono transition-colors ${
                activeChord?.name === chord.name
                  ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                  : "bg-foreground/[0.08] text-foreground/65 hover:bg-foreground/[0.12] hover:text-foreground/80"
              }`}
            >
              {chord.name}
            </button>
          ))}
        </div>
        {activeChord && (
          <div className="mt-2 px-1">
            <button
              onClick={() => onSelectChord(null)}
              className="text-[8px] font-mono text-foreground/50 hover:text-foreground/70 transition-colors"
            >
              Clear chord stamp
            </button>
          </div>
        )}
        <div className="text-[7px] font-mono text-foreground/45 mt-2 px-1">
          Click grid to place chord at root pitch
        </div>
      </PopoverContent>
    </Popover>
  );
}
