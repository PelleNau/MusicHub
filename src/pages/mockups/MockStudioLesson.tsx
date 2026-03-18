import { BookOpen, CheckCircle2, ChevronLeft, Circle, Play, Square, SkipBack, Music, X, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { MockPrototypeToolbar } from "@/components/mockups/MockPrototypeToolbar";
import { Hotspot } from "@/components/mockups/Hotspot";

const TASK_STEPS = [
  { text: "Create a new MIDI track", done: true },
  { text: "Set tempo to 120 BPM", done: true },
  { text: "Open the Piano Roll", done: false },
  { text: "Write a 4-bar melody using C major scale notes", done: false },
  { text: "Add at least one octave leap", done: false },
];

const TRACK_LANES = [
  { name: "Drums", color: "bg-orange-500", clips: [{ start: 0, width: 55 }, { start: 60, width: 35 }] },
  { name: "Bass", color: "bg-primary", clips: [{ start: 0, width: 40 }, { start: 50, width: 25 }] },
  { name: "Melody", color: "bg-accent", clips: [] },
  { name: "Pad", color: "bg-purple-500", clips: [{ start: 10, width: 50 }] },
  { name: "FX", color: "bg-warning", clips: [{ start: 30, width: 20 }] },
  { name: "Vocal", color: "bg-success", clips: [] },
];

const currentStep = 2; // 0-indexed

export default function MockStudioLesson() {
  const [guideOpen, setGuideOpen] = useState(true);

  return (
    <div className="dawn-lagoon dawn-lagoon-bg min-h-screen text-foreground flex flex-col">
      {/* Transport bar */}
      <header className="h-11 border-b border-border flex items-center px-3 gap-2 bg-chrome shrink-0">
        <Hotspot to="/mockup/learn/level" label="Level Detail">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Hotspot>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7"><SkipBack className="h-3.5 w-3.5" /></Button>
          <Button size="icon" className="h-7 w-7 bg-primary text-primary-foreground"><Play className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Square className="h-3 w-3" /></Button>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <span className="font-mono text-xs text-muted-foreground">120 BPM</span>
        <span className="font-mono text-xs text-muted-foreground">4/4</span>

        {/* Lesson progress indicator */}
        <div className="flex items-center gap-1 ml-3">
          {TASK_STEPS.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                s.done ? "bg-primary" : i === currentStep ? "bg-primary/50" : "bg-muted"
              }`}
            />
          ))}
          <span className="text-[10px] font-mono text-muted-foreground ml-1">{currentStep + 1}/{TASK_STEPS.length}</span>
        </div>

        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
          <BookOpen className="h-3 w-3" /> Theory Reference
        </Button>
        {!guideOpen && (
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setGuideOpen(true)}>
            <Music className="h-3 w-3" /> Lesson Guide
          </Button>
        )}
      </header>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track area */}
        <div className="flex-1 flex flex-col">
          {/* Timeline ruler */}
          <div className="h-7 border-b border-border bg-chrome flex items-end px-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="flex-1 border-l border-border/40 px-1">
                {i % 2 === 0 && <span className="text-[9px] font-mono text-muted-foreground">{i / 2 + 1}</span>}
              </div>
            ))}
          </div>

          {/* Tracks */}
          <div className="flex-1 overflow-auto pb-16">
            {TRACK_LANES.map((track, ti) => (
              <div
                key={track.name}
                className="flex border-b border-border h-20 animate-fade-in"
                style={{ animationDelay: `${ti * 60}ms`, animationFillMode: "backwards" }}
              >
                <div className="w-36 shrink-0 border-r border-border p-2 flex items-center gap-2 bg-chrome/50">
                  <div className={`w-2.5 h-2.5 rounded-full ${track.color}`} />
                  <span className="text-xs font-mono truncate">{track.name}</span>
                </div>
                <div className="flex-1 relative bg-secondary/10">
                  {track.clips.map((clip, ci) => (
                    <div
                      key={ci}
                      className={`absolute top-1.5 bottom-1.5 rounded ${track.color}/25 border ${track.color}/40`}
                      style={{ left: `${clip.start}%`, width: `${clip.width}%` }}
                    >
                      {/* Mini waveform decoration */}
                      <div className="h-full flex items-center justify-center gap-px px-1 overflow-hidden">
                        {Array.from({ length: 20 }).map((_, wi) => (
                          <div
                            key={wi}
                            className={`w-[2px] ${track.color}/60 rounded-full`}
                            style={{ height: `${20 + Math.random() * 60}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  {track.clips.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center border border-dashed border-border/40 m-1.5 rounded">
                      <span className="text-[10px] text-muted-foreground/40 font-mono">empty — record here</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson Guide Panel */}
        {guideOpen && (
          <div className="w-80 border-l border-border bg-chrome shrink-0 flex flex-col animate-slide-in-right">
            {/* Guide header with gradient */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  <Music className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <span className="font-mono text-xs font-semibold">Lesson Guide</span>
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-warning/20 text-warning border-0 ml-2">Apply</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setGuideOpen(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-5">
                {/* Task info */}
                <div
                  className="animate-fade-in"
                  style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
                >
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Level 3 — Module 3</p>
                  <h3 className="text-sm font-semibold mt-1">Write a Melody in C Major</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Compose a simple 4-bar melody using only notes from the C major scale (C D E F G A B). Try to include at least one octave leap.
                  </p>
                </div>

                <Separator />

                {/* Vertical stepper */}
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Steps</p>
                  <div className="relative pl-5">
                    {/* Connecting line */}
                    <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-border" />

                    {TASK_STEPS.map((step, i) => {
                      const isActive = i === currentStep;
                      return (
                        <div
                          key={i}
                          className="relative flex items-start gap-3 mb-4 last:mb-0 animate-fade-in"
                          style={{ animationDelay: `${250 + i * 60}ms`, animationFillMode: "backwards" }}
                        >
                          {/* Node */}
                          <div className="absolute -left-5 shrink-0 z-10">
                            {step.done ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : isActive ? (
                              <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/20 animate-pulse-ring" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground/40" />
                            )}
                          </div>
                          {/* Text */}
                          <div className={`text-xs leading-relaxed pt-0.5 ${
                            step.done ? "text-muted-foreground line-through" : isActive ? "text-foreground font-semibold" : "text-muted-foreground/60"
                          }`}>
                            {step.text}
                            {isActive && (
                              <span className="block text-[10px] text-primary font-normal mt-0.5">← You are here</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Theory hint */}
                <Card
                  className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 overflow-hidden animate-fade-in"
                  style={{ animationDelay: "600ms", animationFillMode: "backwards" }}
                >
                  <CardContent className="p-4">
                    <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-2">Theory Reminder</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      C major scale: <span className="font-mono text-foreground font-semibold">C D E F G A B</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">All white keys. No sharps or flats.</p>
                    {/* Mini piano keys decoration */}
                    <div className="flex gap-[2px] mt-3">
                      {["C", "D", "E", "F", "G", "A", "B"].map((n) => (
                        <div key={n} className="flex-1 h-8 bg-foreground/10 rounded-b border border-border/30 flex items-end justify-center pb-0.5">
                          <span className="text-[8px] font-mono text-muted-foreground">{n}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* XP reward */}
                <div className="flex items-center gap-2 text-xs font-mono p-3 rounded-lg bg-secondary/50">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Reward:</span>
                  <span className="font-semibold">15 XP</span>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full h-10 text-xs bg-gradient-to-r from-primary to-primary/80 font-semibold" disabled>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark Complete
                  </Button>
                  <Button variant="ghost" className="w-full h-8 text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3 mr-1" /> Review Scale Theory
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      <MockPrototypeToolbar />
    </div>
  );
}
