import { useCallback, useState, useRef } from "react";
import { SoundExplorerWidget } from "./SoundExplorerWidget";
import { PitchScrubWidget } from "./PitchScrubWidget";
import { DualVolumeBalance } from "./DualVolumeBalance";
import { WaveformSelectorWidget } from "./WaveformSelectorWidget";
import { TimbrePresetPlayer } from "./TimbrePresetPlayer";
import { DescriptorTagger } from "./DescriptorTagger";
import { StudioTourOverlay } from "./StudioTourOverlay";
import { SoundShapingChallenge } from "./SoundShapingChallenge";
import { MiniTimeline } from "./MiniTimeline";
import type { LessonInteractive } from "@/data/module1Content";

interface LessonRendererProps {
  interactive: LessonInteractive;
  onRequirementMet: (label: string) => void;
  requirements: Record<string, string>;
}

/**
 * Routes lesson interactive type to the correct widget component.
 * Bridges requirement labels to widget callbacks.
 */
export function LessonRenderer({ interactive, onRequirementMet, requirements }: LessonRendererProps) {
  const reqLabels = Object.values(requirements);

  switch (interactive) {
    case "soundExplorer":
      return (
        <SoundExplorerWidget
          onInteraction={({ pitch, loudness }) => {
            if (pitch) onRequirementMet(reqLabels[0] ?? "");
            if (loudness) onRequirementMet(reqLabels[1] ?? "");
          }}
        />
      );

    case "pitchScrub":
      return (
        <PitchScrubWidget
          onPitchChange={() => onRequirementMet(reqLabels[0] ?? "")}
        />
      );

    case "dualBalance":
      return (
        <DualVolumeBalance
          onBalanced={() => onRequirementMet(reqLabels[0] ?? "")}
        />
      );

    case "waveformSelector":
      return (
        <WaveformSelectorWidget
          onExplored={(explored) => {
            if (explored.size >= 4) onRequirementMet(reqLabels[0] ?? "");
          }}
        />
      );

    case "timbrePresets":
      return (
        <TimbrePresetsComposite
          onListenMet={() => onRequirementMet(reqLabels[0] ?? "")}
          onTagMet={() => onRequirementMet(reqLabels[1] ?? "")}
        />
      );

    case "studioTour":
      return (
        <StudioTourOverlay
          onComplete={() => onRequirementMet(reqLabels[0] ?? "")}
        />
      );

    case "soundShaping":
      return (
        <SoundShapingChallenge
          onComplete={() => onRequirementMet(reqLabels[0] ?? "")}
        />
      );

    case "capstone":
      return (
        <MiniTimeline
          onComplete={() => {
            reqLabels.forEach((l) => onRequirementMet(l));
          }}
        />
      );

    default:
      return null;
  }
}

/** Composite for lesson 1.5: TimbrePresetPlayer + DescriptorTagger */
function TimbrePresetsComposite({
  onListenMet,
  onTagMet,
}: {
  onListenMet: () => void;
  onTagMet: () => void;
}) {
  const [playedCount, setPlayedCount] = useState(0);
  const [lastPlayed, setLastPlayed] = useState<string>("");
  const heardRef = useRef(new Set<string>());

  return (
    <div className="space-y-4">
      <TimbrePresetPlayer
        onPresetPlayed={(id) => {
          heardRef.current.add(id);
          setPlayedCount(heardRef.current.size);
          setLastPlayed(id);
          if (heardRef.current.size >= 3) onListenMet();
        }}
      />
      <DescriptorTagger
        presetLabel={lastPlayed || undefined}
        minTags={2}
        onTagsChanged={(tags) => {
          if (tags.length >= 2) onTagMet();
        }}
      />
    </div>
  );
}
