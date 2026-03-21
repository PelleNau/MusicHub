/**
 * WorkflowView — unified 5-stage pipeline:
 * Import → Match → Load → Render → Analyze
 */

import { useState, useCallback, useRef } from "react";
import {
  Upload, GitCompare, Layers, Activity, Brain,
  ChevronRight, CheckCircle2, Loader2, Circle,
  RotateCcw, Play, XCircle, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

import { MatchReportView } from "@/components/bridge/MatchReportView";
import { matchProject, type ProjectMatchReport } from "@/lib/pluginMatcher";
import { generateManifests, type GeneratedManifests, type ChainManifest } from "@/lib/manifestGenerator";

import type { AbletonParseResult } from "@/types/ableton";
import type { HostPlugin, ChainLoadResponse, RenderPreviewResponse } from "@/services/pluginHostClient";
import type { InventoryItem } from "@/types/inventory";
import type { PluginHostActions, ConnectionStatus } from "@/hooks/usePluginHost";

/* ── Stage definitions ── */

type Stage = "import" | "match" | "load" | "render" | "analyze";

const STAGES: { id: Stage; label: string; icon: React.ReactNode }[] = [
  { id: "import", label: "Import", icon: <Upload className="h-4 w-4" /> },
  { id: "match", label: "Match", icon: <GitCompare className="h-4 w-4" /> },
  { id: "load", label: "Load", icon: <Layers className="h-4 w-4" /> },
  { id: "render", label: "Render", icon: <Activity className="h-4 w-4" /> },
  { id: "analyze", label: "Analyze", icon: <Brain className="h-4 w-4" /> },
];

/* ── Track load/render result ── */

interface TrackResult {
  trackName: string;
  chainResult?: ChainLoadResponse;
  renderResult?: RenderPreviewResponse;
  error?: string;
}

/* ── Props ── */

export interface WorkflowViewProps {
  connection: ConnectionStatus;
  plugins: HostPlugin[];
  inventoryItems: InventoryItem[];
  actions: PluginHostActions;
}

/* ── Parse helper ── */

const PARSE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-ableton-project`;
const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-project`;

export function WorkflowView({ connection, plugins, inventoryItems, actions }: WorkflowViewProps) {
  const connected = connection === "connected";

  /* ── State ── */
  const [stage, setStage] = useState<Stage>("import");
  const [completedStages, setCompleted] = useState<Set<Stage>>(new Set());

  // Import
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<AbletonParseResult | null>(null);
  const [fileName, setFileName] = useState("");

  // Match
  const [matchReport, setMatchReport] = useState<ProjectMatchReport | null>(null);

  // Load
  const [manifests, setManifests] = useState<GeneratedManifests | null>(null);
  const [trackResults, setTrackResults] = useState<TrackResult[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // Render
  const [renderProgress, setRenderProgress] = useState(0);
  const [rendering, setRendering] = useState(false);

  // Analyze
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  /* ── Helpers ── */

  const markDone = (s: Stage) => setCompleted((prev) => new Set([...prev, s]));
  const advance = (next: Stage) => { setStage(next); };

  /* ── 1. Import ── */
  const parseFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".als")) {
      toast.error("Please upload an Ableton Live .als file");
      return;
    }
    setParsing(true);
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const resp = await fetch(PARSE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: buf,
      });
      if (!resp.ok) throw new Error("Parse failed");
      const data: AbletonParseResult = await resp.json();
      setParsed(data);
      markDone("import");
      advance("match");
      toast.success(`Parsed ${data.trackCount} tracks`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to parse project");
    } finally {
      setParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  /* ── 2. Match ── */
  const runMatch = useCallback(() => {
    if (!parsed) return;
    const report = matchProject(parsed.tracks, plugins, inventoryItems);
    setMatchReport(report);
    markDone("match");
    advance("load");

    // Generate manifests
    const gen = generateManifests(parsed.tracks, report.tracks);
    setManifests(gen);
  }, [parsed, plugins, inventoryItems]);

  /* ── 3. Load ── */
  const runLoad = useCallback(async () => {
    if (!manifests || manifests.manifests.length === 0) return;
    setLoading(true);
    setTrackResults([]);
    setLoadProgress(0);

    const results: TrackResult[] = [];
    for (let i = 0; i < manifests.manifests.length; i++) {
      const m = manifests.manifests[i];
      try {
        const res = await actions.loadChain({ manifest: m as unknown as object });
        // Access the chain result from the hook — we need direct access
        // For now, store the manifest info as a placeholder
        results.push({ trackName: m.trackName, chainResult: undefined });
      } catch (e: unknown) {
        results.push({ trackName: m.trackName, error: e instanceof Error ? e.message : "Load failed" });
      }
      setLoadProgress(((i + 1) / manifests.manifests.length) * 100);
      setTrackResults([...results]);
    }

    markDone("load");
    advance("render");
    setLoading(false);
  }, [manifests, actions]);

  /* ── 4. Render ── */
  const runRender = useCallback(async () => {
    setRendering(true);
    setRenderProgress(0);

    // Render preview for each loaded chain
    const total = trackResults.filter((r) => !r.error).length || 1;
    let done = 0;
    for (const tr of trackResults) {
      if (tr.error) continue;
      try {
        await actions.renderPreview({ inputType: "midi", midiNote: 60, midiVelocity: 100, durationMs: 2000 });
      } catch {
        // Diagnostic render failures are non-fatal
      }
      done++;
      setRenderProgress((done / total) * 100);
    }

    markDone("render");
    advance("analyze");
    setRendering(false);
  }, [trackResults, actions]);

  /* ── 5. Analyze ── */
  const runAnalyze = useCallback(async () => {
    if (!parsed) return;
    setAnalysis("");
    setAnalyzing(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          parsedProject: parsed,
          matchReport: matchReport ? {
            totalDevices: matchReport.totalDevices,
            available: matchReport.available,
            alternatives: matchReport.alternatives,
            missing: matchReport.missing,
            tracks: matchReport.tracks.map((t) => ({
              trackName: t.trackName,
              matches: t.matches.map((m) => ({
                deviceName: m.device.name,
                status: m.status,
                matchedTo: m.hostMatch?.name || m.inventoryMatch?.product || null,
                confidence: m.confidence,
                reason: m.reason,
              })),
            })),
          } : undefined,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Analysis failed" }));
        toast.error(err.error || "Analysis failed");
        setAnalyzing(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, newlineIdx);
          buf = buf.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const p = JSON.parse(jsonStr);
            const content = p.choices?.[0]?.delta?.content as string | undefined;
            if (content) { fullText += content; setAnalysis(fullText); }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
      markDone("analyze");
    } catch (e: unknown) {
      if (!(e instanceof Error && e.name === "AbortError")) {
        console.error("Analysis error:", e);
        toast.error("Analysis failed");
      }
    } finally {
      setAnalyzing(false);
    }
  }, [parsed, matchReport]);

  /* ── Reset ── */
  const reset = useCallback(() => {
    setParsed(null);
    setMatchReport(null);
    setManifests(null);
    setTrackResults([]);
    setAnalysis("");
    setCompleted(new Set());
    setStage("import");
    setFileName("");
    abortRef.current?.abort();
  }, []);

  /* ── Stage indicator ── */
  const stageStatus = (s: Stage): "done" | "active" | "pending" => {
    if (completedStages.has(s)) return "done";
    if (s === stage) return "active";
    return "pending";
  };

  return (
    <div className="flex h-full flex-col">
      {/* Pipeline header */}
      <div className="flex items-center gap-1 border-b px-4 py-3 bg-card/50">
        {STAGES.map((s, i) => {
          const status = stageStatus(s.id);
          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => completedStages.has(s.id) && setStage(s.id)}
                disabled={!completedStages.has(s.id) && s.id !== stage}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs transition-colors ${
                  status === "active"
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : status === "done"
                    ? "bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
                    : "text-muted-foreground opacity-50 cursor-default"
                }`}
              >
                {status === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                ) : status === "active" ? (
                  s.icon
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                {s.label}
              </button>
              {i < STAGES.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/40" />
              )}
            </div>
          );
        })}
        <div className="flex-1" />
        <Button onClick={reset} variant="ghost" size="sm" className="font-mono text-xs gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      {/* Stage content */}
      <ScrollArea className="flex-1">
        <div className="p-4 max-w-4xl mx-auto space-y-4">
          {/* ── IMPORT ── */}
          {stage === "import" && (
            <Card className="p-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-lg p-12 hover:border-primary/50 transition-colors"
              >
                {parsing ? (
                  <>
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="font-mono text-sm text-muted-foreground">Parsing {fileName}…</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="font-mono text-sm text-foreground">Drop an Ableton .als file</p>
                      <p className="font-mono text-[11px] text-muted-foreground mt-1">
                        or{" "}
                        <label className="text-primary cursor-pointer hover:underline">
                          browse
                          <input type="file" accept=".als" className="hidden" onChange={handleFileInput} />
                        </label>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {parsed && (
                <div className="mt-4 grid grid-cols-4 gap-3 font-mono text-xs">
                  <div className="bg-secondary rounded-md p-3 text-center">
                    <div className="text-foreground font-semibold">{parsed.tempo || "—"}</div>
                    <div className="text-muted-foreground text-[10px]">BPM</div>
                  </div>
                  <div className="bg-secondary rounded-md p-3 text-center">
                    <div className="text-foreground font-semibold">{parsed.timeSignature || "—"}</div>
                    <div className="text-muted-foreground text-[10px]">Time Sig</div>
                  </div>
                  <div className="bg-secondary rounded-md p-3 text-center">
                    <div className="text-foreground font-semibold">{parsed.key || "—"}</div>
                    <div className="text-muted-foreground text-[10px]">Key</div>
                  </div>
                  <div className="bg-secondary rounded-md p-3 text-center">
                    <div className="text-foreground font-semibold">{parsed.trackCount}</div>
                    <div className="text-muted-foreground text-[10px]">Tracks</div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* ── MATCH ── */}
          {stage === "match" && parsed && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-mono text-sm font-semibold text-foreground">Plugin Matching</h2>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                    Cross-referencing {parsed.plugins.length} plugins against your library
                    {!connected && " (host offline — matching inventory only)"}
                  </p>
                </div>
                {!matchReport && (
                  <Button onClick={runMatch} size="sm" className="font-mono text-xs gap-1.5">
                    <Play className="h-3.5 w-3.5" /> Run Match
                  </Button>
                )}
              </div>

              {matchReport && <MatchReportView report={matchReport} />}

              {matchReport && (
                <div className="flex justify-end">
                  <Button onClick={() => advance("load")} size="sm" className="font-mono text-xs gap-1.5">
                    Continue to Load <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── LOAD ── */}
          {stage === "load" && manifests && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-mono text-sm font-semibold text-foreground">Chain Loading</h2>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                    {manifests.manifests.length} chains to load
                    {manifests.skipped.length > 0 && `, ${manifests.skipped.length} skipped`}
                  </p>
                </div>
                {!loading && trackResults.length === 0 && (
                  <Button onClick={runLoad} size="sm" disabled={!connected} className="font-mono text-xs gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Load Chains
                  </Button>
                )}
              </div>

              {!connected && (
                <Card className="p-4 border-destructive/30 bg-destructive/5">
                  <p className="font-mono text-xs text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Plugin host offline — connect to load chains
                  </p>
                </Card>
              )}

              {(loading || trackResults.length > 0) && (
                <div className="space-y-2">
                  <Progress value={loadProgress} className="h-2" />
                  <div className="rounded-lg border bg-card overflow-hidden">
                    {trackResults.map((tr, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2 border-b border-border last:border-0 font-mono text-xs">
                        {tr.error ? (
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        )}
                        <span className="text-foreground flex-1">{tr.trackName}</span>
                        {tr.error && <span className="text-destructive truncate max-w-[200px]">{tr.error}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {trackResults.length > 0 && !loading && (
                <div className="flex justify-end">
                  <Button onClick={() => advance("render")} size="sm" className="font-mono text-xs gap-1.5">
                    Continue to Render <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── RENDER ── */}
          {stage === "render" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-mono text-sm font-semibold text-foreground">Diagnostic Render</h2>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                    Render preview for each loaded chain to capture metrics
                  </p>
                </div>
                {!rendering && !completedStages.has("render") && (
                  <Button onClick={runRender} size="sm" disabled={!connected} className="font-mono text-xs gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Render All
                  </Button>
                )}
              </div>

              {(rendering || completedStages.has("render")) && (
                <div className="space-y-2">
                  <Progress value={renderProgress} className="h-2" />
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {rendering ? "Rendering…" : "Render complete"}
                  </p>
                </div>
              )}

              {completedStages.has("render") && (
                <div className="flex justify-end">
                  <Button onClick={() => advance("analyze")} size="sm" className="font-mono text-xs gap-1.5">
                    Continue to Analyze <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── ANALYZE ── */}
          {stage === "analyze" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-mono text-sm font-semibold text-foreground">AI Analysis</h2>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                    Get production feedback based on your project and gear
                  </p>
                </div>
                {!analyzing && !analysis && (
                  <Button onClick={runAnalyze} size="sm" className="font-mono text-xs gap-1.5">
                    <Brain className="h-3.5 w-3.5" /> Analyze
                  </Button>
                )}
                {analyzing && (
                  <Button onClick={() => { abortRef.current?.abort(); setAnalyzing(false); }} size="sm" variant="outline" className="font-mono text-xs">
                    Stop
                  </Button>
                )}
              </div>

              {(analyzing || analysis) && (
                <Card className="p-4">
                  {analyzing && !analysis && (
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating analysis…
                    </div>
                  )}
                  {analysis && (
                    <div className="prose prose-invert prose-sm max-w-none font-mono text-xs leading-relaxed">
                      <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
