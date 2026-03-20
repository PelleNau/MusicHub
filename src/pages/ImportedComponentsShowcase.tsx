import { useState } from "react";

import { FadeCurveMenu, type FadeCurveType } from "@/components/studio/FadeCurveMenu";
import { HumanizeDialog } from "@/components/studio/HumanizeDialog";
import { DeviceView } from "@/components/studio/DeviceView";
import { LessonPanel } from "@/components/studio/LessonPanel";
import { PianoRollToolbar } from "@/components/studio/PianoRollToolbar";
import { SendRoutingMenu } from "@/components/studio/SendRoutingMenu";
import { TrackColorPicker } from "@/components/studio/TrackColorPicker";
import { TrackIconPicker, type TrackIcon } from "@/components/studio/TrackIconPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function ImportedComponentsShowcase() {
  const [fadeCurve, setFadeCurve] = useState<FadeCurveType>("linear");
  const [humanizeOpen, setHumanizeOpen] = useState(false);
  const [sendRoutingOpen, setSendRoutingOpen] = useState(false);
  const [sendTarget, setSendTarget] = useState<string | undefined>("return-reverb");
  const [trackColor, setTrackColor] = useState("#4a9eff");
  const [trackIcon, setTrackIcon] = useState<TrackIcon>("mic");

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
      </div>
    </div>
  );
}
