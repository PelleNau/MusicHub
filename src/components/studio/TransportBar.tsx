import { Play, Pause, Square, SkipBack, Repeat, Undo2, Redo2, Circle, Search, ZoomIn, Maximize2, Wifi, SunMedium, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConnectionState } from "@/services/hostConnector";
import type { MeterLevel } from "@/services/pluginHostSocket";
import type { SyncStatus } from "@/hooks/useHostConnector";
import { ConnectionBadge } from "@/components/studio/ConnectionAlert";
import { MasterMeter } from "@/components/studio/NativeMeterBridge";
import type { SidecarStatus } from "@/services/tauriShell";
import type { StudioPlaybackState } from "@/hooks/useStudioTransport";
import { useStudioInfo, STUDIO_INFO } from "./StudioInfoContext";

interface TransportBarProps {
  tempo: number;
  timeSignature: string;
  currentBeat: number;
  playbackState: StudioPlaybackState;
  loopEnabled?: boolean;
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
}: TransportBarProps) {
  const beatsPerBar = parseInt(timeSignature.split("/")[0]) || 4;
  const { setHoveredInfo } = useStudioInfo();
  const hoverProps = (key: keyof typeof STUDIO_INFO) => ({
    onMouseEnter: () => setHoveredInfo(STUDIO_INFO[key]),
    onMouseLeave: () => setHoveredInfo(null),
  });

  return (
    <div className="flex items-center gap-4 border-b border-white/6 bg-[#232429] px-4 py-2 font-mono text-xs text-white/85">
      <div className="flex items-center gap-1 border-r border-white/8 pr-3">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-md text-white/72 hover:bg-white/6 hover:text-white"
          onClick={onStop}
          title="Return to start"
          data-guide-anchor="transport.skipBack"
          {...hoverProps("stop")}
        >
          <SkipBack className="h-3.5 w-3.5" />
        </Button>

        {playbackState === "playing" ? (
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-md bg-white/6 text-primary hover:bg-white/8" onClick={onPause} title="Pause" data-guide-anchor="transport.pause" {...hoverProps("pause")}>
            <Pause className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-md bg-white/6 text-white hover:bg-white/8" onClick={onPlay} title="Play" data-guide-anchor="transport.play" {...hoverProps("play")}>
            <Play className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-md text-white/72 hover:bg-white/6 hover:text-white"
          onClick={onStop}
          title="Stop"
          data-guide-anchor="transport.stop"
          {...hoverProps("stop")}
        >
          <Square className="h-3 w-3" />
        </Button>

        {onRecordToggle && (
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 rounded-md ${recording ? "bg-red-500/15 text-red-400" : "text-white/72 hover:bg-white/6 hover:text-white"}`}
            onClick={onRecordToggle}
            title={recording ? "Stop recording" : "Start recording"}
            {...hoverProps("record")}
          >
            <Circle className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Loop toggle */}
        {onLoopToggle && (
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 rounded-md ${loopEnabled ? "bg-primary/14 text-primary" : "text-white/72 hover:bg-white/6 hover:text-white"}`}
            onClick={onLoopToggle}
            title="Toggle loop (⌘L)"
            data-guide-anchor="transport.loop"
            {...hoverProps("loop")}
          >
            <Repeat className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

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

      <div className="flex items-center gap-3 border-r border-white/8 pr-4" {...hoverProps("position")}>
        <span className="tabular-nums text-sm font-semibold text-white min-w-[6ch]">
          {beatToBarDisplay(currentBeat, beatsPerBar)}
        </span>
        <div className="h-1.5 w-1.5 rounded-full bg-[#2b7cff]" />
        <span className="text-[12px] text-white/78">New Project</span>
      </div>

      <div className="mx-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-white/45" {...hoverProps("tempo")}>
          <span className="text-[11px] uppercase">BPM</span>
          <input
            type="number"
            value={tempo}
            onChange={(e) => onTempoChange(Number(e.target.value) || 120)}
            className="h-8 w-14 rounded-md border border-white/8 bg-[#2b2d33] px-1.5 py-0.5 text-center text-xs tabular-nums text-white focus:outline-none focus:ring-1 focus:ring-primary"
            min={20}
            max={300}
          />
        </div>
        <span className="text-white/35">•</span>
        <span className="rounded-md border border-white/8 bg-[#2b2d33] px-3 py-1.5 text-white/76" {...hoverProps("timeSig")}>{timeSignature}</span>
        <select className="h-8 rounded-md border border-white/8 bg-[#2b2d33] px-3 text-white/82 outline-none">
          <option>C</option>
        </select>
        <select className="h-8 rounded-md border border-white/8 bg-[#2b2d33] px-3 text-white/82 outline-none">
          <option>Major (Ionian)</option>
        </select>
      </div>

      <div className="ml-auto flex items-center gap-2 text-white/62">
        <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/6 hover:text-white">
          <Search className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-2 rounded-md border border-white/8 bg-[#2b2d33] px-2 py-1">
          <span>80%</span>
          <button className="hover:text-white">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button className="hover:text-white">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#245ea8] bg-[#1b3452] text-[11px] text-[#7db7ff]">G</span>
          <span className="text-[11px] uppercase tracking-wide">CPU 12%</span>
        </div>
        <Wifi className="h-3.5 w-3.5 text-emerald-400" />
        <SunMedium className="h-3.5 w-3.5" />
        <div className="flex items-center gap-1 border-l border-white/8 pl-2 text-white/72">
          <span>Features</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </div>

      {masterMeter && (
        <div className="hidden items-center gap-1 border-l border-white/8 pl-3">
          <MasterMeter meter={masterMeter} height={18} />
          <span className="text-[9px] text-white/42 tabular-nums">
            {masterMeter.peak > -60 ? `${masterMeter.peak.toFixed(1)}` : "−∞"}
          </span>
        </div>
      )}
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
    </div>
  );
}
