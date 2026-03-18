import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { NOTE_NAMES, SCALES, getDiatonicChords } from "@/lib/musicTheory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TheoryLearnPractice } from "./TheoryLearnPractice";

/* ── Circle of Fifths order (clockwise from top) ── */
const FIFTHS_ORDER = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]; // C G D A E B F#/Gb Db Ab Eb Bb F

/* Relative minor for each position — relative minor is always 3 semitones below (= 9 above) */
const RELATIVE_MINORS = FIFTHS_ORDER.map((n) => (n + 9) % 12); // Am Em Bm F#m C#m G#m Ebm Bbm Fm Cm Gm Dm

/* Key signature: number of sharps (+) or flats (-) per major key */
const KEY_SIGNATURES: Record<number, number> = {
  0: 0,   // C
  7: 1,   // G  — 1#
  2: 2,   // D  — 2#
  9: 3,   // A  — 3#
  4: 4,   // E  — 4#
  11: 5,  // B  — 5#
  6: 6,   // F#/Gb — 6#/6b
  1: -5,  // Db — 5b
  8: -4,  // Ab — 4b
  3: -3,  // Eb — 3b
  10: -2, // Bb — 2b
  5: -1,  // F  — 1b
};

const MAJOR_LABELS: Record<number, string> = {
  0: "C", 1: "D♭", 2: "D", 3: "E♭", 4: "E", 5: "F",
  6: "F♯", 7: "G", 8: "A♭", 9: "A", 10: "B♭", 11: "B",
};
const MINOR_LABELS: Record<number, string> = {
  0: "c", 1: "c♯", 2: "d", 3: "e♭", 4: "e", 5: "f",
  6: "f♯", 7: "g", 8: "g♯", 9: "a", 10: "b♭", 11: "b",
};

function formatKeySig(n: number): string {
  if (n === 0) return "no ♯/♭";
  if (n > 0) return `${n}♯`;
  return `${Math.abs(n)}♭`;
}

/* ── Simple multi-voice audio for chord playback ── */
function playChordAudio(root: number, isMinor: boolean, isDim: boolean) {
  try {
    const ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const base = 48 + root; // octave 3
    const third = isDim ? 3 : isMinor ? 3 : 4;
    const fifth = isDim ? 6 : 7;
    const pitches = [base, base + third, base + fifth];

    pitches.forEach((pitch, idx) => {
      const freq = 440 * Math.pow(2, (pitch - 69) / 12);
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const vol = 0.12 - idx * 0.015;
      const delay = idx * 0.025;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
      gain.gain.setValueAtTime(vol, ctx.currentTime + delay + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 1.3);
    });
  } catch { /* audio not available */ }
}

/* ── Determine which keys in the circle are diatonic to the selected key ──
   On the circle of fifths, the diatonic keys of any major key form a
   contiguous arc of 7 segments. The tonic sits with 1 key clockwise
   (the dominant) and 5 keys counterclockwise (subdominant side).
   Specifically: positions [tonicIdx-1 .. tonicIdx+5] mod 12. */
function getDiatonicIndices(selectedKey: number): Set<number> {
  const tonicIdx = FIFTHS_ORDER.indexOf(selectedKey);
  const indices = new Set<number>();
  for (let offset = -1; offset <= 5; offset++) {
    indices.add(((tonicIdx + offset) % 12 + 12) % 12);
  }
  return indices;
}

export function CircleOfFifths() {
  const [selectedKey, setSelectedKey] = useState<number>(0);
  const [hoveredSegment, setHoveredSegment] = useState<{ note: number; isMinor: boolean } | null>(null);
  const [rotation, setRotation] = useState(0);
  const dragRef = useRef<{ startAngle: number; startRot: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const diatonicIndices = getDiatonicIndices(selectedKey);
  const diatonicChords = getDiatonicChords(selectedKey, SCALES["Major"]);

  // Relationships
  const tonicIdx = FIFTHS_ORDER.indexOf(selectedKey);
  const dominantNote = FIFTHS_ORDER[(tonicIdx + 1) % 12]; // 1 step clockwise
  const subdominantNote = FIFTHS_ORDER[((tonicIdx - 1) % 12 + 12) % 12]; // 1 step counter-clockwise
  const relativeMinor = (selectedKey + 9) % 12;

  const handleSegmentClick = useCallback((note: number, isMinor: boolean) => {
    if (!isMinor) setSelectedKey(note);
    playChordAudio(note, isMinor, false);
  }, []);

  const getAngle = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const cxr = rect.left + rect.width / 2;
    const cyr = rect.top + rect.height / 2;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - cyr, clientX - cxr) * (180 / Math.PI);
  };

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    dragRef.current = { startAngle: getAngle(e), startRot: rotation };
  };
  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current) return;
    setRotation(dragRef.current.startRot + (getAngle(e) - dragRef.current.startAngle));
  };
  const onDragEnd = () => { dragRef.current = null; };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setRotation((r) => r + (e.deltaY > 0 ? 15 : -15));
  };

  const cx = 200, cy = 200;
  const outerR = 175, midR = 130, innerR = 85;

  /* Segments start at -90° so index 0 (C) is at 12 o'clock */
  const ANGLE_OFFSET = -90;

  const makeSegmentPath = (i: number, r1: number, r2: number) => {
    const a1 = ((i * 30 - 15) + ANGLE_OFFSET) * (Math.PI / 180);
    const a2 = ((i * 30 + 15) + ANGLE_OFFSET) * (Math.PI / 180);
    const x1o = cx + r1 * Math.cos(a1), y1o = cy + r1 * Math.sin(a1);
    const x2o = cx + r1 * Math.cos(a2), y2o = cy + r1 * Math.sin(a2);
    const x1i = cx + r2 * Math.cos(a2), y1i = cy + r2 * Math.sin(a2);
    const x2i = cx + r2 * Math.cos(a1), y2i = cy + r2 * Math.sin(a1);
    return `M ${x1o} ${y1o} A ${r1} ${r1} 0 0 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${r2} ${r2} 0 0 0 ${x2i} ${y2i} Z`;
  };

  const getLabelPos = (i: number, r: number) => {
    const a = ((i * 30) + ANGLE_OFFSET) * (Math.PI / 180);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // Find the chord quality for a note in the diatonic set
  const getChordForNote = (note: number) => diatonicChords.find((c) => c.rootIndex === note);

  return (
    <div className="space-y-5">
      
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">Key:</span>
          <Select value={String(selectedKey)} onValueChange={(v) => setSelectedKey(Number(v))}>
            <SelectTrigger className="w-28 h-8 font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTE_NAMES.map((n, i) => (
                <SelectItem key={i} value={String(i)} className="font-mono text-xs">{n} Major</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <span className="px-2 py-0.5 rounded bg-muted/50">{formatKeySig(KEY_SIGNATURES[selectedKey])}</span>
          <span>Dominant: <strong className="text-foreground">{MAJOR_LABELS[dominantNote]}</strong></span>
          <span>Subdominant: <strong className="text-foreground">{MAJOR_LABELS[subdominantNote]}</strong></span>
          <span>Relative minor: <strong className="text-foreground">{MINOR_LABELS[relativeMinor]}</strong></span>
        </div>
      </div>

      <div className="flex justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 400 400"
          width="380"
          height="380"
          className="select-none cursor-grab active:cursor-grabbing"
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
          onWheel={onWheel}
        >
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "200px 200px", transition: dragRef.current ? "none" : "transform 0.3s ease" }}>
            {/* Outer ring — Major keys */}
            {FIFTHS_ORDER.map((note, i) => {
              const isDiatonic = diatonicIndices.has(i);
              const isRoot = note === selectedKey;
              const isDom = note === dominantNote && !isRoot;
              const isSub = note === subdominantNote && !isRoot;
              const chord = getChordForNote(note);

              return (
                <g key={`maj-${i}`}>
                  <path
                    d={makeSegmentPath(i, outerR, midR)}
                    className={cn(
                      "transition-colors duration-150 cursor-pointer",
                      isRoot
                        ? "fill-primary stroke-primary/80"
                        : isDom || isSub
                          ? "fill-primary/30 stroke-primary/40 hover:fill-primary/40"
                          : isDiatonic
                            ? "fill-primary/15 stroke-primary/25 hover:fill-primary/25"
                            : "fill-muted/30 stroke-border/30 hover:fill-muted/50",
                    )}
                    strokeWidth={1}
                    onClick={() => handleSegmentClick(note, false)}
                    onMouseEnter={() => setHoveredSegment({ note, isMinor: false })}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                  {(() => {
                    const pos = getLabelPos(i, (outerR + midR) / 2);
                    return (
                      <>
                        <text
                          x={pos.x}
                          y={pos.y - (isDiatonic ? 4 : 0)}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className={cn(
                            "text-[12px] font-mono font-bold pointer-events-none select-none",
                            isRoot ? "fill-primary-foreground" : isDiatonic ? "fill-primary" : "fill-muted-foreground",
                          )}
                          style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: `${pos.x}px ${pos.y}px` }}
                        >
                          {MAJOR_LABELS[note]}
                        </text>
                        {isDiatonic && chord && (
                          <text
                            x={pos.x}
                            y={pos.y + 9}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className={cn(
                              "text-[8px] font-mono pointer-events-none select-none",
                              isRoot ? "fill-primary-foreground/70" : "fill-primary/60",
                            )}
                            style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: `${pos.x}px ${pos.y}px` }}
                          >
                            {chord.roman}
                          </text>
                        )}
                      </>
                    );
                  })()}
                </g>
              );
            })}

            {/* Inner ring — relative Minor keys */}
            {RELATIVE_MINORS.map((note, i) => {
              const isDiatonic = diatonicIndices.has(i);
              const isRelMinor = note === relativeMinor;
              const chord = getChordForNote(note);

              return (
                <g key={`min-${i}`}>
                  <path
                    d={makeSegmentPath(i, midR, innerR)}
                    className={cn(
                      "transition-colors duration-150 cursor-pointer",
                      isRelMinor
                        ? "fill-accent stroke-accent/60"
                        : isDiatonic
                          ? "fill-accent/12 stroke-accent/15 hover:fill-accent/20"
                          : "fill-muted/15 stroke-border/15 hover:fill-muted/30",
                    )}
                    strokeWidth={1}
                    onClick={() => handleSegmentClick(note, true)}
                    onMouseEnter={() => setHoveredSegment({ note, isMinor: true })}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                  {(() => {
                    const pos = getLabelPos(i, (midR + innerR) / 2);
                    return (
                      <>
                        <text
                          x={pos.x}
                          y={pos.y - (isDiatonic && chord ? 3 : 0)}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className={cn(
                            "text-[9px] font-mono pointer-events-none select-none",
                            isRelMinor ? "fill-accent-foreground font-bold" : isDiatonic ? "fill-foreground/60" : "fill-muted-foreground/50",
                          )}
                          style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: `${pos.x}px ${pos.y}px` }}
                        >
                          {MINOR_LABELS[note]}
                        </text>
                        {isDiatonic && chord && (
                          <text
                            x={pos.x}
                            y={pos.y + 8}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className={cn(
                              "text-[7px] font-mono pointer-events-none select-none",
                              isRelMinor ? "fill-accent-foreground/60" : "fill-muted-foreground/40",
                            )}
                            style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: `${pos.x}px ${pos.y}px` }}
                          >
                            {chord.roman}
                          </text>
                        )}
                      </>
                    );
                  })()}
                </g>
              );
            })}

            {/* Center info */}
            <circle cx={cx} cy={cy} r={innerR} className="fill-card stroke-border/50" strokeWidth={1.5} />
            <text
              x={cx} y={cy - 14}
              textAnchor="middle" dominantBaseline="central"
              className="text-base font-mono font-bold fill-foreground"
              style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}
            >
              {hoveredSegment ? (hoveredSegment.isMinor ? MINOR_LABELS[hoveredSegment.note] : MAJOR_LABELS[hoveredSegment.note]) : MAJOR_LABELS[selectedKey]}
            </text>
            <text
              x={cx} y={cy + 4}
              textAnchor="middle" dominantBaseline="central"
              className="text-[9px] font-mono fill-muted-foreground"
              style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}
            >
              {hoveredSegment
                ? (hoveredSegment.isMinor ? "minor" : "Major")
                : `Major · ${formatKeySig(KEY_SIGNATURES[selectedKey])}`
              }
            </text>
            <text
              x={cx} y={cy + 18}
              textAnchor="middle" dominantBaseline="central"
              className="text-[8px] font-mono fill-muted-foreground/50"
              style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}
            >
              click to play
            </text>
          </g>
        </svg>
      </div>

      {/* Diatonic chords of the selected key */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono text-muted-foreground text-center">Diatonic chords in {MAJOR_LABELS[selectedKey]} Major</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {diatonicChords.map((c, i) => (
            <button
              key={i}
              onClick={() => playChordAudio(c.rootIndex, c.quality === "minor", c.quality === "diminished")}
              className={cn(
                "px-3 py-1.5 rounded text-[11px] font-mono font-semibold transition-colors",
                "bg-primary/10 text-primary hover:bg-primary/20 ring-1 ring-primary/15",
              )}
            >
              <span className="block">{c.roman}</span>
              <span className="block text-[8px] font-normal text-muted-foreground">{c.root}</span>
            </button>
          ))}
        </div>
      </div>
      <TheoryLearnPractice topicKey="circle-of-fifths" moduleKey="circle-of-fifths" />
    </div>
  );
}
