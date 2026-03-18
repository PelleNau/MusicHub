import { useStudioInfo, STUDIO_INFO } from "@/components/studio/StudioInfoContext";

interface StudioBottomTabButtonsProps {
  bottomTab: "editor" | "mixer";
  setBottomTab: (tab: "editor" | "mixer") => void;
  showPianoRoll: boolean;
}

export function StudioBottomTabButtons({
  bottomTab,
  setBottomTab,
  showPianoRoll,
}: StudioBottomTabButtonsProps) {
  const { setHoveredInfo } = useStudioInfo();
  const editorInfo = showPianoRoll ? STUDIO_INFO.tabEditorPiano : STUDIO_INFO.tabEditorDetail;

  return (
    <div className="flex items-center gap-1 px-2">
      <button
        onClick={() => setBottomTab("editor")}
        onMouseEnter={() => setHoveredInfo(editorInfo)}
        onMouseLeave={() => setHoveredInfo(null)}
        className={`h-6 px-2.5 rounded-[3px] text-[9px] font-mono font-medium transition-colors border ${
          bottomTab === "editor"
            ? "bg-primary/15 text-primary border-primary/40"
            : "text-foreground/60 border-border/60 hover:text-foreground/80 hover:bg-foreground/5 hover:border-border"
        }`}
      >
        {showPianoRoll ? "Piano Roll" : "Detail"}
      </button>
      <button
        onClick={() => setBottomTab("mixer")}
        onMouseEnter={() => setHoveredInfo(STUDIO_INFO.tabMixer)}
        onMouseLeave={() => setHoveredInfo(null)}
        className={`h-6 px-2.5 rounded-[3px] text-[9px] font-mono font-medium transition-colors border ${
          bottomTab === "mixer"
            ? "bg-primary/15 text-primary border-primary/40"
            : "text-foreground/60 border-border/60 hover:text-foreground/80 hover:bg-foreground/5 hover:border-border"
        }`}
      >
        Mixer <span className="text-foreground/40 ml-0.5">⌘M</span>
      </button>
    </div>
  );
}
