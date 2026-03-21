import { useState, useCallback, useRef, useMemo } from "react";
import { InventoryItem } from "@/types/inventory";
import { AbletonParseResult, TrackInfo, DeviceInfo } from "@/types/ableton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Upload,
  Loader2,
  Music2,
  Clock,
  Hash,
  KeyRound,
  Plug,
  Cpu,
  ChevronRight,
  Mic2,
  Volume2,
  Undo2,
  Crown,
  Settings2,
  Check,
  X,
} from "lucide-react";

// ── Constants ──

const PARSE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-ableton-project`;

const TRACK_TYPE_ICON: Record<string, React.ReactNode> = {
  midi: <Music2 className="h-3.5 w-3.5" />,
  audio: <Volume2 className="h-3.5 w-3.5" />,
  return: <Undo2 className="h-3.5 w-3.5" />,
  master: <Crown className="h-3.5 w-3.5" />,
};

const TRACK_TYPE_LABEL: Record<string, string> = {
  midi: "MIDI",
  audio: "Audio",
  return: "Return",
  master: "Master",
};

// ── Internal components ──

function DeviceCard({ device, owned }: { device: DeviceInfo; owned: boolean }) {
  const [paramsOpen, setParamsOpen] = useState(false);
  const hasParams = device.parameters.length > 0;

  return (
    <div className="rounded-md bg-secondary/40 border border-border/20 overflow-hidden">
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        {owned ? (
          <Check className="h-3 w-3 text-green-500 shrink-0" />
        ) : (
          <X className="h-3 w-3 text-destructive shrink-0" />
        )}
        {device.type === "instrument" ? (
          <Mic2 className="h-3 w-3 text-primary shrink-0" />
        ) : (
          <Settings2 className="h-3 w-3 text-muted-foreground shrink-0" />
        )}
        <span className="font-mono text-[11px] font-medium text-foreground truncate">
          {device.name}
        </span>
        {device.isPlugin && device.pluginFormat && (
          <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 h-4 shrink-0 border-primary/30 text-primary">
            {device.pluginFormat}
          </Badge>
        )}
        {device.presetName && (
          <span className="font-mono text-[10px] text-muted-foreground truncate ml-auto">
            {device.presetName}
          </span>
        )}
      </div>
      {hasParams && (
        <Collapsible open={paramsOpen} onOpenChange={setParamsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 px-2.5 py-1 w-full text-left border-t border-border/10 hover:bg-secondary/60 transition-colors">
            <ChevronRight className={`h-2.5 w-2.5 text-muted-foreground transition-transform ${paramsOpen ? "rotate-90" : ""}`} />
            <span className="font-mono text-[9px] text-muted-foreground">
              {device.parameters.length} params
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-2.5 pb-2 pt-1">
              {device.parameters.map((p, i) => (
                <div key={i} className="flex items-baseline justify-between gap-1">
                  <span className="font-mono text-[9px] text-muted-foreground truncate">{p.name}</span>
                  <span className="font-mono text-[10px] text-foreground shrink-0">{p.value}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function TrackRow({ track, ownedSet }: { track: TrackInfo; ownedSet: Set<string> }) {
  const [open, setOpen] = useState(false);
  const instruments = track.devices.filter((d) => d.type === "instrument");
  const effects = track.devices.filter((d) => d.type !== "instrument");

  if (track.devices.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-secondary/40 transition-colors text-left group">
        <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-90" : ""}`} />
        <span className="text-muted-foreground shrink-0">{TRACK_TYPE_ICON[track.type]}</span>
        <span className="font-mono text-xs font-medium text-foreground truncate">{track.name}</span>
        <span className="font-mono text-[9px] text-muted-foreground shrink-0 ml-auto">
          {TRACK_TYPE_LABEL[track.type]}
        </span>
        <Badge variant="secondary" className="font-mono text-[9px] px-1.5 py-0 h-4 shrink-0">
          {track.devices.length}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-8 mr-2 mb-2 space-y-1.5">
          {instruments.length > 0 && (
            <div className="space-y-1">
              <p className="font-mono text-[9px] text-primary uppercase tracking-wider px-1">Instruments</p>
              {instruments.map((d, i) => (
                <DeviceCard key={`i-${i}`} device={d} owned={ownedSet.has(d.name.toLowerCase())} />
              ))}
            </div>
          )}
          {effects.length > 0 && (
            <div className="space-y-1">
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider px-1">Effects</p>
              {effects.map((d, i) => (
                <DeviceCard key={`e-${i}`} device={d} owned={ownedSet.has(d.name.toLowerCase())} />
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Metadata card (DRY) ──

function MetadataCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-lg border border-border/30 bg-card p-3 flex items-center gap-3">
      <div className="rounded-md p-2 bg-secondary text-muted-foreground">{icon}</div>
      <div>
        <p className="font-mono text-lg font-bold text-foreground">{value}</p>
        <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

// ── Exported component ──

interface ProjectParserPanelProps {
  inventoryItems: InventoryItem[];
  onParsed: (result: AbletonParseResult, fileName?: string) => void;
  result: AbletonParseResult | null;
  onReset: () => void;
  onOpenInStudio?: () => void;
}

export function ProjectParserPanel({ inventoryItems, onParsed, result, onReset, onOpenInStudio }: ProjectParserPanelProps) {
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const ownedSet = useMemo(() => {
    const s = new Set<string>();
    for (const item of inventoryItems) {
      s.add(item.product.toLowerCase());
      s.add(`${item.vendor} ${item.product}`.toLowerCase());
    }
    return s;
  }, [inventoryItems]);

  const parseFile = useCallback(
    async (file: File) => {
      setError("");
      setFileName(file.name);
      setParsing(true);

      try {
        const buffer = await file.arrayBuffer();
        const resp = await fetch(PARSE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: buffer,
        });

        if (!resp.ok) {
          const errBody = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
          throw new Error(errBody.error || errBody.message || `HTTP ${resp.status}`);
        }

        const data = await resp.json();
        if (data?.error) throw new Error(data.error);

        const parsed = data as AbletonParseResult;
        onParsed(parsed, file.name);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to parse project file");
      } finally {
        setParsing(false);
      }
    },
    [onParsed],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
      e.target.value = "";
    },
    [parseFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile],
  );

  // ── Empty / Loading states ──

  if (!result && !parsing) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-secondary/30 py-16 px-8 cursor-pointer transition-colors w-full"
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="font-mono text-sm text-muted-foreground">
            Drop an <span className="text-foreground font-semibold">.als</span> file to analyze your project
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/60">
            We'll extract instruments, effects, settings — then compare with your inventory
          </p>
          <input ref={fileRef} type="file" accept=".als" className="hidden" onChange={handleFileInput} />
        </div>
        {error && <p className="text-destructive font-mono text-xs">{error}</p>}
      </div>
    );
  }

  if (parsing) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="font-mono text-xs text-muted-foreground">Parsing {fileName}…</p>
      </div>
    );
  }

  if (!result) return null;

  const tracksWithDevices = result.tracks.filter((t) => t.devices.length > 0);

  // ── Parsed result view ──

  return (
    <div className="space-y-4">
      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3">
        {result.tempo && <MetadataCard icon={<Clock className="h-4 w-4" />} value={result.tempo} label="BPM" />}
        {result.timeSignature && (
          <MetadataCard icon={<Hash className="h-4 w-4" />} value={result.timeSignature} label="Time Sig" />
        )}
        {result.key && <MetadataCard icon={<KeyRound className="h-4 w-4" />} value={result.key} label="Key" />}
        <MetadataCard icon={<Music2 className="h-4 w-4" />} value={result.trackCount} label="Tracks" />
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        {result.plugins.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Plug className="h-3 w-3 text-primary" />
            <span className="font-mono text-[10px] text-muted-foreground">
              {result.plugins.length} plugin{result.plugins.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        {result.abletonDevices.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-primary" />
            <span className="font-mono text-[10px] text-muted-foreground">
              {result.abletonDevices.length} native device{result.abletonDevices.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Per-track breakdown */}
      {tracksWithDevices.length > 0 && (
        <div>
          <h3 className="font-mono text-xs font-semibold text-foreground mb-2">Track Device Chains</h3>
          <div className="space-y-0.5 rounded-lg border border-border/30 bg-secondary/10 p-1">
            {tracksWithDevices.map((track, i) => (
              <TrackRow key={i} track={track} ownedSet={ownedSet} />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 font-mono text-xs" onClick={onReset}>
          Parse Another Project
        </Button>
        {onOpenInStudio && (
          <Button size="sm" className="flex-1 font-mono text-xs gap-1.5" onClick={onOpenInStudio}>
            <Music2 className="h-3 w-3" /> Open in Studio
          </Button>
        )}
      </div>
    </div>
  );
}
