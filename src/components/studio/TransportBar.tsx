import { Play, Pause, Square, SkipBack, Repeat, Undo2, Redo2, Circle } from "lucide-react";
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
    <div className="flex items-center gap-4 border-b border-border bg-card px-4 py-2 font-mono text-xs">
      {/* Transport controls */}
      <div className="flex items-center gap-1 border border-border/50 rounded-md px-1 py-0.5 bg-muted/15">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onStop}
          title="Return to start"
          data-guide-anchor="transport.skipBack"
          {...hoverProps("stop")}
        >
          <SkipBack className="h-3.5 w-3.5" />
        </Button>

        {playbackState === "playing" ? (
          <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={onPause} title="Pause" data-guide-anchor="transport.pause" {...hoverProps("pause")}>
            <Pause className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onPlay} title="Play" data-guide-anchor="transport.play" {...hoverProps("play")}>
            <Play className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
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
            className={`h-7 w-7 ${recording ? "text-red-500 bg-red-500/10" : ""}`}
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
            className={`h-7 w-7 ${loopEnabled ? "text-primary bg-primary/10" : ""}`}
            onClick={onLoopToggle}
            title="Toggle loop (⌘L)"
            data-guide-anchor="transport.loop"
            {...hoverProps("loop")}
          >
            <Repeat className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 border-l border-border pl-3 border border-border/50 rounded-md px-1.5 py-0.5 bg-muted/15 ml-1" {...hoverProps("undo")}>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          {...hoverProps("redo")}
        >
          <Redo2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Position display */}
      <div className="flex items-center gap-3 border border-border/50 rounded-md px-2 py-0.5 bg-muted/15" {...hoverProps("position")}>
        <span className="tabular-nums text-foreground text-sm font-semibold min-w-[6ch]">
          {beatToBarDisplay(currentBeat, beatsPerBar)}
        </span>
      </div>

      {/* Tempo */}
      <div className="flex items-center gap-1.5 border border-border/50 rounded-md px-2 py-0.5 bg-muted/15" {...hoverProps("tempo")}>
        <input
          type="number"
          value={tempo}
          onChange={(e) => onTempoChange(Number(e.target.value) || 120)}
          className="w-14 rounded border border-border bg-background px-1.5 py-0.5 text-center text-xs tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          min={20}
          max={300}
        />
        <span className="text-foreground/60">BPM</span>
      </div>

      <span className="text-foreground/60 border border-border/50 rounded-md px-2 py-0.5 bg-muted/15" {...hoverProps("timeSig")}>{timeSignature}</span>

      {/* Playback indicator */}
      {playbackState === "playing" && (
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary">PLAY</span>
        </div>
      )}

      {/* Master meter */}
      {masterMeter && (
        <div className="flex items-center gap-1 border-l border-border pl-3">
          <MasterMeter meter={masterMeter} height={18} />
          <span className="text-[9px] text-muted-foreground tabular-nums">
            {masterMeter.peak > -60 ? `${masterMeter.peak.toFixed(1)}` : "−∞"}
          </span>
        </div>
      )}

      {/* Connection badge */}
      <div className="ml-auto">
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
