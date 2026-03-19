import { ArrowLeft, BookOpen, FolderOpen, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonLauncher } from "@/components/studio/LessonLauncher";

interface StudioHeaderBarProps {
  studioMode: "guided" | "standard" | "focused";
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
  studioMode,
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
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-2 bg-card">
      <div className="flex items-center gap-3">
        <Package className="h-4 w-4 text-primary" />
        <span className="font-mono text-sm font-semibold text-foreground truncate max-w-[200px]">
          {sessionName}
        </span>
        <span className="rounded border border-border/50 bg-muted/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-foreground/60">
          {studioMode}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <LessonLauncher
          activeLessonId={activeLessonId}
          onStartLesson={onStartLesson}
        />
        {guideVisible && (
          <Button
            onClick={onToggleGuide}
            size="sm"
            variant={guideCollapsed ? "secondary" : "ghost"}
            className="font-mono text-xs gap-1.5 text-foreground/70 border border-border/50 hover:border-border hover:text-foreground"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {guideLabel}
          </Button>
        )}
        <Button onClick={onOpenSessions} size="sm" variant="ghost" className="font-mono text-xs gap-1.5 text-foreground/70 border border-border/50 hover:border-border hover:text-foreground">
          <FolderOpen className="h-3.5 w-3.5" /> Sessions
        </Button>
        <Button onClick={onOpenLab} size="sm" variant="ghost" className="font-mono text-xs gap-1.5 text-foreground/70 border border-border/50 hover:border-border hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Lab
        </Button>
        <Button onClick={onSignOut} size="sm" variant="ghost" className="font-mono text-xs text-foreground/70 border border-border/50 hover:border-border hover:text-foreground">
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}
