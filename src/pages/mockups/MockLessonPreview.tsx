import { useState } from "react";
import { ChevronLeft, Play, Square, SkipBack, Code2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MockPrototypeToolbar } from "@/components/mockups/MockPrototypeToolbar";
import { AnchorHighlight } from "@/components/mockups/AnchorHighlight";
import { LessonPreviewCoach } from "@/components/mockups/LessonPreviewCoach";
import { SAMPLE_LESSONS } from "@/data/sampleLesson";
import type { LessonDefinition } from "@/types/lessonDsl";

const TRACK_LANES = [
  { name: "Drums", color: "bg-orange-500", clips: [{ start: 0, width: 55 }, { start: 60, width: 35 }] },
  { name: "Bass", color: "bg-primary", clips: [{ start: 0, width: 40 }, { start: 50, width: 25 }] },
  { name: "Melody", color: "bg-accent", clips: [] },
  { name: "Pad", color: "bg-purple-500", clips: [{ start: 10, width: 50 }] },
];

export default function MockLessonPreview() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [showJson, setShowJson] = useState(false);

  const lesson: LessonDefinition = SAMPLE_LESSONS[lessonIndex];
  const activeAnchor = stepIndex < lesson.steps.length ? lesson.steps[stepIndex].anchor : null;

  const handleAdvance = () => setStepIndex((i) => Math.min(i + 1, lesson.steps.length));
  const handleReset = () => setStepIndex(0);
  const switchLesson = (val: string) => {
    setLessonIndex(Number(val));
    setStepIndex(0);
  };

  return (
    <div className="dawn-lagoon dawn-lagoon-bg min-h-screen text-foreground flex flex-col">
      {/* Top bar — lesson switcher */}
      <div className="h-10 border-b border-border flex items-center px-3 gap-3 bg-chrome/80 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.history.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="text-xs font-mono font-semibold">Lesson DSL Preview</span>
        <Separator orientation="vertical" className="h-4" />
        <Select value={String(lessonIndex)} onValueChange={switchLesson}>
          <SelectTrigger className="h-7 w-56 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SAMPLE_LESSONS.map((l, i) => (
              <SelectItem key={l.lessonId} value={String(i)} className="text-xs">
                {l.lessonId} — {l.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          variant={showJson ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setShowJson(!showJson)}
        >
          <Code2 className="h-3 w-3" /> DSL Source
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Studio mockup area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Transport */}
          <AnchorHighlight anchorId="studio.transport" activeAnchor={activeAnchor}>
            <header className="h-11 border-b border-border flex items-center px-3 gap-2 bg-chrome shrink-0">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7"><SkipBack className="h-3.5 w-3.5" /></Button>
                <Button size="icon" className="h-7 w-7 bg-primary text-primary-foreground"><Play className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Square className="h-3 w-3" /></Button>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="font-mono text-xs text-muted-foreground">120 BPM</span>
              <span className="font-mono text-xs text-muted-foreground">4/4</span>
              <div className="flex-1" />
              <span className="text-[10px] font-mono text-muted-foreground">1.1.1</span>
            </header>
          </AnchorHighlight>

          {/* Timeline ruler */}
          <AnchorHighlight anchorId="studio.timeline" activeAnchor={activeAnchor}>
            <div className="h-7 border-b border-border bg-chrome flex items-end px-2">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="flex-1 border-l border-border/40 px-1">
                  {i % 2 === 0 && <span className="text-[9px] font-mono text-muted-foreground">{i / 2 + 1}</span>}
                </div>
              ))}
            </div>
          </AnchorHighlight>

          {/* Track list */}
          <AnchorHighlight anchorId="studio.trackList" activeAnchor={activeAnchor} className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto pb-16">
              {TRACK_LANES.map((track, ti) => (
                <AnchorHighlight
                  key={track.name}
                  anchorId={`studio.trackHeader.${track.name}`}
                  activeAnchor={activeAnchor}
                >
                  <div
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
                          <span className="text-[10px] text-muted-foreground/40 font-mono">empty</span>
                        </div>
                      )}
                    </div>
                  </div>
                </AnchorHighlight>
              ))}
            </div>
          </AnchorHighlight>

          {/* Piano roll area */}
          <AnchorHighlight anchorId="studio.pianoRoll" activeAnchor={activeAnchor}>
            <div className="h-32 border-t border-border bg-chrome/30 flex">
              <div className="w-36 shrink-0 border-r border-border flex flex-col justify-center items-center">
                <span className="text-[10px] font-mono text-muted-foreground">Piano Roll</span>
              </div>
              <div className="flex-1 relative">
                {/* Grid lines */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-b border-border/20"
                    style={{ top: `${(i / 12) * 100}%` }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground/30 font-mono">Double-click a clip to edit</span>
                </div>
              </div>
            </div>
          </AnchorHighlight>
        </div>

        {/* JSON viewer (toggleable) */}
        {showJson && (
          <div className="w-80 border-l border-border bg-background shrink-0 flex flex-col">
            <div className="p-3 border-b border-border">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">DSL Source (JSON)</span>
            </div>
            <ScrollArea className="flex-1">
              <pre className="p-3 text-[10px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(lesson, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        )}

        {/* Coach panel */}
        <LessonPreviewCoach
          lesson={lesson}
          currentStepIndex={stepIndex}
          onAdvance={handleAdvance}
          onReset={handleReset}
        />
      </div>

      <MockPrototypeToolbar />
    </div>
  );
}
