import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, BookOpen, Target, Zap, Award, ExternalLink, Lock, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Hotspot } from "@/components/mockups/Hotspot";

const LEVEL = {
  id: 1,
  title: "Sound & Pitch",
  desc: "Discover what sound actually is — vibrations, pitch, loudness, and waveforms. This foundational level sets the stage for everything you'll learn in music production.",
  progress: 15,
  xpEarned: 30,
  xpTotal: 120,
  timeLeft: "~40 min remaining",
};

const MODULES = [
  { id: "1-1", title: "Sound is Vibration", type: "learn" as const, duration: "6 min", done: true, xp: 15, summary: "Explore how sound travels as pressure waves and what makes it different from silence." },
  { id: "1-2", title: "Pitch — High & Low", type: "learn" as const, duration: "6 min", done: false, xp: 15, summary: "Understand frequency and how it maps to musical pitch — from deep bass to bright treble." },
  { id: "1-3", title: "Loudness & Amplitude", type: "learn" as const, duration: "5 min", done: false, xp: 15, summary: "Learn how amplitude determines volume and why decibels matter in production." },
  { id: "1-4", title: "Waveforms", type: "learn" as const, duration: "7 min", done: false, xp: 15, summary: "See and hear the four classic waveforms: sine, square, triangle, and sawtooth." },
  { id: "1-5", title: "Timbre & Tone Color", type: "learn" as const, duration: "6 min", done: false, xp: 15, summary: "Discover why a piano and a guitar sound different even playing the same note." },
  { id: "1-6", title: "Sound Shaping Challenge", type: "practice" as const, duration: "5 min", done: false, xp: 20, summary: "Match target sounds by adjusting pitch, volume, and waveform parameters." },
  { id: "1-7", title: "Sound Explorer", type: "apply" as const, duration: "8 min", done: false, xp: 15, summary: "Combine everything you've learned to design three unique sounds from scratch." },
  { id: "1-8", title: "What is Sound? Capstone", type: "checkpoint" as const, duration: "5 min", done: false, xp: 30, summary: "Prove your understanding of sound fundamentals to unlock Level 2: Rhythm & Time." },
];

const TYPE_META: Record<string, { icon: React.ElementType; border: string; bg: string; label: string }> = {
  learn: { icon: BookOpen, border: "border-l-primary", bg: "bg-primary/10 text-primary", label: "Learn" },
  practice: { icon: Target, border: "border-l-accent", bg: "bg-accent/10 text-accent", label: "Practice" },
  apply: { icon: Zap, border: "border-l-warning", bg: "bg-warning/10 text-warning", label: "Apply" },
  checkpoint: { icon: Award, border: "border-l-success", bg: "bg-success/10 text-success", label: "Checkpoint" },
};

function ProgressRing({ size = 140, progress = 0.4 }: { size?: number; progress?: number }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  return (
    <svg width={size} height={size} className="drop-shadow-lg">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={12} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth={12}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="44%" textAnchor="middle" dy="0.35em" className="fill-foreground font-mono text-2xl font-bold">{Math.round(progress * 100)}%</text>
      <text x="50%" y="62%" textAnchor="middle" dy="0.35em" className="fill-muted-foreground font-mono text-[10px]">complete</text>
    </svg>
  );
}

export default function MockLevelDetail() {
  const navigate = useNavigate();
  const doneCount = MODULES.filter((m) => m.done).length;

  return (
    <div className="text-foreground flex h-full">
        {/* Left — sticky level hero */}
        <div className="w-80 shrink-0 border-r border-border bg-gradient-to-b from-primary/5 via-background to-background p-6 flex flex-col items-center gap-6 overflow-auto">
          <div
            className="animate-fade-in"
            style={{ animationDelay: "0ms", animationFillMode: "backwards" }}
          >
            <ProgressRing size={160} progress={LEVEL.progress / 100} />
          </div>

          <div
            className="text-center space-y-1 animate-fade-in"
            style={{ animationDelay: "50ms", animationFillMode: "backwards" }}
          >
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Level {LEVEL.id}</p>
            <h1 className="text-xl font-mono font-bold">{LEVEL.title}</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">{LEVEL.desc}</p>
          </div>

          <div
            className="w-full space-y-3 text-xs font-mono animate-fade-in"
            style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
          >
            <div className="flex justify-between">
              <span className="text-muted-foreground">XP Earned</span>
              <span className="font-semibold flex items-center gap-1"><Zap className="h-3 w-3 text-primary" />{LEVEL.xpEarned} / {LEVEL.xpTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modules</span>
              <span className="font-semibold">{doneCount} / {MODULES.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Left</span>
              <span className="font-semibold flex items-center gap-1"><Clock className="h-3 w-3" />{LEVEL.timeLeft}</span>
            </div>
          </div>

          <Separator className="w-full" />

          {/* Next level teaser */}
          <div
            className="w-full p-4 rounded-lg border border-dashed border-border bg-secondary/30 animate-fade-in"
            style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
          >
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Up Next</p>
            <p className="text-sm font-semibold mt-1">Level 2: Rhythm & Time</p>
            <p className="text-[10px] text-muted-foreground mt-1">Complete all modules to unlock</p>
          </div>
        </div>

        {/* Right — scrollable modules */}
        <div className="flex-1 overflow-auto p-6 space-y-4 pb-20">
          {MODULES.map((m, idx) => {
            const meta = TYPE_META[m.type];
            const Icon = meta.icon;
            const isNext = !m.done && (idx === 0 || MODULES[idx - 1].done);
            const isLocked = !m.done && !isNext;

            const card = (
              <Card
                key={m.id}
                className={`border-l-4 ${meta.border} transition-all
                  ${isNext ? "animate-enter shadow-theme-md" : "animate-fade-in"}
                  ${m.done ? "opacity-50" : ""}
                  ${isLocked ? "opacity-40" : ""}
                `}
                style={{
                  animationDelay: `${50 + idx * 40}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  {/* Status */}
                  <div className="mt-1 shrink-0">
                    {m.done ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : isNext ? (
                      <div className="h-6 w-6 rounded-full border-2 border-primary animate-pulse-ring" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm font-semibold ${m.done ? "line-through" : ""}`}>{m.title}</h3>
                      <Badge variant="secondary" className={`text-[9px] h-5 px-2 border-0 ${meta.bg}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{m.summary}</p>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-mono">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {m.duration}</span>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> {m.xp} XP</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0 self-center">
                    {m.done ? (
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">Review</Button>
                    ) : isNext ? (
                      m.type === "apply" ? (
                        <Button size="sm" className="h-9 text-xs bg-gradient-to-r from-warning to-accent text-white border-0 gap-1.5" onClick={() => navigate("/mockup/studio")}>
                          Open in Studio <ExternalLink className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button size="sm" className="h-9 text-xs gap-1.5" onClick={() => navigate("/mockup/learn/module")}>
                          Start <ChevronRight className="h-3 w-3" />
                        </Button>
                      )
                    ) : (
                      <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground" disabled>
                        <Lock className="h-3 w-3 mr-1" /> Locked
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );

            // Wrap first module's "Start" with hotspot to module flow
            if (idx === 0 && isNext) {
              return (
                <Hotspot key={m.id} to="/mockup/learn/module" label="Module Flow">
                  {card}
                </Hotspot>
              );
            }

            // Wrap "Apply" modules with hotspot to studio
            if (m.type === "apply" && isNext) {
              return (
                <Hotspot key={m.id} to="/mockup/studio" label="Studio + Lesson Guide">
                  {card}
                </Hotspot>
              );
            }

            return <div key={m.id}>{card}</div>;
          })}

          {/* Celebration placeholder */}
          <Card
            className="border-dashed border-2 border-primary/20 bg-primary/5 animate-fade-in"
            style={{ animationDelay: `${50 + MODULES.length * 40}ms`, animationFillMode: "backwards" }}
          >
            <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
              <Sparkles className="h-8 w-8 text-primary" />
              <h3 className="font-mono font-semibold">Level Complete!</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Complete all 7 modules to unlock this celebration and progress to Level 4: Chords & Harmony.
              </p>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
