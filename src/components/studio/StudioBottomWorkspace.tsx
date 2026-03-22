import { MixerPanel } from "@/components/studio/MixerPanel";
import { PianoRoll } from "@/components/studio/PianoRoll";
import { DetailPanel } from "@/components/studio/DetailPanel";
import { StudioBottomTabButtons } from "@/components/studio/StudioBottomTabButtons";
import { cn } from "@/lib/utils";

interface StudioBottomWorkspaceProps {
  mode: "guided" | "standard" | "focused";
  showTabs: boolean;
  bottomTab: "editor" | "mixer";
  setBottomTab: (tab: "editor" | "mixer") => void;
  showPianoRoll: boolean;
  showMixer: boolean;
  showDetail: boolean;
  selectedTrackId: string | null;
  emptyInstruction?: string;
  mixerEmptyInstruction?: string;
  mixerPanelProps: React.ComponentProps<typeof MixerPanel>;
  pianoRollProps?: React.ComponentProps<typeof PianoRoll> | null;
  detailPanelProps: React.ComponentProps<typeof DetailPanel>;
  collapsedSummaryLabel?: string;
  collapsedSummaryMeta?: string;
  overlay?: React.ReactNode;
  captureVariant?: "figma" | "figma-compact" | "figma-mixer" | null;
}

export function StudioBottomWorkspace({
  mode,
  showTabs,
  bottomTab,
  setBottomTab,
  showPianoRoll,
  showMixer,
  showDetail,
  selectedTrackId,
  emptyInstruction,
  mixerEmptyInstruction,
  mixerPanelProps,
  pianoRollProps,
  detailPanelProps,
  collapsedSummaryLabel,
  collapsedSummaryMeta,
  overlay,
  captureVariant = null,
}: StudioBottomWorkspaceProps) {
  const emptyLabel =
    mode === "focused"
      ? "Open mixer, detail, or piano roll to keep editing."
      : emptyInstruction ?? "Select a track, MIDI clip, or open the mixer.";

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden border-t border-border",
        mode === "focused" ? "bg-card/60" : "bg-card/40",
      )}
      data-studio-mode={mode}
    >
      {showTabs ? (
        <div
          className={cn(
            "shrink-0 flex items-center border-b border-border",
            mode === "focused" ? "bg-card/65 backdrop-blur-sm" : "bg-card/80",
          )}
        >
          <StudioBottomTabButtons
            bottomTab={bottomTab}
            setBottomTab={setBottomTab}
            showPianoRoll={showPianoRoll}
          />
        </div>
      ) : null}

      <div className="flex-1 min-h-0 overflow-hidden">
        {collapsedSummaryLabel ? (
          <div className="flex h-full items-center justify-between border-t border-white/6 bg-[#25272d] px-2 text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),inset_0_-1px_0_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] leading-none text-white/40">⌄</span>
              <span className="text-[9px] font-medium tracking-[0.01em] text-white/78">{collapsedSummaryLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              {collapsedSummaryMeta ? <span className="text-[8px] text-white/34">{collapsedSummaryMeta}</span> : null}
              <span className="text-[9px] leading-none text-white/34">⌃</span>
            </div>
          </div>
        ) : showMixer ? (
          mixerPanelProps.tracks.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-1">
                {mixerEmptyInstruction ? (
                  <>
                    <p className="text-sm text-foreground/70">{mixerEmptyInstruction}</p>
                    <p className="text-xs text-muted-foreground">Follow the guide to get started</p>
                  </>
                ) : (
                  <p className="font-mono text-[11px] text-foreground/45">Add tracks to see them in the mixer</p>
                )}
              </div>
            </div>
          ) : (
            <MixerPanel {...mixerPanelProps} captureVariant={captureVariant === "figma-mixer" ? "figma" : null} />
          )
        ) : showPianoRoll && pianoRollProps ? (
          <PianoRoll {...pianoRollProps} captureVariant={captureVariant} />
        ) : showDetail && selectedTrackId ? (
          <DetailPanel {...detailPanelProps} />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[11px] text-foreground/45">
            {emptyLabel}
          </div>
        )}
      </div>
      {overlay ? <div className="pointer-events-none absolute inset-0">{overlay}</div> : null}
    </div>
  );
}
