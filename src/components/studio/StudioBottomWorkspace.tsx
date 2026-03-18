import { MixerPanel } from "@/components/studio/MixerPanel";
import { PianoRoll } from "@/components/studio/PianoRoll";
import { DetailPanel } from "@/components/studio/DetailPanel";
import { StudioBottomTabButtons } from "@/components/studio/StudioBottomTabButtons";

interface StudioBottomWorkspaceProps {
  mode: "guided" | "standard" | "focused";
  showTabs: boolean;
  bottomTab: "mixer" | "detail";
  setBottomTab: (tab: "mixer" | "detail") => void;
  showPianoRoll: boolean;
  showMixer: boolean;
  showDetail: boolean;
  selectedTrackId: string | null;
  emptyInstruction?: string;
  mixerEmptyInstruction?: string;
  mixerPanelProps: React.ComponentProps<typeof MixerPanel>;
  pianoRollProps?: React.ComponentProps<typeof PianoRoll> | null;
  detailPanelProps: React.ComponentProps<typeof DetailPanel>;
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
}: StudioBottomWorkspaceProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-t border-border bg-card/40" data-studio-mode={mode}>
      {showTabs ? (
        <div className="shrink-0 flex items-center border-b border-border bg-card/80">
          <StudioBottomTabButtons
            bottomTab={bottomTab}
            setBottomTab={setBottomTab}
            showPianoRoll={showPianoRoll}
          />
        </div>
      ) : null}

      <div className="flex-1 min-h-0 overflow-hidden">
        {showMixer ? (
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
            <MixerPanel {...mixerPanelProps} />
          )
        ) : showPianoRoll && pianoRollProps ? (
          <PianoRoll {...pianoRollProps} />
        ) : showDetail && selectedTrackId ? (
          <DetailPanel {...detailPanelProps} />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[11px] text-foreground/45">
            {emptyInstruction ?? "Select a track, MIDI clip, or open the mixer."}
          </div>
        )}
      </div>
    </div>
  );
}
