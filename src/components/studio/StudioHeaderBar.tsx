import { ArrowLeft, BookOpen, Copy, Eye, FolderOpen, Home, LogOut, Package, Plus, Settings, Share2, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonLauncher } from "@/components/studio/LessonLauncher";
import { cn } from "@/lib/utils";

interface StudioHeaderBarProps {
  studioMode: "guided" | "standard" | "focused";
  sessionName: string;
  activeLessonId: string | null;
  captureVariant?: "figma" | null;
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
  captureVariant,
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
  const modeLabel = studioMode === "guided" ? "Guided" : studioMode === "standard" ? "Standard" : "Focused";
  const topTabs = captureVariant === "figma"
    ? [
        { label: "MusicHub", icon: Home, active: false },
        { label: "Untitled", icon: Package, active: false },
        { label: "MusicHub", icon: Sparkles, active: true },
      ]
    : [
        { label: "MusicHub", icon: Home, active: false },
        { label: "MusicHub", icon: Sparkles, active: true },
        { label: sessionName, icon: Package, active: false },
      ];

  return (
    <header
      className={cn(
        "border-b border-[color:var(--transport-border-strong)] bg-[var(--surface-0)]",
        studioMode === "focused" ? "" : "",
      )}
    >
      <div className="flex items-center justify-between border-b border-white/8 bg-[#525b63] px-3 py-0.5">
        <div className="flex min-w-0 items-center gap-px overflow-hidden">
          {topTabs.map(({ label, icon: Icon, active }, index) => (
            <button
              key={`${label}-${index}`}
              className={cn(
                "flex h-10 min-w-[150px] items-center gap-2 border-r border-white/10 px-4 text-sm transition-colors",
                active ? "bg-[#2f3135] text-white" : "bg-[#4a535b] text-white/75 hover:bg-[#465059]",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
          <button className="flex h-10 w-10 items-center justify-center text-white/65 transition-colors hover:bg-[#465059] hover:text-white">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button className="flex h-10 w-10 items-center justify-center text-white/65 transition-colors hover:bg-[#465059] hover:text-white">
          <Square className="h-4 w-4" />
        </button>
      </div>

      {captureVariant === "figma" ? (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-[#2f2c2c] px-5 py-2.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/15 text-white/75">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-[15px] font-semibold">MusicHub</div>
            <Button size="sm" variant="ghost" className="h-8 w-8 rounded-md border border-white/10 bg-white/4 p-0 text-white/74 hover:bg-white/8 hover:text-white">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="min-w-0 text-center">
            <div className="text-[14px] font-semibold tracking-tight text-white">MusicHub</div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff2ca0] text-[13px] font-semibold text-white">P</div>
            <Button size="sm" variant="ghost" className="h-8 w-8 rounded-md border border-white/10 bg-white/4 p-0 text-white/74 hover:bg-white/8 hover:text-white">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 rounded-md border border-white/10 bg-white/4 p-0 text-white/74 hover:bg-white/8 hover:text-white">
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 rounded-md border border-white/10 bg-white/4 p-0 text-white/74 hover:bg-white/8 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 rounded-md border border-white/10 bg-white/4 px-3 text-xs text-white/86 hover:bg-white/8 hover:text-white">
              Publish
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 rounded-md bg-[#4a39f4] px-3 text-xs text-white hover:bg-[#5647f7]">
              Share
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 bg-[#2f2c2c] px-5 py-2.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/15 text-white/75">
              <Sparkles className="h-4 w-4" />
            </div>
            <LessonLauncher activeLessonId={activeLessonId} onStartLesson={onStartLesson} />
            {guideVisible ? (
              <Button
                onClick={onToggleGuide}
                size="sm"
                variant="ghost"
                className={cn(
                  "h-8 gap-1.5 rounded-md border px-3 text-xs font-medium",
                  guideCollapsed
                    ? "border-primary/40 bg-primary/12 text-primary hover:bg-primary/18"
                    : "border-white/10 bg-white/5 text-white/72 hover:bg-white/8 hover:text-white",
                )}
              >
                <BookOpen className="h-3.5 w-3.5" />
                {guideLabel}
              </Button>
            ) : null}
          </div>

          <div className="min-w-0 text-center">
            <div className="text-[13px] font-semibold tracking-tight text-white">{sessionName}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.24em] text-white/45">
              {lessonActive ? "Lesson Session" : "Studio"} · {modeLabel}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              onClick={onOpenSessions}
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 rounded-md border border-white/10 bg-white/4 px-3 text-xs text-white/74 hover:bg-white/8 hover:text-white"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Sessions
            </Button>
            <Button
              onClick={onOpenLab}
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 rounded-md border border-white/10 bg-white/4 px-3 text-xs text-white/74 hover:bg-white/8 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Lab
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 rounded-md border border-white/10 bg-white/4 px-3 text-xs text-white/74 hover:bg-white/8 hover:text-white"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button
              onClick={onSignOut}
              size="sm"
              variant="ghost"
              className="h-8 w-8 rounded-md border border-white/10 bg-white/4 p-0 text-white/74 hover:bg-white/8 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
