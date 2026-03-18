import {
  ArrowLeft, Cpu, Music, AlertTriangle, CheckCircle, XCircle, Ban,
  Clock, HardDrive, Plug, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { HostPlugin } from "@/services/pluginHostClient";

interface PluginDetailViewProps {
  plugin: HostPlugin;
  onBack: () => void;
}

/* ── Helpers ── */

function Row({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={`text-foreground text-right ${mono ? "font-mono text-xs" : "text-xs"}`}>{value}</span>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-1">
      <div className="h-px flex-1 bg-border" />
      <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest shrink-0">{children}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status || status === "ok") {
    return <Badge variant="default" className="font-mono text-[10px] gap-1"><CheckCircle className="h-3 w-3" /> OK</Badge>;
  }
  if (status === "warning") {
    return <Badge variant="secondary" className="font-mono text-[10px] gap-1 text-[hsl(var(--warning))]"><AlertTriangle className="h-3 w-3" /> Warning</Badge>;
  }
  if (status === "quarantined") {
    return <Badge variant="destructive" className="font-mono text-[10px] gap-1"><Ban className="h-3 w-3" /> Quarantined</Badge>;
  }
  return <Badge variant="destructive" className="font-mono text-[10px] gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>;
}

function BusCount({ label, count }: { label: string; count?: number }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 px-3 py-2 text-center">
      <p className="font-mono text-lg font-bold text-foreground">{count ?? "—"}</p>
      <p className="font-mono text-[9px] text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

const STAGE_LABELS: Record<string, string> = {
  scan: "SCAN",
  load: "LOAD",
  render: "RENDER",
  "state-restore": "STATE",
  parameter: "PARAM",
};

/* ── Component ── */

export function PluginDetailView({ plugin, onBack }: PluginDetailViewProps) {
  const isInstrument = plugin.category === "Instrument";
  const scanOk = !plugin.scanStatus || plugin.scanStatus === "ok";
  const failures = plugin.failureHistory ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b px-4 py-2.5">
        <Button size="sm" variant="ghost" className="h-7 gap-1 font-mono text-xs" onClick={onBack}>
          <ArrowLeft className="h-3 w-3" /> Library
        </Button>
        <div className={`flex h-8 w-8 items-center justify-center rounded-md shrink-0 ${
          isInstrument ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"
        }`}>
          {isInstrument ? <Music className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-foreground truncate">{plugin.name}</span>
            <Badge variant="outline" className="font-mono text-[10px]">{plugin.format}</Badge>
            <StatusBadge status={plugin.scanStatus} />
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">{plugin.vendor} · {plugin.version}</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 max-w-3xl mx-auto space-y-5">

          {/* ── Identity ── */}
          <div className="rounded-lg border border-border bg-card p-4">
            <SectionHeader>Identity</SectionHeader>
            <Row label="Name" value={plugin.name} />
            <Row label="Manufacturer" value={plugin.vendor} />
            <Row label="Format" value={<Badge variant="outline" className="font-mono text-[10px]">{plugin.format}</Badge>} />
            <Row label="Version" value={plugin.version} />
            <Row label="Category" value={
              <Badge className={`font-mono text-[10px] ${isInstrument ? "bg-primary/15 text-primary border-0" : "bg-accent/15 text-accent border-0"}`}>
                {plugin.category}
              </Badge>
            } />
            <Row label="Plugin ID" value={<span className="text-muted-foreground">{plugin.id}</span>} />
            <Row label="Path" value={<span className="text-[10px] text-muted-foreground break-all">{plugin.path}</span>} />
            {plugin.tags.length > 0 && (
              <Row label="Tags" value={
                <div className="flex gap-1 flex-wrap justify-end">
                  {plugin.tags.map(t => <Badge key={t} variant="secondary" className="font-mono text-[9px] px-1.5 py-0">{t}</Badge>)}
                </div>
              } />
            )}
          </div>

          {/* ── I/O & Capabilities ── */}
          <div className="rounded-lg border border-border bg-card p-4">
            <SectionHeader>I/O &amp; Capabilities</SectionHeader>

            <div className="grid grid-cols-4 gap-2 my-3">
              <BusCount label="Audio In" count={plugin.numAudioInputs} />
              <BusCount label="Audio Out" count={plugin.numAudioOutputs} />
              <BusCount label="MIDI In" count={plugin.numMidiInputs} />
              <BusCount label="MIDI Out" count={plugin.numMidiOutputs} />
            </div>

            <Row label="Latency" value={
              plugin.latencySamples > 0
                ? <span>{plugin.latencySamples} <span className="text-muted-foreground">samples</span></span>
                : <span className="text-muted-foreground">0 (zero latency)</span>
            } />
            <Row label="MIDI Support" value={
              plugin.supportsMidi !== undefined
                ? plugin.supportsMidi
                  ? <span className="text-primary">● Yes</span>
                  : <span className="text-muted-foreground">● No</span>
                : <span className="text-muted-foreground/50">Unknown</span>
            } />
            <Row label="State Restore" value={
              plugin.supportsStateRestore
                ? <span className="text-primary">● Supported</span>
                : <span className="text-destructive">● Not supported</span>
            } />
          </div>

          {/* ── Scan & Install Status ── */}
          <div className="rounded-lg border border-border bg-card p-4">
            <SectionHeader>Scan Status</SectionHeader>
            <Row label="Installed" value={
              plugin.installed
                ? <span className="text-primary">● Installed</span>
                : <span className="text-destructive">● Missing</span>
            } />
            <Row label="Scan Status" value={<StatusBadge status={plugin.scanStatus} />} />
            <Row label="Last Scanned" value={
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                {new Date(plugin.lastScanned).toLocaleString()}
              </span>
            } />
            {plugin.scanError && (
              <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                <p className="font-mono text-[10px] text-destructive">{plugin.scanError}</p>
              </div>
            )}
          </div>

          {/* ── Quarantine ── */}
          <div className={`rounded-lg border p-4 ${
            plugin.quarantined
              ? "border-destructive/40 bg-destructive/5"
              : "border-border bg-card"
          }`}>
            <SectionHeader>Quarantine</SectionHeader>
            {plugin.quarantined ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Ban className="h-4 w-4 text-destructive" />
                  <span className="font-mono text-xs font-bold text-destructive">QUARANTINED</span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {plugin.quarantineReason || "This plugin has been quarantined due to repeated failures. It will be skipped during scan and load unless explicitly requested."}
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">Not quarantined — plugin operates normally.</span>
              </div>
            )}
            <p className="font-mono text-[9px] text-muted-foreground/50 mt-2">
              Quarantine management will be available when the backend exposes /plugins/quarantine endpoints.
            </p>
          </div>

          {/* ── Failure History ── */}
          <div className="rounded-lg border border-border bg-card p-4">
            <SectionHeader>Failure History</SectionHeader>
            {failures.length > 0 ? (
              <div className="space-y-1 mt-2">
                {failures.map((f, i) => (
                  <div key={i} className={`flex items-start gap-2.5 rounded-md border px-3 py-2 ${
                    f.recovered ? "border-border bg-secondary/20" : "border-destructive/30 bg-destructive/5"
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      {f.recovered
                        ? <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
                        : <XCircle className="h-3.5 w-3.5 text-destructive" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[9px]">{STAGE_LABELS[f.stage] || f.stage}</Badge>
                        <span className="font-mono text-[9px] text-muted-foreground/60 ml-auto">
                          {new Date(f.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5 break-all">{f.error}</p>
                    </div>
                    {f.recovered && (
                      <Badge variant="secondary" className="font-mono text-[9px] shrink-0">Recovered</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <Info className="h-3.5 w-3.5 text-muted-foreground/40" />
                <span className="font-mono text-[10px] text-muted-foreground">No failures recorded for this plugin.</span>
              </div>
            )}
            <p className="font-mono text-[9px] text-muted-foreground/50 mt-3">
              Failure history will be populated by the backend once /plugins/failures is implemented.
            </p>
          </div>

          {/* ── Raw data ── */}
          <details className="rounded-lg border border-border">
            <summary className="cursor-pointer px-4 py-2 font-mono text-[10px] text-muted-foreground hover:text-foreground">
              Raw Plugin JSON
            </summary>
            <pre className="px-4 py-3 font-mono text-[10px] text-muted-foreground overflow-x-auto bg-secondary/30 border-t">
              {JSON.stringify(plugin, null, 2)}
            </pre>
          </details>
        </div>
      </ScrollArea>
    </div>
  );
}
