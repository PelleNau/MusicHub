import { useState } from "react";
import {
  Play, Pause, Square, SkipBack, Repeat, Undo2, Redo2, Circle,
  ChevronRight, ChevronLeft, BookOpen, CheckCircle2, Circle as CircleIcon,
  Lightbulb, Music, Mic, Waves, Sliders, Sparkles, Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getTrackColor } from "@/components/studio/track/trackColors";

/* ── Mock data ── */

const TRACKS = [
  { name: "Drums", type: "audio" as const, icon: Music, colorIdx: 0, clips: [{ start: 0, len: 8 }, { start: 10, len: 6 }] },
  { name: "Bass", type: "midi" as const, icon: Waves, colorIdx: 8, clips: [{ start: 0, len: 6 }, { start: 8, len: 4 }] },
  { name: "Melody", type: "midi" as const, icon: Sparkles, colorIdx: 4, clips: [] },
  { name: "Pad", type: "midi" as const, icon: Volume2, colorIdx: 9, clips: [{ start: 4, len: 10 }] },
  { name: "Vocals", type: "audio" as const, icon: Mic, colorIdx: 16, clips: [{ start: 2, len: 8 }] },
  { name: "FX", type: "audio" as const, icon: Sliders, colorIdx: 6, clips: [{ start: 6, len: 6 }] },
];

const STEPS = [
  { text: "Set tempo to 90 BPM and time signature to 4/4", done: true },
  { text: "Record a 4-bar drum pattern on the Drums track", done: true },
  { text: "Add a bass line using the Wavetable synth", done: false },
  { text: "Layer a pad sound starting at bar 2", done: false },
  { text: "Apply reverb to the FX send channel", done: false },
];

const TOTAL_BARS = 16;
const BEATS_PER_BAR = 4;
const PX_PER_BEAT = 28;
const TOTAL_BEATS = TOTAL_BARS * BEATS_PER_BAR;
const TRACK_H = 56;

/* ── Glass surface helper ── */
const glass = "backdrop-blur-xl bg-white/[0.04] border border-white/[0.08]";
const glassHover = "hover:border-primary/40 hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.25)]";

export default function MockStudioThemed() {
  const [playing, setPlaying] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const currentStep = 2;

  return (
    <div className="dawn-lagoon dawn-lagoon-bg min-h-screen flex flex-col text-foreground font-mono text-xs select-none">
      {/* ── Transport Bar ── */}
      <header className={`h-11 flex items-center gap-3 px-3 shrink-0 ${glass} rounded-none border-x-0 border-t-0`}>
        {/* Playback controls */}
        <div className={`flex items-center gap-0.5 ${glass} rounded-md px-1 py-0.5`}>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setPlaying(false); }}>
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          {playing ? (
            <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={() => setPlaying(false)}>
              <Pause className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPlaying(true)}>
              <Play className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-7 w-7">
            <Square className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7">
            <Circle className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-primary bg-primary/10">
            <Repeat className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Undo / Redo */}
        <div className={`flex items-center gap-0.5 ${glass} rounded-md px-1 py-0.5`}>
          <Button size="icon" variant="ghost" className="h-7 w-7"><Undo2 className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7"><Redo2 className="h-3.5 w-3.5" /></Button>
        </div>

        {/* Position */}
        <div className={`${glass} rounded-md px-2 py-0.5 tabular-nums text-sm font-semibold`}>1.1.1</div>

        {/* Tempo */}
        <div className={`${glass} rounded-md px-2 py-0.5 flex items-center gap-1.5`}>
          <span className="tabular-nums font-semibold">90</span>
          <span className="text-muted-foreground">BPM</span>
        </div>

        <span className={`${glass} rounded-md px-2 py-0.5 text-muted-foreground`}>4/4</span>

        {playing && (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-semibold">PLAY</span>
          </div>
        )}

        {/* Lesson progress dots */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  s.done ? "bg-primary" : i === currentStep ? "bg-primary/50 animate-pulse" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setGuideOpen(!guideOpen)}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* ── Main area ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Timeline + tracks */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Ruler */}
          <div className={`h-6 flex items-end ${glass} rounded-none border-x-0 border-t-0 overflow-hidden`}>
            <div className="w-[120px] shrink-0 border-r border-white/[0.06]" />
            <div className="flex-1 overflow-hidden">
              <div className="flex" style={{ width: TOTAL_BEATS * PX_PER_BEAT }}>
                {Array.from({ length: TOTAL_BARS }, (_, i) => (
                  <div
                    key={i}
                    className="border-l border-white/[0.1] text-[10px] text-muted-foreground pl-1 leading-none pb-1"
                    style={{ width: BEATS_PER_BAR * PX_PER_BEAT }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Track lanes */}
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {TRACKS.map((t, ti) => {
                const color = getTrackColor(t.colorIdx);
                return (
                  <div
                    key={t.name}
                    className={`flex border-b border-white/[0.04] animate-fade-in`}
                    style={{ height: TRACK_H, animationDelay: `${ti * 60}ms`, animationFillMode: "backwards" }}
                  >
                    {/* Track controls */}
                    <div className={`w-[120px] shrink-0 flex items-center gap-2 px-2 ${glass} rounded-none border-y-0 border-l-0`}>
                      <div className="h-3 w-1 rounded-full" style={{ background: color }} />
                      <t.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate text-[11px]">{t.name}</span>
                    </div>

                    {/* Clips area */}
                    <div className="flex-1 relative overflow-hidden">
                      {/* Beat grid lines */}
                      {Array.from({ length: TOTAL_BEATS }, (_, bi) => (
                        <div
                          key={bi}
                          className="absolute top-0 bottom-0 border-l"
                          style={{
                            left: bi * PX_PER_BEAT,
                            borderColor: bi % BEATS_PER_BAR === 0 ? "hsl(var(--foreground) / 0.08)" : "hsl(var(--foreground) / 0.03)",
                          }}
                        />
                      ))}

                      {/* Clip blocks */}
                      {t.clips.map((c, ci) => (
                        <div
                          key={ci}
                          className={`absolute top-1 bottom-1 rounded-md ${glass} ${glassHover} transition-all duration-300 overflow-hidden group`}
                          style={{
                            left: c.start * BEATS_PER_BAR * PX_PER_BEAT,
                            width: c.len * PX_PER_BEAT * BEATS_PER_BAR * 0.25,
                          }}
                        >
                          {/* Color accent top border */}
                          <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: color }} />

                          {/* Mini waveform decoration */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                            {t.type === "audio" ? (
                              <svg viewBox="0 0 80 20" className="w-full h-3/5 px-1" preserveAspectRatio="none">
                                <path
                                  d="M0,10 Q5,2 10,10 Q15,18 20,10 Q25,4 30,10 Q35,16 40,10 Q45,3 50,10 Q55,17 60,10 Q65,5 70,10 Q75,15 80,10"
                                  fill="none"
                                  stroke={color}
                                  strokeWidth="1.5"
                                  vectorEffect="non-scaling-stroke"
                                />
                              </svg>
                            ) : (
                              <div className="flex items-end gap-[2px] h-3/5">
                                {Array.from({ length: 12 }, (_, ni) => (
                                  <div
                                    key={ni}
                                    className="w-[3px] rounded-sm"
                                    style={{
                                      height: `${30 + Math.sin(ni * 1.2) * 60}%`,
                                      background: color,
                                      opacity: 0.6,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Clip label */}
                          <span className="absolute bottom-0.5 left-1 text-[9px] text-foreground/60">{t.name}</span>
                        </div>
                      ))}

                      {/* Empty track hint */}
                      {t.clips.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 italic text-[10px]">
                          Double-click to record…
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Bottom panel tabs */}
          <div className={`h-28 ${glass} rounded-none border-x-0 border-b-0 flex flex-col`}>
            <div className="flex items-center gap-1 px-2 h-7 border-b border-white/[0.06]">
              <button className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-semibold">Detail</button>
              <button className="px-2 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground transition-colors">Mixer</button>
            </div>
            <div className="flex-1 flex items-center justify-center text-muted-foreground/40 text-[10px]">
              Select a device to edit parameters
            </div>
          </div>
        </div>

        {/* ── Instructions Panel ── */}
        {guideOpen && (
          <aside
            className={`w-80 shrink-0 ${glass} rounded-none border-y-0 border-r-0 flex flex-col animate-fade-in`}
            style={{ animationDuration: "200ms" }}
          >
            <div className="h-8 flex items-center justify-between px-3 border-b border-white/[0.06]">
              <span className="font-semibold text-[11px] flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                Lesson Guide
              </span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setGuideOpen(false)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                {/* Progress header */}
                <div className={`rounded-xl ${glass} p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground">Module 1 · Lesson 3</span>
                    <Badge variant="secondary" className="text-[9px] h-4 bg-primary/10 text-primary border-0">
                      {STEPS.filter(s => s.done).length}/{STEPS.length}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">Building Your First Beat</h3>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(STEPS.filter(s => s.done).length / STEPS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-1">
                  {STEPS.map((s, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 rounded-lg p-2 transition-colors ${
                        i === currentStep ? `${glass} border-primary/30` : ""
                      }`}
                    >
                      {s.done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <CircleIcon className={`h-4 w-4 mt-0.5 shrink-0 ${i === currentStep ? "text-primary" : "text-muted-foreground/40"}`} />
                      )}
                      <span className={`text-[11px] leading-relaxed ${s.done ? "text-muted-foreground line-through" : i === currentStep ? "text-foreground" : "text-muted-foreground/60"}`}>
                        {s.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Theory card */}
                <div className={`rounded-xl ${glass} p-3 space-y-2`}>
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-accent" />
                    <span className="text-[10px] font-semibold text-accent">Theory Reminder</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    A <strong className="text-foreground">bass line</strong> typically follows the root notes of the chord progression.
                    Try using notes from the <strong className="text-foreground">C minor pentatonic</strong> scale.
                  </p>
                  {/* Mini piano keys */}
                  <div className="flex gap-[1px] h-6 mt-1">
                    {["C", "", "D", "", "E", "F", "", "G", "", "A", "", "B"].map((note, ni) => {
                      const isBlack = note === "";
                      const isHighlight = ["C", "E", "G"].includes(note);
                      return isBlack ? (
                        <div key={ni} className="w-3 h-4 rounded-b-sm bg-foreground/80 -mx-1.5 z-10 relative" />
                      ) : (
                        <div
                          key={ni}
                          className={`w-4 h-full rounded-b-sm border border-white/[0.1] ${
                            isHighlight ? "bg-primary/30" : "bg-white/[0.06]"
                          }`}
                        >
                          {isHighlight && (
                            <span className="text-[7px] text-primary flex items-end justify-center h-full pb-0.5">{note}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* XP reward */}
                <div className={`rounded-xl ${glass} p-3 flex items-center gap-3`}>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Completion reward</span>
                    <p className="text-sm font-bold text-primary">+50 XP</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Collapsed guide toggle */}
        {!guideOpen && (
          <button
            className={`w-6 shrink-0 ${glass} rounded-none border-y-0 border-r-0 flex items-center justify-center hover:bg-white/[0.06] transition-colors`}
            onClick={() => setGuideOpen(true)}
          >
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* ── Status bar ── */}
      <footer className={`h-6 flex items-center px-3 gap-4 text-[10px] text-muted-foreground ${glass} rounded-none border-x-0 border-b-0`}>
        <span>{TRACKS.length} tracks</span>
        <span>{TOTAL_BARS} bars</span>
        <span>90 BPM</span>
        <span>Grid: 1/16</span>
        <span className="ml-auto text-primary/60">Ocean Theme Preview</span>
      </footer>
    </div>
  );
}
