export interface FigmaPianoRollKeyboardProps {
  minNote?: number;
  maxNote?: number;
  highlightedNotes?: number[];
  playingNotes?: number[];
  onNoteClick?: (note: number) => void;
  onNoteMouseDown?: (note: number) => void;
  onNoteMouseUp?: (note: number) => void;
  noteHeight?: number;
  showLabels?: boolean;
  className?: string;
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BLACK_KEYS = [1, 3, 6, 8, 10];

export function FigmaPianoRollKeyboard({
  minNote = 21,
  maxNote = 108,
  highlightedNotes = [],
  playingNotes = [],
  onNoteClick,
  onNoteMouseDown,
  onNoteMouseUp,
  noteHeight = 12,
  showLabels = true,
  className = "",
}: FigmaPianoRollKeyboardProps) {
  const isBlackKey = (note: number) => BLACK_KEYS.includes(note % 12);
  const getNoteName = (note: number) => {
    const octave = Math.floor(note / 12) - 1;
    return `${NOTE_NAMES[note % 12]}${octave}`;
  };

  const notes: number[] = [];
  for (let note = maxNote; note >= minNote; note -= 1) notes.push(note);

  return (
    <div className={`flex flex-col bg-[var(--surface-1)] border-r border-[var(--border)] ${className}`}>
      {notes.map((note) => {
        const isBlack = isBlackKey(note);
        const isHighlighted = highlightedNotes.includes(note);
        const isPlaying = playingNotes.includes(note);
        const isC = note % 12 === 0;

        return (
          <button
            key={note}
            onClick={() => onNoteClick?.(note)}
            onMouseDown={() => onNoteMouseDown?.(note)}
            onMouseUp={() => onNoteMouseUp?.(note)}
            className={[
              "relative flex-shrink-0 border-b border-[var(--border)]",
              isBlack ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-white text-black hover:bg-gray-100",
              isHighlighted ? "ring-2 ring-inset ring-indigo-600" : "",
              isPlaying ? "bg-indigo-600 text-white" : "",
              isC ? "border-b-2 border-indigo-600/30" : "",
            ].join(" ")}
            style={{ height: `${noteHeight}px` }}
          >
            {showLabels && isC ? (
              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-medium">
                {getNoteName(note)}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
