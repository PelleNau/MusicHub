import { useState } from "react";

import { FadeCurveMenu, type FadeCurveType } from "@/components/studio/FadeCurveMenu";
import { BridgeConnectionCard } from "@/components/bridge/BridgeConnectionCard";
import { ExportFormatCard } from "@/components/bridge/ExportFormatCard";
import { ImportSourceCard } from "@/components/bridge/ImportSourceCard";
import { SyncStatusCard } from "@/components/bridge/SyncStatusCard";
import { BPMDetector } from "@/components/analysis/BPMDetector";
import { KeyDetector } from "@/components/analysis/KeyDetector";
import { LoudnessAnalyzer } from "@/components/analysis/LoudnessAnalyzer";
import { PitchAnalyzer } from "@/components/analysis/PitchAnalyzer";
import { SpectrumAnalyzer } from "@/components/analysis/SpectrumAnalyzer";
import { WaveformAnalyzer } from "@/components/analysis/WaveformAnalyzer";
import { ArpeggiatorDialog } from "@/components/studio/ArpeggiatorDialog";
import { ChordToolsDialog } from "@/components/studio/ChordToolsDialog";
import { ContextualHelpBubble } from "@/components/studio/ContextualHelpBubble";
import { DeviceSlot } from "@/components/studio/DeviceSlot";
import { HumanizeDialog } from "@/components/studio/HumanizeDialog";
import { KeySelector } from "@/components/studio/KeySelector";
import { KeyboardShortcutHint } from "@/components/studio/KeyboardShortcutHint";
import { LengthOperationsMenu } from "@/components/studio/LengthOperationsMenu";
import { MarkerList } from "@/components/studio/MarkerList";
import { NoteOperationsMenu } from "@/components/studio/NoteOperationsMenu";
import { QuantizeDialog } from "@/components/studio/QuantizeDialog";
import { RotaryKnob } from "@/components/studio/RotaryKnob";
import { SelectionToolsMenu } from "@/components/studio/SelectionToolsMenu";
import { TrackContextMenu } from "@/components/studio/TrackContextMenu";
import { TimelineMarker } from "@/components/studio/TimelineMarker";
import { TransposeDialog } from "@/components/studio/TransposeDialog";
import { StrummingDialog } from "@/components/studio/StrummingDialog";
import { TransportButton, TransportControls } from "@/components/studio/TransportButton";
import { VelocityOperationsMenu } from "@/components/studio/VelocityOperationsMenu";
import { VelocityLane } from "@/components/studio/VelocityLane";
import { Waveform } from "@/components/studio/Waveform";
import { ZoomControl } from "@/components/studio/ZoomControl";
import { DeviceView } from "@/components/studio/DeviceView";
import { LessonPanel } from "@/components/studio/LessonPanel";
import { PianoRollToolbar } from "@/components/studio/PianoRollToolbar";
import { SendRoutingMenu } from "@/components/studio/SendRoutingMenu";
import { TrackColorPicker } from "@/components/studio/TrackColorPicker";
import { TrackIconPicker, type TrackIcon } from "@/components/studio/TrackIconPicker";
import { GenreTemplateSection } from "@/components/studio/templates/GenreTemplateSection";
import { TemplateCard } from "@/components/studio/templates/TemplateCard";
import { TemplateGrid } from "@/components/studio/templates/TemplateGrid";
import { TemplatePreviewModal } from "@/components/studio/templates/TemplatePreviewModal";
import { MetronomeTool } from "@/components/theory/MetronomeTool";
import { TempoTapTool } from "@/components/theory/TempoTapTool";
import { TunerTool } from "@/components/theory/TunerTool";
import { FigmaLessonHeader } from "@/components/studio/imported/FigmaLessonHeader";
import { FigmaLessonProgressRail } from "@/components/studio/imported/FigmaLessonProgressRail";
import { FigmaLessonStepCard } from "@/components/studio/imported/FigmaLessonStepCard";
import { FigmaAutomationLane } from "@/components/studio/imported/FigmaAutomationLane";
import { FigmaClipBlock } from "@/components/studio/imported/FigmaClipBlock";
import { FigmaClipContextMenu } from "@/components/studio/imported/FigmaClipContextMenu";
import { FigmaClipMidiPreview } from "@/components/studio/imported/FigmaClipMidiPreview";
import { FigmaClipWaveform } from "@/components/studio/imported/FigmaClipWaveform";
import { FigmaFader } from "@/components/studio/imported/FigmaFader";
import { FigmaKnob } from "@/components/studio/imported/FigmaKnob";
import { FigmaMeter, FigmaStereoMeter, FigmaCorrelationMeter } from "@/components/studio/imported/FigmaMeter";
import { FigmaPianoRollKeyboard } from "@/components/studio/imported/FigmaPianoRollKeyboard";
import { FigmaPianoRollVelocityLane } from "@/components/studio/imported/FigmaPianoRollVelocityLane";
import { FigmaTrackControls } from "@/components/studio/imported/FigmaTrackControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";
import type { StudioMarker } from "@/types/musicHubStudioMarkers";

function PianoRollPreviewSurface() {
  const bars = Array.from({ length: 8 }, (_, index) => index + 1);
  const noteRows = ["C8", "C7", "C6", "C5", "C4", "C3", "C2", "C1"];
  const notes = [
    { left: "15%", top: "63%", width: "6%", label: "C5" },
    { left: "27%", top: "60%", width: "5%", label: "D5" },
    { left: "27%", top: "67%", width: "5%", label: "B4" },
    { left: "39%", top: "63%", width: "6%", label: "C5" },
    { left: "51%", top: "56%", width: "3%", label: "E5" },
    { left: "54%", top: "60%", width: "3%", label: "D5" },
    { left: "57%", top: "63%", width: "3%", label: "C5" },
    { left: "60%", top: "64.5%", width: "2.5%", label: "B4" },
    { left: "62.5%", top: "63%", width: "7%", label: "C5" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)]">
      <PianoRollToolbar
        clipName="Piano Melody"
        snapEnabled
        snapDivision="1/4"
        onToggleSnap={() => {}}
        onZoomOut={() => {}}
        onZoomIn={() => {}}
        onFit={() => {}}
        onClose={() => {}}
      />
      <div className="border-b border-[hsl(240_8%_24%)] bg-[hsl(240_10%_14%)] px-3 py-2 text-[12px] text-white/88">
        <span className="font-medium">Piano Roll</span>
        <span className="mx-2 text-white/34">•</span>
        <span className="text-white/52">Piano Melody</span>
      </div>
      <div className="relative h-[520px] overflow-hidden bg-[hsl(240_10%_9%)]">
        <div className="absolute inset-y-0 left-0 w-16 border-r border-[hsl(240_8%_24%)] bg-[hsl(240_10%_11%)]">
          {noteRows.map((note, index) => (
            <div
              key={note}
              className="flex h-[65px] items-start border-b border-[hsl(220_25%_22%)] px-2 pt-1 text-[11px] text-[hsl(216_70%_60%)]"
              style={{ opacity: 1 - index * 0.08 }}
            >
              {note}
            </div>
          ))}
        </div>
        <div className="ml-16">
          <div className="grid h-10 grid-cols-8 border-b border-[hsl(240_8%_24%)] bg-[hsl(240_10%_14%)]">
            {bars.map((bar) => (
              <div key={bar} className="border-r border-[hsl(240_8%_24%)] px-2 pt-1 text-[13px] font-semibold text-white/92">
                {bar}
              </div>
            ))}
          </div>
          <div className="relative h-[400px] bg-[repeating-linear-gradient(to_bottom,hsl(240_10%_9%),hsl(240_10%_9%)_18px,hsl(240_10%_12%)_18px,hsl(240_10%_12%)_36px)]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,transparent,transparent_calc(12.5%_-_1px),hsl(240_8%_24%)_calc(12.5%_-_1px),hsl(240_8%_24%)_12.5%)]" />
            {notes.map((note) => (
              <div
                key={`${note.left}-${note.top}`}
                className="absolute rounded-[2px] border border-[hsl(210_75%_62%)] bg-[hsl(212_65%_54%)] px-1 text-[11px] leading-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                style={{ left: note.left, top: note.top, width: note.width, height: "22px" }}
              >
                {note.label}
              </div>
            ))}
          </div>
          <div className="h-[70px] border-t border-[hsl(240_8%_24%)] bg-[hsl(240_10%_14%)] px-2 pt-3">
            <div className="relative h-10">
              {bars.map((bar, index) => (
                <div
                  key={bar}
                  className="absolute bottom-0 rounded-t-[2px] bg-[hsl(212_65%_54%)]"
                  style={{
                    left: `${index * 12.5 + 1}%`,
                    width: `${index === 4 ? 22 : 7}%`,
                    height: `${index >= 4 ? 34 : 28}px`,
                    opacity: index >= 4 ? 0.6 : 0.95,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImportedPianoRollSurface() {
  const velocityNotes = [
    { id: "n1", start: 0.2, velocity: 72 },
    { id: "n2", start: 1.1, velocity: 88 },
    { id: "n3", start: 2.15, velocity: 64 },
    { id: "n4", start: 3.05, velocity: 101 },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)]">
      <div className="flex h-[320px] overflow-hidden">
        <FigmaPianoRollKeyboard
          minNote={48}
          maxNote={72}
          highlightedNotes={[60, 64, 67]}
          playingNotes={[60]}
          noteHeight={12}
          className="w-[88px] shrink-0"
        />
        <div className="flex-1 bg-[hsl(240_10%_9%)]">
          <div className="grid h-9 grid-cols-4 border-b border-[hsl(240_8%_24%)] bg-[hsl(240_10%_14%)] px-2 text-xs text-white/80">
            {["1", "2", "3", "4"].map((bar) => (
              <div key={bar} className="border-r border-[hsl(240_8%_24%)] pt-2 last:border-r-0">
                {bar}
              </div>
            ))}
          </div>
          <div className="relative h-[220px] bg-[repeating-linear-gradient(to_bottom,hsl(240_10%_9%),hsl(240_10%_9%)_12px,hsl(240_10%_12%)_12px,hsl(240_10%_12%)_24px)]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,transparent,transparent_calc(25%_-_1px),hsl(240_8%_24%)_calc(25%_-_1px),hsl(240_8%_24%)_25%)]" />
            {[
              { left: "8%", top: "74%", width: "7%", label: "C4" },
              { left: "28%", top: "67%", width: "6%", label: "E4" },
              { left: "33%", top: "60%", width: "6%", label: "G4" },
              { left: "53%", top: "56%", width: "6%", label: "A4" },
            ].map((note) => (
              <div
                key={`${note.left}-${note.top}`}
                className="absolute rounded-[2px] border border-[hsl(210_75%_62%)] bg-[hsl(212_65%_54%)] px-1 text-[11px] leading-5 text-white"
                style={{ left: note.left, top: note.top, width: note.width, height: "22px" }}
              >
                {note.label}
              </div>
            ))}
          </div>
          <FigmaPianoRollVelocityLane
            notes={velocityNotes}
            selectedNotes={["n2"]}
            totalBeats={4}
            pixelsPerBeat={124}
            height={52}
          />
        </div>
      </div>
    </div>
  );
}

function ImportedLessonSurface() {
  const progressSteps = [
    { id: "1", label: "Create track", completed: true },
    { id: "2", label: "Arm input", completed: false },
    { id: "3", label: "Record phrase", completed: false },
    { id: "4", label: "Review clip", completed: false },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)]">
      <FigmaLessonHeader
        title="Creating Your First Track"
        subtitle="Course 2 · Module 11"
        progress={25}
        onBack={() => {}}
        onNext={() => {}}
        onClose={() => {}}
      />
      <div className="space-y-5 p-6">
        <FigmaLessonProgressRail steps={progressSteps} currentStep={1} />
        <FigmaLessonStepCard
          title="Arm the track for recording"
          description="Enable record arm on the new audio track so it can capture incoming audio."
          stepNumber={2}
          totalSteps={4}
          actionLabel="Continue"
          onAction={() => {}}
        />
      </div>
    </div>
  );
}

export default function ImportedComponentsShowcase() {
  const [fadeCurve, setFadeCurve] = useState<FadeCurveType>("linear");
  const [humanizeOpen, setHumanizeOpen] = useState(false);
  const [quantizeOpen, setQuantizeOpen] = useState(false);
  const [transposeOpen, setTransposeOpen] = useState(false);
  const [arpeggiatorOpen, setArpeggiatorOpen] = useState(false);
  const [chordToolsOpen, setChordToolsOpen] = useState(false);
  const [sendRoutingOpen, setSendRoutingOpen] = useState(false);
  const [trackMenuOpen, setTrackMenuOpen] = useState(false);
  const [strummingOpen, setStrummingOpen] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isRecordingPreview, setIsRecordingPreview] = useState(false);
  const [isLoopingPreview, setIsLoopingPreview] = useState(false);
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false);
  const [keyRoot, setKeyRoot] = useState(0);
  const [keyScale, setKeyScale] = useState("major");
  const [tempoTapValue, setTempoTapValue] = useState(124);
  const [metronomeTempo, setMetronomeTempo] = useState(120);
  const [metronomePlaying, setMetronomePlaying] = useState(false);
  const [previewNotes, setPreviewNotes] = useState<MidiNote[]>([
    { id: "n1", pitch: 60, start: 0.5, duration: 0.5, velocity: 72 },
    { id: "n2", pitch: 64, start: 1.5, duration: 0.5, velocity: 88 },
    { id: "n3", pitch: 67, start: 2.5, duration: 0.5, velocity: 64 },
    { id: "n4", pitch: 69, start: 3.5, duration: 0.5, velocity: 96 },
  ]);
  const [chordPreviewNotes, setChordPreviewNotes] = useState<MidiNote[]>([
    { id: "c1", pitch: 60, start: 0, duration: 1, velocity: 84 },
    { id: "c2", pitch: 64, start: 0, duration: 1, velocity: 84 },
    { id: "c3", pitch: 67, start: 0, duration: 1, velocity: 84 },
    { id: "c4", pitch: 62, start: 2, duration: 1, velocity: 78 },
    { id: "c5", pitch: 65, start: 2, duration: 1, velocity: 78 },
    { id: "c6", pitch: 69, start: 2, duration: 1, velocity: 78 },
  ]);
  const [sendTarget, setSendTarget] = useState<string | undefined>("return-reverb");
  const [trackColor, setTrackColor] = useState("#4a9eff");
  const [trackIcon, setTrackIcon] = useState<TrackIcon>("mic");
  const [zoomLevel, setZoomLevel] = useState(75);
  const [knobValue, setKnobValue] = useState(0.62);
  const [sendKnobValue, setSendKnobValue] = useState(0.34);
  const [driveKnobValue, setDriveKnobValue] = useState(0.8);
  const [figmaKnobValue, setFigmaKnobValue] = useState(0.62);
  const [figmaPanValue, setFigmaPanValue] = useState(0.5);
  const [figmaFaderValue, setFigmaFaderValue] = useState(0.72);
  const [previewMarkers, setPreviewMarkers] = useState<StudioMarker[]>([
    { id: "m1", name: "Verse 1", beat: 2.5, color: "#ff6b6b" },
    { id: "m2", name: "Chorus", beat: 9, color: "#4ecdc4" },
  ]);
  const [deviceSlotEnabled, setDeviceSlotEnabled] = useState(true);
  const [clipMenuOpen, setClipMenuOpen] = useState(false);

  const returnTracks = [
    { id: "return-reverb", name: "Return - Reverb", color: "#4f8cff" },
    { id: "return-delay", name: "Return - Delay", color: "#8b5cf6" },
  ];
  const deviceTrack = {
    id: "track-piano",
    name: "Piano Melody",
    type: "midi" as const,
    color: "#4ecdc4",
    devices: [
      { id: "device-instrument", name: "E-Piano", type: "instrument", enabled: true },
      { id: "device-chorus", name: "Chorus", type: "audio fx", enabled: true },
      { id: "device-eq", name: "EQ Eight", type: "audio fx", enabled: false },
      { id: "device-compressor", name: "Compressor", type: "audio fx", enabled: true },
    ],
  };
  const lesson = {
    title: "Creating Your First Track",
    currentStep: 1,
    steps: [
      {
        id: "add-track",
        title: "Add an audio track",
        description: "Click the + button in the arrangement view to create your first audio track.",
        completed: true,
        action: "click",
      },
      {
        id: "arm-track",
        title: "Arm the track for recording",
        description: "Enable record arm on the new audio track so it can capture incoming audio.",
        action: "toggle",
      },
      {
        id: "start-recording",
        title: "Start recording",
        description: "Press record and capture a short phrase in the empty section of the arrangement.",
      },
      {
        id: "stop-review",
        title: "Stop and review",
        description: "Stop transport playback and review the newly recorded clip in the arrangement view.",
      },
    ],
  };
  const waveformData = {
    channels: 2 as const,
    peaks: Array.from({ length: 240 }, (_, index) => Math.abs(Math.sin(index / 12)) * (0.25 + (index % 7) / 10)),
    peaksRight: Array.from({ length: 240 }, (_, index) => Math.abs(Math.cos(index / 11)) * (0.22 + (index % 5) / 10)),
  };
  const automationPoints = [
    { time: 0, value: 42 },
    { time: 3.5, value: 65 },
    { time: 6.5, value: 50 },
    { time: 10, value: 61 },
    { time: 14, value: 39 },
  ];
  const velocityLaneNotes: MidiNote[] = [
    { id: "v1", pitch: 60, start: 0.25, duration: 0.5, velocity: 72 },
    { id: "v2", pitch: 64, start: 1.25, duration: 0.5, velocity: 88 },
    { id: "v3", pitch: 67, start: 2.25, duration: 0.5, velocity: 64 },
    { id: "v4", pitch: 69, start: 3.5, duration: 1, velocity: 102 },
  ];

  return (
    <div className="min-h-screen bg-[hsl(240_10%_10%)] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
            Capture
          </div>
          <h1 className="font-mono text-xl font-semibold tracking-tight text-white">
            Imported Components
          </h1>
          <p className="max-w-3xl font-mono text-sm text-white/60">
            Isolated components imported from Figma-generated output and adapted into MusicHub.
          </p>
        </header>

        <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Direct Figma Import
            </div>
            <CardTitle className="font-mono text-sm tracking-tight">PianoRollToolbar</CardTitle>
            <p className="text-sm text-muted-foreground">
              Standalone bounded component generated in Figma and adapted into the real repo, shown in a minimal piano-roll context.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <PianoRollPreviewSurface />
            <div className="font-mono text-[11px] text-muted-foreground">
              Source component:
              {" "}
              <span className="text-foreground">
                /src/components/studio/PianoRollToolbar.tsx
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Imported Figma Variant
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">Clip Layer</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported clip visuals and context menu kept isolated from the live arrangement editor.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <div className="relative h-28 rounded-lg border border-[hsl(240_8%_20%)] bg-[hsl(240_10%_9%)]">
                  <FigmaClipBlock clipName="Vocal Take" clipColor="#ff6b6b" startTime={0.5} duration={3.5} fadeIn={0.4} fadeOut={0.6} pixelsPerBeat={52}>
                    <FigmaClipWaveform waveformData={waveformData.peaks.slice(0, 120)} color="rgba(255,255,255,0.8)" />
                  </FigmaClipBlock>
                  <FigmaClipBlock clipName="Piano Melody" clipColor="#4ecdc4" startTime={4.5} duration={3} isSelected pixelsPerBeat={52}>
                    <FigmaClipMidiPreview
                      notes={[
                        { pitch: 60, start: 0.25, duration: 0.5, velocity: 72 },
                        { pitch: 64, start: 0.75, duration: 0.5, velocity: 84 },
                        { pitch: 67, start: 1.25, duration: 0.75, velocity: 92 },
                      ]}
                      clipDuration={3}
                      minPitch={48}
                      maxPitch={84}
                    />
                  </FigmaClipBlock>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setClipMenuOpen((open) => !open)}>
                    {clipMenuOpen ? "Hide" : "Show"} Clip Menu
                  </Button>
                </div>
                {clipMenuOpen ? (
                  <FigmaClipContextMenu
                    x={540}
                    y={120}
                    clipName="Vocal Take"
                    hasAutomation
                    pointerMode="select"
                    onClose={() => setClipMenuOpen(false)}
                    onSplit={() => {}}
                    onDuplicate={() => {}}
                    onDelete={() => {}}
                    onAddFadeIn={() => {}}
                    onAddFadeOut={() => {}}
                    onPointerModeChange={() => {}}
                    onShowAutomation={() => {}}
                    onHideAutomation={() => {}}
                    onAddAutomation={() => {}}
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">KeySelector</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported key and scale selector translated to a local callback-driven control.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <KeySelector
                  root={keyRoot}
                  scale={keyScale}
                  onChangeRoot={setKeyRoot}
                  onChangeScale={setKeyScale}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">Theory Tools</CardTitle>
              <p className="text-sm text-muted-foreground">
                Small exported theory utilities preserved as bounded, preview-only tools.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <TempoTapTool currentTempo={tempoTapValue} onTap={() => setTempoTapValue((value) => value + 1)} onReset={() => setTempoTapValue(0)} />
              <MetronomeTool
                isPlaying={metronomePlaying}
                tempo={metronomeTempo}
                onTempoChange={setMetronomeTempo}
                onPlay={() => setMetronomePlaying(true)}
                onStop={() => setMetronomePlaying(false)}
              />
              <TunerTool detectedNote="A4" frequency={440.12} cents={2} isInTune />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">Analysis Cards</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported detection cards kept as bounded readouts, not wired to any backend analysis yet.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <BPMDetector detectedBPM={124} confidence={86} onAnalyze={() => {}} />
              <KeyDetector detectedKey="C" detectedScale="Major" confidence={79} onAnalyze={() => {}} />
              <LoudnessAnalyzer lufs={-13.7} truePeak={-0.9} dynamicRange={8.2} />
              <PitchAnalyzer detectedPitch="A4" frequency={440.12} confidence={97} />
              <SpectrumAnalyzer />
              <WaveformAnalyzer peakLevel={-4.8} rmsLevel={-11.6} />
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">TransportButton</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported transport control primitives, adapted to the local DAW token layer.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-5 rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <div className="flex items-center gap-3">
                  <TransportButton action="rewind" size="sm" />
                  <TransportButton action="play" active={isPlayingPreview} onClick={() => setIsPlayingPreview((current) => !current)} />
                  <TransportButton action="stop" onClick={() => setIsPlayingPreview(false)} />
                  <TransportButton action="record" active={isRecordingPreview} onClick={() => setIsRecordingPreview((current) => !current)} />
                  <TransportButton action="loop" active={isLoopingPreview} onClick={() => setIsLoopingPreview((current) => !current)} />
                  <TransportButton action="forward" size="sm" />
                </div>
                <TransportControls
                  isPlaying={isPlayingPreview}
                  isRecording={isRecordingPreview}
                  isLooping={isLoopingPreview}
                  onPlay={() => setIsPlayingPreview((current) => !current)}
                  onStop={() => {
                    setIsPlayingPreview(false);
                    setIsRecordingPreview(false);
                  }}
                  onRecord={() => setIsRecordingPreview((current) => !current)}
                  onLoop={() => setIsLoopingPreview((current) => !current)}
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/TransportButton.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">DeviceSlot</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported compact device strip translated to local callback-driven device data.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <div className="max-w-[220px]">
                  <DeviceSlot
                    device={{
                      id: "slot-1",
                      name: "Compressor",
                      type: "compressor",
                      enabled: deviceSlotEnabled,
                      preset: "Vocal Glue",
                      cpuUsage: 18,
                      vendor: "MusicHub",
                    }}
                    onToggle={setDeviceSlotEnabled}
                    onClick={() => {}}
                  />
                </div>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/DeviceSlot.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">Figma Mixer Primitives</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported design-system mixer controls preserved as isolated review components.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6 xl:grid-cols-[auto_auto_1fr]">
                <div className="flex items-end gap-5">
                  <FigmaKnob
                    value={figmaKnobValue}
                    onChange={setFigmaKnobValue}
                    label="Gain"
                    accent
                    formatValue={(value) => `${Math.round(value * 100)}%`}
                  />
                  <FigmaKnob
                    value={figmaPanValue}
                    onChange={setFigmaPanValue}
                    label="Pan"
                    bipolar
                  />
                </div>
                <FigmaFader
                  value={figmaFaderValue}
                  onChange={setFigmaFaderValue}
                  label="Channel 1"
                  height={180}
                  color="#4ecdc4"
                />
                <div className="flex flex-wrap items-end gap-6">
                  <FigmaMeter level={0.68} peak={0.79} height={160} showScale />
                  <FigmaStereoMeter leftLevel={0.61} rightLevel={0.73} leftPeak={0.74} rightPeak={0.81} height={160} />
                  <FigmaCorrelationMeter correlation={0.35} />
                </div>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source components:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/imported/FigmaKnob.tsx
                </span>
                {", "}
                <span className="text-foreground">
                  /src/components/studio/imported/FigmaFader.tsx
                </span>
                {", "}
                <span className="text-foreground">
                  /src/components/studio/imported/FigmaMeter.tsx
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">Bridge Cards</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported bridge and sync surfaces preserved as bounded status/import cards.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6 md:grid-cols-2">
                <BridgeConnectionCard serviceName="Ableton Bridge" isConnected onDisconnect={() => {}} />
                <SyncStatusCard service="Host Sync" lastSync="12 seconds ago" onSync={() => {}} />
                <ImportSourceCard sourceName="Dropbox" sourceIcon="☁️" itemCount={14} onImport={() => {}} />
                <ExportFormatCard formatName="FLAC" formatExtension=".flac" onExport={() => {}} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">Template Components</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported template grid, card, and preview modal translated to local isolated components.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <GenreTemplateSection
                  genre="Lo-fi"
                  onViewAll={() => {}}
                  templates={
                    <TemplateGrid>
                      <TemplateCard
                        templateName="Late Night Keys"
                        description="Warm Rhodes with tape wobble and soft drums."
                        trackCount={8}
                        onSelect={() => setTemplatePreviewOpen(true)}
                      />
                      <TemplateCard
                        templateName="Minimal Pulse"
                        description="Tight synth pulse with sidechain and atmospheric returns."
                        trackCount={6}
                        onSelect={() => setTemplatePreviewOpen(true)}
                      />
                    </TemplateGrid>
                  }
                />
                <TemplatePreviewModal
                  isOpen={templatePreviewOpen}
                  templateName="Late Night Keys"
                  description="Warm Rhodes with tape wobble and soft drums."
                  trackCount={8}
                  devices={["E-Piano", "Chorus", "EQ", "Glue Compressor"]}
                  onClose={() => setTemplatePreviewOpen(false)}
                  onUse={() => setTemplatePreviewOpen(false)}
                >
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted-foreground)]">
                    Template preview content placeholder
                  </div>
                </TemplatePreviewModal>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">KeyboardShortcutHint</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported shortcut hint component, translated to local tokenized keycaps.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <div className="space-y-3">
                  <KeyboardShortcutHint description="Duplicate clip" keys={["Cmd", "D"]} />
                  <KeyboardShortcutHint description="Quantize notes" keys={["Q"]} />
                  <KeyboardShortcutHint description="Open browser" keys={["B"]} />
                </div>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/KeyboardShortcutHint.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">ContextualHelpBubble</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported help bubble component preserved as a bounded overlay primitive.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative flex h-[180px] items-center justify-center rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <button className="rounded-lg border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_18%)] px-4 py-2 text-sm text-white/80">
                  Hover target
                </button>
                <ContextualHelpBubble
                  position="top"
                  message="Use this control to open the device browser and insert a new effect."
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/ContextualHelpBubble.tsx
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Direct Figma Import
            </div>
            <CardTitle className="font-mono text-sm tracking-tight">StrummingDialog</CardTitle>
            <p className="text-sm text-muted-foreground">
              Exported guitar-style strumming dialog, translated to local piano-roll note types and callback-driven application.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
              <Button onClick={() => setStrummingOpen(true)}>Open Strumming Dialog</Button>
              <StrummingDialog
                open={strummingOpen}
                notes={chordPreviewNotes}
                onApply={() => {}}
                onClose={() => setStrummingOpen(false)}
              />
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              Source component:
              {" "}
              <span className="text-foreground">
                /src/components/studio/StrummingDialog.tsx
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">RotaryKnob</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported rotary control adapted as a standalone DAW knob primitive.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <div className="flex gap-8">
                  <RotaryKnob value={knobValue} onChange={setKnobValue} label="Pan" formatValue={(value) => `${Math.round((value - 0.5) * 200)}`} />
                  <RotaryKnob value={sendKnobValue} onChange={setSendKnobValue} label="Send A" color="#4ecdc4" formatValue={(value) => `${Math.round(value * 100)}%`} />
                  <RotaryKnob value={driveKnobValue} onChange={setDriveKnobValue} label="Drive" color="#ff9f43" formatValue={(value) => `${Math.round(value * 10) / 10}`} />
                </div>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/RotaryKnob.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">VelocityLane</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported professional velocity editor adapted to local note shapes with direct bar editing callbacks.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <VelocityLane
                  notes={velocityLaneNotes}
                  selectedNotes={new Set(["v2"])}
                  pixelsPerBeat={72}
                  totalBars={4}
                  beatsPerBar={4}
                  barWidth={288}
                  onSelectNote={() => {}}
                  onUpdateNote={() => {}}
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/VelocityLane.tsx
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">MarkerList</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported marker side panel translated to callback-driven local data.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[360px] overflow-hidden rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)]">
                <MarkerList
                  markers={previewMarkers}
                  playheadBeat={5.5}
                  onAddMarker={(marker) =>
                    setPreviewMarkers((current) => [
                      ...current,
                      { id: `m-${current.length + 1}`, ...marker },
                    ])
                  }
                  onDeleteMarker={(markerId) => setPreviewMarkers((current) => current.filter((marker) => marker.id !== markerId))}
                  onJumpToMarker={() => {}}
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/MarkerList.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">TimelineMarker</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported timeline marker translated to local marker data and previewed in an isolated ruler surface.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-28 overflow-hidden rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <div className="absolute inset-x-6 top-8 h-px bg-[hsl(240_8%_24%)]" />
                {previewMarkers.map((marker) => (
                  <TimelineMarker
                    key={marker.id}
                    marker={marker}
                    pixelsPerBeat={120}
                    onJump={() => {}}
                    onDelete={(markerId) => setPreviewMarkers((current) => current.filter((marker) => marker.id !== markerId))}
                    onUpdate={(markerId, updates) =>
                      setPreviewMarkers((current) =>
                        current.map((marker) => (marker.id === markerId ? { ...marker, ...updates } : marker)),
                      )
                    }
                  />
                ))}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/TimelineMarker.tsx
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">ChordToolsDialog</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported chord utility dialog, adapted to local note types with embedded chord detection and generation helpers.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <Button onClick={() => setChordToolsOpen(true)}>Open Chord Tools</Button>
                <ChordToolsDialog
                  open={chordToolsOpen}
                  notes={chordPreviewNotes}
                  onApply={setChordPreviewNotes}
                  onClose={() => setChordToolsOpen(false)}
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/ChordToolsDialog.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">Waveform</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported waveform visualizer, adapted to a local waveform data shape and previewed in an isolated clip surface.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <div className="relative h-24 overflow-hidden rounded-lg border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_9%)]">
                  <Waveform waveformData={waveformData} width={820} height={96} color="#ff9f43" gain={0.95} fadeIn={0.06} fadeOut={0.1} />
                </div>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/Waveform.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">ZoomControl</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported UI zoom control, adapted to explicit props instead of export-only Studio context.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <ZoomControl zoomLevel={zoomLevel} onChange={setZoomLevel} />
                <div className="mt-3">
                  <ZoomControl compact zoomLevel={zoomLevel} onChange={setZoomLevel} />
                </div>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/ZoomControl.tsx
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">LengthOperationsMenu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <LengthOperationsMenu
                  notes={previewNotes}
                  selectedNoteIds={new Set(["n1", "n2", "n3"])}
                  onApplyOperation={setPreviewNotes}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">NoteOperationsMenu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <NoteOperationsMenu
                  notes={previewNotes}
                  selectedNoteIds={new Set(["n2", "n3"])}
                  playheadPosition={3.25}
                  onApplyOperation={() => {}}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">SelectionToolsMenu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <SelectionToolsMenu notes={previewNotes} onSelect={() => {}} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Isolated Figma Variant
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">FigmaTrackControls</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported track header controls preserved as an isolated variant because MusicHub already has a live track control path.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <div className="max-w-[160px]">
                  <FigmaTrackControls
                    trackName="Lead Synth"
                    trackColor={trackColor}
                    volume={-3.2}
                    pan={14}
                    isSoloed
                    isSelected
                    onColorChange={() => setTrackColor(trackColor === "#4a9eff" ? "#8b5cf6" : "#4a9eff")}
                    onIconChange={() => setTrackIcon(trackIcon === "mic" ? "synth" : "mic")}
                    trackIcon={<span className="text-xs">{trackIcon}</span>}
                  />
                </div>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/imported/FigmaTrackControls.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Isolated Figma Variant
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">FigmaAutomationLane</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported automation lane shell preserved as a visual variant because the live arrangement already owns automation editing.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <FigmaAutomationLane
                  parameterName="Volume"
                  points={automationPoints}
                  height={120}
                  pixelsPerBeat={46}
                  totalBeats={16}
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/imported/FigmaAutomationLane.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">TransposeDialog</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported transpose dialog, adapted to local MIDI note types and kept isolated until the inline transpose flow is replaced.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <Button onClick={() => setTransposeOpen(true)}>Open Transpose Dialog</Button>
                <TransposeDialog
                  open={transposeOpen}
                  notes={previewNotes}
                  onApply={() => {}}
                  onClose={() => setTransposeOpen(false)}
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/TransposeDialog.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">ArpeggiatorDialog</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported arpeggiator dialog, adapted as a bounded settings surface and kept isolated from the live piano-roll runtime.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <Button onClick={() => setArpeggiatorOpen(true)}>Open Arpeggiator</Button>
                <ArpeggiatorDialog
                  open={arpeggiatorOpen}
                  onApply={() => {}}
                  onClose={() => setArpeggiatorOpen(false)}
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/ArpeggiatorDialog.tsx
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">VelocityOperationsMenu</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported velocity batch menu, adapted to local MIDI note structures and previewed against a small note set.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <VelocityOperationsMenu
                  notes={previewNotes}
                  selectedNoteIds={new Set(["n2", "n3"])}
                  onApplyOperation={setPreviewNotes}
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/VelocityOperationsMenu.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">TrackContextMenu</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported track context menu, adapted to local palette tokens and kept isolated from the live track runtime.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative min-h-[280px] rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <Button onClick={() => setTrackMenuOpen(true)} variant="secondary" className="font-mono text-xs">
                  Open Track Context Menu
                </Button>
                {trackMenuOpen ? (
                  <TrackContextMenu
                    x={80}
                    y={220}
                    trackType="audio"
                    currentColor={trackColor}
                    isMuted={false}
                    isSoloed={false}
                    isArmed
                    hasAutomation
                    pointerMode="select"
                    onClose={() => setTrackMenuOpen(false)}
                    onColorChange={setTrackColor}
                    onChangeIcon={() => {}}
                    onDuplicate={() => {}}
                    onDelete={() => {}}
                    onConvertToGroup={() => {}}
                    onToggleMute={() => {}}
                    onToggleSolo={() => {}}
                    onToggleArm={() => {}}
                    onShowAutomation={() => {}}
                    onHideAutomation={() => {}}
                    onAddAutomation={() => {}}
                    onPointerModeChange={() => {}}
                    onSaveAsTemplate={() => {}}
                  />
                ) : null}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/TrackContextMenu.tsx
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Direct Figma Import
            </div>
            <CardTitle className="font-mono text-sm tracking-tight">FadeCurveMenu</CardTitle>
            <p className="text-sm text-muted-foreground">
              Exported fade-curve selector, kept isolated because the local Studio runtime does not yet expose real fade-curve editing.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
              <FadeCurveMenu currentCurve={fadeCurve} onCurveChange={setFadeCurve} fadeType="in">
                <Button variant="secondary" className="font-mono text-xs">
                  Right-click Fade Handle
                </Button>
              </FadeCurveMenu>
              <div className="mt-3 font-mono text-[11px] text-muted-foreground">
                Current curve: <span className="text-foreground">{fadeCurve}</span>
              </div>
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              Source component:
              {" "}
              <span className="text-foreground">
                /src/components/studio/FadeCurveMenu.tsx
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Direct Figma Import
            </div>
            <CardTitle className="font-mono text-sm tracking-tight">HumanizeDialog</CardTitle>
            <p className="text-sm text-muted-foreground">
              Exported humanize dialog, kept isolated because the local piano-roll still applies humanization directly.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
              <Button onClick={() => setHumanizeOpen(true)} className="gap-2">
                Open Humanize Dialog
              </Button>
              <HumanizeDialog
                open={humanizeOpen}
                noteCount={17}
                onApply={() => {}}
                onClose={() => setHumanizeOpen(false)}
              />
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              Source component:
              {" "}
              <span className="text-foreground">
                /src/components/studio/HumanizeDialog.tsx
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Direct Figma Import
            </div>
            <CardTitle className="font-mono text-sm tracking-tight">QuantizeDialog</CardTitle>
            <p className="text-sm text-muted-foreground">
              Exported quantize settings dialog, imported as a bounded component and kept isolated until we replace the current inline quantize flow.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
              <Button onClick={() => setQuantizeOpen(true)}>Open Quantize Dialog</Button>
              <QuantizeDialog
                open={quantizeOpen}
                onApply={() => {}}
                onClose={() => setQuantizeOpen(false)}
              />
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              Source component:
              {" "}
              <span className="text-foreground">
                /src/components/studio/QuantizeDialog.tsx
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Direct Figma Import
            </div>
            <CardTitle className="font-mono text-sm tracking-tight">SendRoutingMenu</CardTitle>
            <p className="text-sm text-muted-foreground">
              Exported send-routing selector, kept isolated until the local Studio runtime exposes a dedicated send-routing menu surface.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative min-h-[220px] rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
              <div className="flex items-center gap-4">
                <Button onClick={() => setSendRoutingOpen(true)} variant="secondary" className="font-mono text-xs">
                  Open Send A Routing
                </Button>
                <div className="font-mono text-[11px] text-muted-foreground">
                  Current target: <span className="text-foreground">{sendTarget ?? "None"}</span>
                </div>
              </div>
              {sendRoutingOpen ? (
                <SendRoutingMenu
                  sendId="send-a"
                  sendLabel="A"
                  currentTargetId={sendTarget}
                  returnTracks={returnTracks}
                  onRoute={setSendTarget}
                  onClose={() => setSendRoutingOpen(false)}
                  position={{ x: 120, y: 380 }}
                />
              ) : null}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              Source component:
              {" "}
              <span className="text-foreground">
                /src/components/studio/SendRoutingMenu.tsx
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Isolated Figma Variant
            </div>
            <CardTitle className="font-mono text-sm tracking-tight">PianoRollKeyboard + PianoRollVelocityLane</CardTitle>
            <p className="text-sm text-muted-foreground">
              Imported as isolated variants because the current runtime keyboard and velocity lane already carry stronger interaction contracts.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImportedPianoRollSurface />
            <div className="font-mono text-[11px] text-muted-foreground">
              Source components:
              {" "}
              <span className="text-foreground">
                /src/components/studio/imported/FigmaPianoRollKeyboard.tsx
              </span>
              {" · "}
              <span className="text-foreground">
                /src/components/studio/imported/FigmaPianoRollVelocityLane.tsx
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">TrackColorPicker</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported DAW-style color palette for track labeling, kept isolated until a dedicated track-detail edit surface is wired.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <TrackColorPicker currentColor={trackColor} onColorChange={setTrackColor} />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/TrackColorPicker.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">TrackIconPicker</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported icon selector for track labeling, kept isolated until track metadata editing is wired in the local Studio runtime.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <TrackIconPicker currentIcon={trackIcon} onIconChange={setTrackIcon} />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/TrackIconPicker.tsx
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">DeviceView</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported device panel surface, kept isolated from the real Studio detail/device runtime.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[420px] overflow-hidden rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)]">
                <DeviceView
                  track={deviceTrack}
                  onDeviceToggle={() => {}}
                  onDeviceClick={() => {}}
                  onAddDevice={() => {}}
                />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/DeviceView.tsx
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
            <CardHeader className="pb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Direct Figma Import
              </div>
              <CardTitle className="font-mono text-sm tracking-tight">LessonPanel</CardTitle>
              <p className="text-sm text-muted-foreground">
                Exported lesson guidance panel, kept isolated from the real Studio lesson shell and runtime contracts.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex min-h-[520px] items-start justify-center rounded-xl border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_12%)] p-6">
                <LessonPanel lesson={lesson} />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Source component:
                {" "}
                <span className="text-foreground">
                  /src/components/studio/LessonPanel.tsx
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Isolated Figma Variant
            </div>
            <CardTitle className="font-mono text-sm tracking-tight">Lesson Header + Progress + Step Card</CardTitle>
            <p className="text-sm text-muted-foreground">
              Imported as isolated variants because the live lesson shell in `MusicHub` is already more specific to runtime state and mode policy.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImportedLessonSurface />
            <div className="font-mono text-[11px] text-muted-foreground">
              Source components:
              {" "}
              <span className="text-foreground">
                /src/components/studio/imported/FigmaLessonHeader.tsx
              </span>
              {" · "}
              <span className="text-foreground">
                /src/components/studio/imported/FigmaLessonProgressRail.tsx
              </span>
              {" · "}
              <span className="text-foreground">
                /src/components/studio/imported/FigmaLessonStepCard.tsx
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
