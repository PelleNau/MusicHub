import { useState } from "react";
import { Search, Undo2, Redo2, Wifi, SunMedium } from "lucide-react";
import type { ConnectionState } from "@/services/hostConnector";
import type { MeterLevel } from "@/services/pluginHostSocket";
import type { SyncStatus } from "@/hooks/useHostConnector";
import { ConnectionBadge } from "@/components/studio/ConnectionAlert";
import { MasterMeter } from "@/components/studio/NativeMeterBridge";
import { Button } from "@/components/ui/button";
import type { SidecarStatus } from "@/services/tauriShell";
import type { StudioPlaybackState } from "@/hooks/useStudioTransport";
import { useStudioInfo, STUDIO_INFO } from "./StudioInfoContext";
import { TransportButton } from "./TransportButton";
import { ZoomControl } from "./ZoomControl";
import { KeySelector } from "./KeySelector";

interface TransportBarProps {
  tempo: number;
  timeSignature: string;
  currentBeat: number;
  playbackState: StudioPlaybackState;
  loopEnabled?: boolean;
  canPlay?: boolean;
  canPause?: boolean;
  canStop?: boolean;
  connectionState?: ConnectionState;
  isMock?: boolean;
  inShell?: boolean;
  sidecarStatus?: SidecarStatus | null;
  masterMeter?: MeterLevel | null;
  syncStatus?: SyncStatus;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onTempoChange: (tempo: number) => void;
  onLoopToggle?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRestartShellHost?: () => void;
  recording?: boolean;
  onRecordToggle?: () => void;
  captureVariant?: "figma" | null;
}

function beatToBarDisplay(beat: number, beatsPerBar = 4): string {
  const bar = Math.floor(beat / beatsPerBar) + 1;
  const b = Math.floor(beat % beatsPerBar) + 1;
  const sub = Math.round((beat % 1) * 4) + 1;
  return `${bar}.${b}.${sub}`;
}

export function TransportBar({
  tempo,
  timeSignature,
  currentBeat,
  playbackState,
  loopEnabled,
  canPlay = playbackState !== "playing",
  canPause = playbackState === "playing",
  canStop = playbackState !== "stopped" || currentBeat > 0.001,
  connectionState = "disconnected",
  isMock = false,
  inShell = false,
  sidecarStatus = null,
  masterMeter,
  syncStatus,
  onPlay,
  onPause,
  onStop,
  onTempoChange,
  onLoopToggle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onConnect,
  onDisconnect,
  onRestartShellHost,
  recording = false,
  onRecordToggle,
  captureVariant = null,
}: TransportBarProps) {
  const beatsPerBar = parseInt(timeSignature.split("/")[0]) || 4;
  const { setHoveredInfo } = useStudioInfo();
  const hoverProps = (key: keyof typeof STUDIO_INFO) => ({
    onMouseEnter: () => setHoveredInfo(STUDIO_INFO[key]),
    onMouseLeave: () => setHoveredInfo(null),
  });

  const figmaCapture = captureVariant === "figma";
  const [keyRoot, setKeyRoot] = useState(0);
  const [keyScale, setKeyScale] = useState("major");
  const [zoomLevel, setZoomLevel] = useState(figmaCapture ? 75 : 80);
  const effectiveZoomLevel = figmaCapture ? Math.min(zoomLevel, 75) : zoomLevel;

  return (
    <div
      className={`flex items-center border-b border-white/6 bg-[#232429] font-mono text-xs text-white/85 ${
        figmaCapture ? "gap-2 px-2.5 py-1" : "gap-4 px-4 py-2"
      }`}
    >
      <div className={`flex items-center gap-0.5 border-r border-white/8 ${figmaCapture ? "pr-2" : "pr-3"}`}>
        <div data-guide-anchor="transport.skipBack" {...hoverProps("stop")}>
          <TransportButton action="rewind" size="sm" onClick={onStop} />
        </div>

        <div data-guide-anchor={playbackState === "playing" ? "transport.pause" : "transport.play"} {...hoverProps(playbackState === "playing" ? "pause" : "play")}>
          <TransportButton
            action={playbackState === "playing" ? "pause" : "play"}
            active={playbackState === "playing"}
            onClick={playbackState === "playing" ? onPause : onPlay}
            disabled={playbackState === "playing" ? !canPause : !canPlay}
            size="sm"
          />
        </div>

        <div data-guide-anchor="transport.stop" {...hoverProps("stop")}>
          <TransportButton action="stop" size="sm" onClick={onStop} disabled={!canStop} />
        </div>

        {onRecordToggle ? (
          <div data-guide-anchor="transport.record" {...hoverProps("record")}>
            <TransportButton action="record" active={recording} size="sm" onClick={onRecordToggle} />
          </div>
        ) : null}

        {onLoopToggle ? (
          <div data-guide-anchor="transport.loop" {...hoverProps("loop")}>
            <TransportButton action="loop" active={loopEnabled} size="sm" onClick={onLoopToggle} />
          </div>
        ) : null}
      </div>

      {!figmaCapture ? (
        <div className="flex items-center gap-0.5 border-r border-white/8 pr-3" {...hoverProps("undo")}>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md text-white/65 hover:bg-white/6 hover:text-white"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (⌘Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md text-white/65 hover:bg-white/6 hover:text-white"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (⌘⇧Z)"
            {...hoverProps("redo")}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : null}

      <div className={`flex items-center border-r border-white/8 ${figmaCapture ? "gap-1.5 pr-2" : "gap-3 pr-4"}`} {...hoverProps("position")}>
        <span className={`tabular-nums font-semibold text-white min-w-[6ch] ${figmaCapture ? "text-[12px]" : "text-sm"}`}>
          {beatToBarDisplay(currentBeat, beatsPerBar)}
        </span>
        {playbackState === "playing" ? (
          <span className="rounded-sm border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-emerald-300">
            PLAY
          </span>
        ) : null}
        <div className="h-1.5 w-1.5 rounded-full bg-[#2b7cff]" />
        <span className={`${figmaCapture ? "text-[10px]" : "text-[12px]"} text-white/78`}>New Project</span>
      </div>

      <div className={`flex items-center ${figmaCapture ? "mx-auto gap-1.5" : "mx-auto gap-3"}`}>
        <div className={`flex items-center text-white/45 ${figmaCapture ? "gap-1" : "gap-1.5"}`} {...hoverProps("tempo")}>
          <span className={`${figmaCapture ? "text-[10px]" : "text-[11px]"} uppercase`}>BPM</span>
          <input
            type="number"
            value={tempo}
            onChange={(e) => onTempoChange(Number(e.target.value) || 120)}
            className={`${figmaCapture ? "h-7 rounded-[5px]" : "h-8 rounded-md"} w-14 border border-white/8 bg-[#2b2d33] px-1.5 py-0.5 text-center text-xs tabular-nums text-white focus:outline-none focus:ring-1 focus:ring-primary`}
            min={20}
            max={300}
          />
        </div>
        <span className="text-white/35">•</span>
        <span className={`${figmaCapture ? "rounded-[5px] px-2.5 py-1 text-[10px]" : "rounded-md px-3 py-1.5"} border border-white/8 bg-[#2b2d33] text-white/76`} {...hoverProps("timeSig")}>{timeSignature}</span>
        <KeySelector
          root={keyRoot}
          scale={keyScale}
          onChangeRoot={setKeyRoot}
          onChangeScale={setKeyScale}
          compact
          className={`${figmaCapture ? "[&_select]:h-7 [&_select]:rounded-[5px] [&_select]:px-2.5 [&_select]:text-[10px]" : "[&_select]:h-8 [&_select]:rounded-md [&_select]:px-3"} [&_select]:border-white/8 [&_select]:bg-[#2b2d33] [&_select]:text-white/82 [&_select]:outline-none [&_select]:focus:ring-0`}
        />
      </div>

      <div className={`ml-auto flex items-center text-white/62 ${figmaCapture ? "gap-0.5" : "gap-2"}`}>
        <button className={`flex items-center justify-center rounded-md hover:bg-white/6 hover:text-white ${figmaCapture ? "h-6 w-6" : "h-7 w-7"}`}>
          <Search className="h-3.5 w-3.5" />
        </button>
        <ZoomControl
          zoomLevel={effectiveZoomLevel}
          onChange={setZoomLevel}
          compact
          className="[&_.bg-border]:bg-white/8 [&_.bg-foreground\\/70]:text-white/70 [&_.bg-foreground\\/90]:text-white/90 [&_.border-\\[var\\(--border\\)\\]]:border-white/8 [&_.bg-\\[var\\(--surface-1\\)\\]]:bg-[#2b2d33] [&_.hover\\:bg-\\[var\\(--surface-2\\)\\]:hover]:bg-white/6 [&_.hover\\:text-foreground:hover]:text-white [&_.hover\\:border-primary:hover]:border-white/18"
        />
        <div className={`flex items-center ${figmaCapture ? "gap-1" : "gap-2"}`}>
          <span className={`flex items-center justify-center rounded-full border border-[#245ea8] bg-[#1b3452] text-[#7db7ff] ${figmaCapture ? "h-6 w-6 text-[9px]" : "h-7 w-7 text-[11px]"}`}>G</span>
          <span className={`${figmaCapture ? "text-[9px] tracking-[0.12em]" : "text-[10px] tracking-[0.16em]"} uppercase text-white/56`}>CPU 12%</span>
        </div>
        <Wifi className="h-3.5 w-3.5 text-emerald-400" />
        <SunMedium className="h-3.5 w-3.5" />
      </div>

      {masterMeter && (
        <div className="hidden items-center gap-1 border-l border-white/8 pl-3">
          <MasterMeter meter={masterMeter} height={18} />
          <span className="text-[9px] text-white/42 tabular-nums">
            {masterMeter.peak > -60 ? `${masterMeter.peak.toFixed(1)}` : "−∞"}
          </span>
        </div>
      )}
      {!figmaCapture ? (
        <div className="hidden">
          <ConnectionBadge
            connectionState={connectionState}
            isMock={isMock}
            inShell={inShell}
            sidecarStatus={sidecarStatus}
            syncState={syncStatus?.state}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            onRestartShellHost={onRestartShellHost}
          />
        </div>
      ) : null}
    </div>
  );
}
