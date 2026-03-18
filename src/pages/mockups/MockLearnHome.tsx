import { useNavigate } from "react-router-dom";
import { CheckCircle2, Lock, Flame, Zap, Music, BookOpen, Headphones, Guitar, Piano, Mic, Waves, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Hotspot } from "@/components/mockups/Hotspot";

const LEVELS = [
  { id: 1, title: "Sound & Pitch", icon: Waves, status: "active" as const, xp: 30, xpTotal: 120, modules: 5, progress: 15 },
  { id: 2, title: "Rhythm & Time", icon: Music, status: "locked" as const, xp: 0, modules: 6 },
  { id: 3, title: "Scales & Melody", icon: Piano, status: "locked" as const, xp: 0, modules: 7 },
  { id: 4, title: "Chords & Harmony", icon: Guitar, status: "locked" as const, xp: 0, modules: 8 },
  { id: 5, title: "Song Structure", icon: BookOpen, status: "locked" as const, xp: 0, modules: 6 },
  { id: 6, title: "Sound Design", icon: Headphones, status: "locked" as const, xp: 0, modules: 7 },
  { id: 7, title: "Mixing Basics", icon: Mic, status: "locked" as const, xp: 0, modules: 6 },
  { id: 8, title: "Production Mastery", icon: Award, status: "locked" as const, xp: 0, modules: 8 },
];

const ACTIVE_MODULES = [
  { title: "Sound is Vibration", type: "learn", done: true },
  { title: "Pitch — High & Low", type: "learn", done: false },
  { title: "Loudness & Amplitude", type: "learn", done: false },
  { title: "Waveforms", type: "learn", done: false },
];

const TYPE_DOT: Record<string, string> = {
  learn: "bg-primary",
  practice: "bg-accent",
  apply: "bg-warning",
  checkpoint: "bg-success",
};

function SmallXpRing({ xp, max, size = 36 }: { xp: number; max: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - xp / max);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth={4}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/* ── Path node positions (snake pattern) ── */
function getNodePos(index: number, total: number) {
  const ySpacing = 130;
  const xCenter = 400;
  const xAmplitude = 140;
  const y = 60 + index * ySpacing;
  const x = xCenter + (index % 2 === 0 ? -xAmplitude : xAmplitude);
  return { x, y, totalHeight: 60 + (total - 1) * ySpacing + 60 };
}

export default function MockLearnHome() {
  const navigate = useNavigate();
  const totalXp = 1240;
  const positions = LEVELS.map((_, i) => getNodePos(i, LEVELS.length));
  const svgHeight = positions[0]?.totalHeight ?? 800;

  return (
    <div className="text-foreground">
      {/* Stats banner */}
      <div
        className="w-full border-b border-border bg-gradient-to-r from-primary/5 via-background to-accent/5 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "backwards" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-8 flex-wrap">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Your Path</p>
            <h1 className="text-2xl font-mono font-bold mt-1">Music Production Journey</h1>
            <p className="text-sm text-muted-foreground mt-1">8 levels · 53 modules · from zero to producer</p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-6 text-sm font-mono">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">0</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-warning">15%</p>
              <p className="text-[10px] text-muted-foreground">Current</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-muted-foreground">8</p>
              <p className="text-[10px] text-muted-foreground">Remaining</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-auto pb-6">
        <div className="relative mx-auto" style={{ width: 800, minHeight: svgHeight }}>
          {/* Background topo pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(ellipse at 30% 20%, hsl(var(--primary)) 0%, transparent 50%),
                                radial-gradient(ellipse at 70% 60%, hsl(var(--accent)) 0%, transparent 50%)`,
            }}
          />

          {/* SVG connecting path */}
          <svg className="absolute inset-0 w-full" style={{ height: svgHeight }} viewBox={`0 0 800 ${svgHeight}`}>
            {positions.map((pos, i) => {
              if (i === 0) return null;
              const prev = positions[i - 1];
              const midY = (prev.y + pos.y) / 2;
              const level = LEVELS[i];
              const prevLevel = LEVELS[i - 1];
              const isCompleted = false; // no completed levels yet
              return (
                <path
                  key={i}
                  d={`M ${prev.x} ${prev.y} C ${prev.x} ${midY}, ${pos.x} ${midY}, ${pos.x} ${pos.y}`}
                  fill="none"
                  stroke={isCompleted ? "hsl(var(--primary))" : "hsl(var(--border))"}
                  strokeWidth={3}
                  strokeDasharray={isCompleted ? "none" : "8 6"}
                  className="animate-path-draw"
                  style={{
                    animationDelay: `${100 + i * 60}ms`,
                    animationFillMode: "backwards",
                  }}
                />
              );
            })}
          </svg>

          {/* Level nodes */}
          {LEVELS.map((level, i) => {
            const pos = positions[i];
            const Icon = level.icon;
            const isActive = level.status === "active";
            const isDone = false;
            const isLocked = level.status === "locked";

            const nodeContent = (
              <div
                className="absolute flex items-center gap-4 animate-fade-only"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: "translate(-50%, -50%)",
                  animationDelay: `${100 + i * 40}ms`,
                  animationFillMode: "backwards",
                }}
              >
                {/* Node circle */}
                <div
                  className={`relative h-14 w-14 rounded-full flex items-center justify-center shrink-0 transition-all
                    ${isDone ? "bg-primary text-primary-foreground shadow-lg" : ""}
                    ${isActive ? "bg-primary/20 border-2 border-primary animate-pulse-ring" : ""}
                    ${isLocked ? "bg-secondary text-muted-foreground" : ""}
                  `}
                >
                  {isDone ? <CheckCircle2 className="h-6 w-6" /> : isLocked ? <Lock className="h-5 w-5" /> : <Icon className="h-6 w-6 text-primary" />}
                </div>

                {/* Label card */}
                <Card className={`w-56 transition-all ${isActive ? "border-primary/50 shadow-theme-md" : ""} ${isLocked ? "opacity-50" : ""}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">Level {level.id}</span>
                      {isDone && <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-primary/15 text-primary border-0">Complete</Badge>}
                    </div>
                    <h3 className="text-sm font-semibold mt-0.5">{level.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{level.modules} modules</p>

                    {isActive && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress value={level.progress} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-mono text-muted-foreground">{level.progress}%</span>
                        </div>
                        <div className="space-y-1">
                          {ACTIVE_MODULES.map((m, mi) => (
                            <div
                              key={mi}
                              className="flex items-center gap-1.5 text-[10px] animate-fade-only"
                              style={{
                                animationDelay: `${200 + mi * 30}ms`,
                                animationFillMode: "backwards",
                              }}
                            >
                              <div className={`h-1.5 w-1.5 rounded-full ${m.done ? "bg-primary" : TYPE_DOT[m.type] || "bg-border"}`} />
                              <span className={m.done ? "text-muted-foreground line-through" : ""}>{m.title}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs mt-1 gap-1 animate-fade-only"
                          style={{ animationDelay: "350ms", animationFillMode: "backwards" }}
                        >
                          Continue <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );

            // Wrap non-locked levels with hotspot
            if (!isLocked) {
              return (
                <Hotspot key={level.id} to="/mockup/learn/level" label={`Level ${level.id}: ${level.title}`}>
                  {nodeContent}
                </Hotspot>
              );
            }

            return <div key={level.id}>{nodeContent}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
