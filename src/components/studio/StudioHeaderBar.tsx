import { ArrowLeft, BookOpen, FolderOpen, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonLauncher } from "@/components/studio/LessonLauncher";
import { cn } from "@/lib/utils";

interface StudioHeaderBarProps {
  sessionName: string;
  activeLessonId: string | null;
  guideVisible: boolean;
  guideCollapsed: boolean;
  guideLabel: string;
  onStartLesson: (lessonId: string) => void;
  onToggleGuide: () => void;
  onOpenSessions: () => void;
  onOpenLab: () => void;
  onSignOut: () => void;
}

export function StudioHeaderBar({
  sessionName,
  activeLessonId,
  guideVisible,
  guideCollapsed,
  guideLabel,
  onStartLesson,
  onToggleGuide,
  onOpenSessions,
  onOpenLab,
  onSignOut,
}: StudioHeaderBarProps) {
  const lessonActive = Boolean(activeLessonId);

  return (
    <header className="border-b border-border/70 bg-background/70 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
            lessonActive
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border/70 bg-card text-foreground/70",
          )}>
            <Package className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-mono text-sm font-semibold text-foreground">
                {sessionName}
              </span>
              <span className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
                lessonActive
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/70 bg-card text-foreground/45",
              )}>
                {lessonActive ? "Guided Session" : "Studio"}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-foreground/55">
              {lessonActive
                ? "Follow the active step and keep your attention on the highlighted workspace."
                : "Balanced production workspace with lesson support available on demand."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <LessonLauncher
            activeLessonId={activeLessonId}
            onStartLesson={onStartLesson}
          />
          {guideVisible && (
            <Button
              onClick={onToggleGuide}
              size="sm"
              variant={guideCollapsed ? "secondary" : "ghost"}
              className={cn(
                "gap-1.5 border font-mono text-xs",
                guideCollapsed
                  ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                  : "border-border/60 bg-card/70 text-foreground/70 hover:border-border hover:text-foreground",
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {guideLabel}
            </Button>
          )}
          <Button onClick={onOpenSessions} size="sm" variant="ghost" className="gap-1.5 border border-border/60 bg-card/60 font-mono text-xs text-foreground/70 hover:border-border hover:text-foreground">
            <FolderOpen className="h-3.5 w-3.5" /> Sessions
          </Button>
          <Button onClick={onOpenLab} size="sm" variant="ghost" className="gap-1.5 border border-border/60 bg-card/60 font-mono text-xs text-foreground/70 hover:border-border hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Lab
          </Button>
          <Button onClick={onSignOut} size="sm" variant="ghost" className="border border-border/60 bg-card/60 font-mono text-xs text-foreground/70 hover:border-border hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
