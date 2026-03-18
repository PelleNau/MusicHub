import { useState } from "react";
import {
  Play, Activity, AlertTriangle, VolumeX, Cpu, Clock,
  CheckCircle, XCircle, Hash, Layers, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RenderPreviewResponse, RenderPreviewRequest, ChainNode } from "@/services/pluginHostClient";

interface PreviewRenderViewProps {
  renderResult: RenderPreviewResponse | null;
  renderRequestId: string | null;
  renderEnvelopeElapsed: number | null;
  renderError: string | null;
  rendering: boolean;
  connected: boolean;
  hasChain: boolean;
  chainId?: string;
  chainName?: string;
  chainNodes?: ChainNode[];
  onRender: (req: RenderPreviewRequest) => void;
}

/* ── Waveform ── */

function Waveform({ peaks }: { peaks: number[] }) {
  if (!peaks.length) return null;
  const h = 80;
  const w = peaks.length;
  // Build filled area for a more professional look
  const upper = peaks.map((p, i) => `${i},${h / 2 - (p * h / 2)}`).join(" ");
  const lower = peaks.map((p, i) => `${i},${h / 2 + (p * h / 2)}`).reverse().join(" ");

  // Peak markers
  const maxPeak = Math.max(...peaks);
  const maxIdx = peaks.indexOf(maxPeak);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[80px] rounded-lg border border-border bg-[hsl(0,0%,8%)]" preserveAspectRatio="none">
        {/* Center line */}
        <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="hsl(0,0%,20%)" strokeWidth="0.5" />
        {/* Waveform fill */}
        <polygon points={`${upper} ${lower}`} fill="hsl(166,100%,50%)" opacity="0.15" />
        {/* Waveform stroke upper */}
        <polyline points={upper} fill="none" stroke="hsl(166,100%,50%)" strokeWidth="1" opacity="0.9" />
        {/* Waveform stroke lower */}
        <polyline points={peaks.map((p, i) => `${i},${h / 2 + (p * h / 2)}`).join(" ")} fill="none" stroke="hsl(166,100%,50%)" strokeWidth="1" opacity="0.5" />
        {/* Peak marker */}
        <line x1={maxIdx} y1={0} x2={maxIdx} y2={h} stroke="hsl(340,85%,60%)" strokeWidth="1" opacity="0.6" strokeDasharray="2,2" />
      </svg>
      <div className="absolute top-1 right-2 font-mono text-[9px] text-muted-foreground/60">
        peak @ sample {maxIdx} · {maxPeak.toFixed(3)}
      </div>
    </div>
  );
}

/* ── Meter ── */

function MeterBar({ label, value, max, warn, unit }: { label: string; value: number; max: number; warn?: boolean; unit?: string }) {
  const pct = Math.min((Math.abs(value) / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between font-mono text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={warn ? "text-accent" : "text-foreground"}>
          {value.toFixed(4)}{unit ? ` ${unit}` : ""}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all ${warn ? "bg-accent" : "bg-primary"}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── Section divider ── */

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-1">
      <div className="h-px flex-1 bg-border" />
      <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest shrink-0">{children}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/* ── dB conversion ── */
function toDb(linear: number): string {
  if (linear <= 0) return "-∞";
  const db = 20 * Math.log10(linear);
  return `${db >= 0 ? "+" : ""}${db.toFixed(1)} dB`;
}

/* ── Main ── */

export function PreviewRenderView({
  renderResult, renderRequestId, renderEnvelopeElapsed, renderError,
  rendering, connected, hasChain, chainId, chainName, chainNodes, onRender,
}: PreviewRenderViewProps) {
  const [inputType, setInputType] = useState<"impulse" | "midi" | "silence">("impulse");
  const [midiNote, setMidiNote] = useState("60");
  const [midiVelocity, setMidiVelocity] = useState("100");
  const [durationMs, setDurationMs] = useState("1000");

  const handleRender = () => {
    const req: RenderPreviewRequest = {
      chainId,
      inputType,
      durationMs: parseInt(durationMs) || 1000,
    };
    if (inputType === "midi") {
      req.midiNote = parseInt(midiNote) || 60;
      req.midiVelocity = parseInt(midiVelocity) || 100;
    }
    onRender(req);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Controls bar */}
      <div className="border-b p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">Preview Render</span>
          {!hasChain && (
            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">Load a chain first</Badge>
          )}
          {chainName && (
            <Badge variant="secondary" className="font-mono text-[10px] gap-1">
              <Layers className="h-3 w-3" /> {chainName}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="space-y-1">
            <label className="font-mono text-[10px] text-muted-foreground">Input</label>
            <Select value={inputType} onValueChange={v => setInputType(v as typeof inputType)}>
              <SelectTrigger className="h-8 w-32 font-mono text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="impulse" className="font-mono text-xs">Impulse</SelectItem>
                <SelectItem value="midi" className="font-mono text-xs">MIDI Note</SelectItem>
                <SelectItem value="silence" className="font-mono text-xs">Silence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inputType === "midi" && (
            <>
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-muted-foreground">Note</label>
                <Input value={midiNote} onChange={e => setMidiNote(e.target.value)}
                  className="h-8 w-16 font-mono text-xs" type="number" min="0" max="127" />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-muted-foreground">Velocity</label>
                <Input value={midiVelocity} onChange={e => setMidiVelocity(e.target.value)}
                  className="h-8 w-16 font-mono text-xs" type="number" min="1" max="127" />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="font-mono text-[10px] text-muted-foreground">Duration (ms)</label>
            <Input value={durationMs} onChange={e => setDurationMs(e.target.value)}
              className="h-8 w-24 font-mono text-xs" type="number" min="100" max="30000" />
          </div>

          <div className="pt-4">
            <Button size="sm" className="h-8 gap-1.5 font-mono text-xs" onClick={handleRender}
              disabled={rendering || !connected}>
              <Play className="h-3 w-3" /> {rendering ? "Rendering…" : "Render"}
            </Button>
          </div>
        </div>
      </div>

      {/* Results area */}
      <ScrollArea className="flex-1">
        {/* ── Render Error State ── */}
        {renderError && !renderResult && (
          <div className="p-4 max-w-3xl mx-auto space-y-4">
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-mono text-sm font-bold text-destructive mb-1">Render Failed</p>
                  <p className="font-mono text-xs text-muted-foreground mb-3">{renderError}</p>

                  <div className="rounded-md border border-border bg-card p-3 space-y-1.5 font-mono text-[10px]">
                    {renderRequestId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Request ID</span>
                        <span className="text-foreground">{renderRequestId}</span>
                      </div>
                    )}
                    {chainId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chain ID</span>
                        <span className="text-foreground">{chainId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Input Type</span>
                      <span className="text-foreground">{inputType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="text-foreground">{durationMs}ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="font-mono text-[10px] text-muted-foreground/50">
              Check the Diagnostics tab for detailed error logs. Common causes: plugin crash during render, timeout, missing plugin in chain.
            </p>
          </div>
        )}

        {/* ── Success Result ── */}
        {renderResult && (
          <div className="p-4 max-w-3xl mx-auto space-y-4">

            {/* Request context bar */}
            <div className="rounded-lg border border-border bg-card p-4">
              <SectionHeader>Request Context</SectionHeader>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-[10px]">
                <div>
                  <span className="text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> Request ID</span>
                  <p className="text-foreground font-semibold mt-0.5 truncate">{renderRequestId || renderResult.renderId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> Render ID</span>
                  <p className="text-foreground font-semibold mt-0.5 truncate">{renderResult.renderId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Render Time</span>
                  <p className="text-foreground font-semibold mt-0.5">{renderResult.elapsedMs}ms</p>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Total Elapsed</span>
                  <p className="text-foreground font-semibold mt-0.5">{renderEnvelopeElapsed ?? renderResult.elapsedMs}ms</p>
                </div>
              </div>
            </div>

            {/* Chain summary (if nodes available) */}
            {chainNodes && chainNodes.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <SectionHeader>Plugin Chain Used</SectionHeader>
                <div className="flex items-center gap-1 overflow-x-auto py-1">
                  {chainNodes.map((node, i) => (
                    <div key={i} className="flex items-center gap-1 shrink-0">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md border ${
                        node.status === "loaded" ? "border-primary/30 bg-primary/10 text-primary" :
                        node.status === "missing" ? "border-accent/30 bg-accent/10 text-accent" :
                        "border-destructive/30 bg-destructive/10 text-destructive"
                      }`}>
                        {node.pluginName}
                        {node.bypass && <span className="ml-1 text-muted-foreground">(byp)</span>}
                      </span>
                      {i < chainNodes.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-2 font-mono text-[10px] text-muted-foreground">
                  <span>{chainNodes.length} nodes</span>
                  <span>·</span>
                  <span>{chainNodes.filter(n => n.status === "loaded").length} loaded</span>
                  {chainNodes.some(n => n.status === "missing") && (
                    <><span>·</span><span className="text-accent">{chainNodes.filter(n => n.status === "missing").length} missing</span></>
                  )}
                  {chainNodes.some(n => n.status === "error") && (
                    <><span>·</span><span className="text-destructive">{chainNodes.filter(n => n.status === "error").length} errors</span></>
                  )}
                </div>
              </div>
            )}

            {/* Waveform */}
            {renderResult.waveformPeaks.length > 0 && (
              <div>
                <SectionHeader>Waveform Preview</SectionHeader>
                <Waveform peaks={renderResult.waveformPeaks} />
              </div>
            )}

            {/* Status alerts */}
            <div className="flex gap-2 flex-wrap">
              {renderResult.clipped && (
                <Badge variant="destructive" className="font-mono text-[10px] gap-1">
                  <AlertTriangle className="h-3 w-3" /> CLIPPED — output exceeds 0 dBFS
                </Badge>
              )}
              {renderResult.silentOutput && (
                <Badge variant="secondary" className="font-mono text-[10px] gap-1">
                  <VolumeX className="h-3 w-3" /> SILENT — no audio output detected
                </Badge>
              )}
              {!renderResult.clipped && !renderResult.silentOutput && (
                <Badge variant="default" className="font-mono text-[10px] gap-1">
                  <CheckCircle className="h-3 w-3" /> OK — render completed successfully
                </Badge>
              )}
            </div>

            {/* Summary Metrics */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <SectionHeader>Summary Metrics</SectionHeader>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-[10px]">
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <p className="text-foreground font-semibold">{renderResult.durationMs}ms</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sample Rate</span>
                  <p className="text-foreground font-semibold">{renderResult.sampleRate} Hz</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Channels</span>
                  <p className="text-foreground font-semibold">{renderResult.channels}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Peak (dB)</span>
                  <p className={`font-semibold ${renderResult.clipped ? "text-destructive" : "text-foreground"}`}>
                    {toDb(renderResult.peakAmplitude)}
                  </p>
                </div>
              </div>

              <MeterBar label="Peak Amplitude" value={renderResult.peakAmplitude} max={1.0} warn={renderResult.clipped} />
              <MeterBar label="RMS Level" value={renderResult.rmsLevel} max={1.0} />
              <MeterBar label="DC Offset" value={renderResult.dcOffset} max={0.1} warn={Math.abs(renderResult.dcOffset) > 0.01} unit="" />
            </div>

            {/* Per-plugin metrics */}
            {renderResult.perPluginMetrics.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <SectionHeader>Per-Plugin Render Metrics</SectionHeader>
                <div className="space-y-1 mt-2">
                  {renderResult.perPluginMetrics.map((m, i) => {
                    const hasIssue = m.clipped || m.silent;
                    return (
                      <div key={i} className={`rounded-md border px-3 py-2.5 ${
                        m.clipped ? "border-destructive/30 bg-destructive/5" :
                        m.silent ? "border-border bg-secondary/20 opacity-60" :
                        "border-border bg-secondary/10"
                      }`}>
                        <div className="flex items-center gap-3 font-mono text-[10px]">
                          <span className="text-muted-foreground font-bold w-5 text-right shrink-0">{m.index}</span>
                          <span className="text-foreground font-semibold flex-1 min-w-0 truncate">{m.pluginName}</span>
                          <span className="text-muted-foreground shrink-0">peak: {toDb(m.peakOut)}</span>
                          <span className="text-muted-foreground shrink-0">rms: {toDb(m.rmsOut)}</span>
                          <span className="text-muted-foreground flex items-center gap-1 shrink-0"><Cpu className="h-3 w-3" />{m.cpuTimeMs.toFixed(1)}ms</span>
                          {m.latencySamples > 0 && <span className="text-muted-foreground shrink-0">{m.latencySamples}smp</span>}
                          {m.clipped && <Badge variant="destructive" className="text-[9px]">CLIP</Badge>}
                          {m.silent && <Badge variant="outline" className="text-[9px]">SILENT</Badge>}
                        </div>
                        {hasIssue && (
                          <p className="font-mono text-[9px] text-muted-foreground/60 mt-1 ml-8">
                            {m.clipped ? "Output exceeded 0 dBFS at this stage — check gain staging before this plugin." : ""}
                            {m.silent ? "No signal detected at output — plugin may not be processing, or input is silent." : ""}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CPU breakdown summary */}
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between font-mono text-[10px]">
                  <span className="text-muted-foreground">Total plugin CPU time</span>
                  <span className="text-foreground font-semibold">
                    {renderResult.perPluginMetrics.reduce((sum, m) => sum + m.cpuTimeMs, 0).toFixed(1)}ms
                  </span>
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <details className="rounded-lg border border-border">
              <summary className="cursor-pointer px-4 py-2 font-mono text-[10px] text-muted-foreground hover:text-foreground">
                Raw Response JSON
              </summary>
              <pre className="px-4 py-3 font-mono text-[10px] text-muted-foreground overflow-x-auto bg-secondary/30 border-t whitespace-pre-wrap break-all">
                {JSON.stringify({ requestId: renderRequestId, envelopeElapsedMs: renderEnvelopeElapsed, ...renderResult }, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* ── Empty state ── */}
        {!renderResult && !renderError && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="font-mono text-sm text-muted-foreground">No render results</p>
            <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
              Configure input parameters and click Render to preview chain output
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
