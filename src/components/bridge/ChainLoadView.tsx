import { useState } from "react";
import { Layers, CheckCircle, XCircle, AlertTriangle, Upload, Cpu, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChainLoadResponse, ChainLoadRequest } from "@/services/pluginHostClient";

interface ChainLoadViewProps {
  chainResult: ChainLoadResponse | null;
  loading: boolean;
  connected: boolean;
  onLoadChain: (req: ChainLoadRequest) => void;
}

function NodeStatusIcon({ status }: { status: string }) {
  if (status === "loaded") return <CheckCircle className="h-3.5 w-3.5 text-primary" />;
  if (status === "missing") return <AlertTriangle className="h-3.5 w-3.5 text-accent" />;
  return <XCircle className="h-3.5 w-3.5 text-destructive" />;
}

export function ChainLoadView({ chainResult, loading, connected, onLoadChain }: ChainLoadViewProps) {
  const [mode, setMode] = useState<"path" | "json">("path");
  const [manifestPath, setManifestPath] = useState("");
  const [manifestJson, setManifestJson] = useState("");

  const handleSubmit = () => {
    if (mode === "path" && manifestPath.trim()) {
      onLoadChain({ manifestPath: manifestPath.trim() });
    } else if (mode === "json" && manifestJson.trim()) {
      try {
        const parsed = JSON.parse(manifestJson);
        onLoadChain({ manifest: parsed });
      } catch {
        // JSON parse error — let it fail at the UI level
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Input form */}
      <div className="border-b p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">Load Plugin Chain</span>
          <div className="ml-auto flex gap-1">
            <Button size="sm" variant={mode === "path" ? "default" : "outline"} className="h-7 font-mono text-[10px]"
              onClick={() => setMode("path")}>File Path</Button>
            <Button size="sm" variant={mode === "json" ? "default" : "outline"} className="h-7 font-mono text-[10px]"
              onClick={() => setMode("json")}>JSON</Button>
          </div>
        </div>

        {mode === "path" ? (
          <div className="flex gap-2">
            <Input value={manifestPath} onChange={e => setManifestPath(e.target.value)}
              placeholder="/path/to/manifest.json" className="h-8 font-mono text-xs flex-1" />
            <Button size="sm" className="h-8 gap-1.5 font-mono text-xs" onClick={handleSubmit}
              disabled={loading || !connected || !manifestPath.trim()}>
              <Upload className="h-3 w-3" /> {loading ? "Loading…" : "Load"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea value={manifestJson} onChange={e => setManifestJson(e.target.value)}
              placeholder='{"name": "My Chain", "nodes": [...]}' rows={6}
              className="font-mono text-xs resize-none" />
            <Button size="sm" className="h-8 gap-1.5 font-mono text-xs" onClick={handleSubmit}
              disabled={loading || !connected || !manifestJson.trim()}>
              <Upload className="h-3 w-3" /> {loading ? "Loading…" : "Load"}
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        {chainResult ? (
          <div className="p-4 space-y-4">
            {/* Summary bar */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-mono text-sm font-bold text-foreground">{chainResult.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">Chain ID: {chainResult.chainId}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default" className="font-mono text-[10px] gap-1">
                    <CheckCircle className="h-3 w-3" /> {chainResult.loadedCount} loaded
                  </Badge>
                  {chainResult.missingCount > 0 && (
                    <Badge variant="secondary" className="font-mono text-[10px] gap-1 text-accent">
                      <AlertTriangle className="h-3 w-3" /> {chainResult.missingCount} missing
                    </Badge>
                  )}
                  {chainResult.errorCount > 0 && (
                    <Badge variant="destructive" className="font-mono text-[10px] gap-1">
                      <XCircle className="h-3 w-3" /> {chainResult.errorCount} errors
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 font-mono text-[10px]">
                <div><span className="text-muted-foreground">Sample Rate</span><br /><span className="text-foreground font-semibold">{chainResult.sampleRate} Hz</span></div>
                <div><span className="text-muted-foreground">Block Size</span><br /><span className="text-foreground font-semibold">{chainResult.blockSize}</span></div>
                <div><span className="text-muted-foreground">Total Latency</span><br /><span className="text-foreground font-semibold">{chainResult.totalLatencySamples} smp</span></div>
                <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Elapsed</span><br /><span className="text-foreground font-semibold">{chainResult.elapsedMs}ms</span></div>
              </div>
            </div>

            {/* Node list */}
            <div>
              <p className="font-mono text-[10px] text-muted-foreground font-semibold mb-2 uppercase">Signal Chain Nodes</p>
              <div className="space-y-1.5">
                {chainResult.nodes.map((node, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${
                    node.status === "loaded" ? "border-border bg-card" :
                    node.status === "missing" ? "border-accent/30 bg-accent/5" :
                    "border-destructive/30 bg-destructive/5"
                  }`}>
                    <span className="font-mono text-[10px] text-muted-foreground font-bold w-6 text-right">{node.index}</span>
                    <NodeStatusIcon status={node.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-foreground">{node.pluginName}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{node.vendor}</span>
                        <Badge variant="outline" className="font-mono text-[9px]">{node.format}</Badge>
                        {node.bypass && <Badge variant="outline" className="font-mono text-[9px] text-muted-foreground">BYP</Badge>}
                        {node.stateRestored && <Badge variant="secondary" className="font-mono text-[9px]">STATE</Badge>}
                      </div>
                      {node.error && (
                        <p className="font-mono text-[10px] text-destructive mt-0.5">{node.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground shrink-0">
                      <span>{node.paramCount} params</span>
                      {node.latencySamples > 0 && <span>{node.latencySamples} smp</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw JSON */}
            <details className="rounded-lg border border-border">
              <summary className="cursor-pointer px-4 py-2 font-mono text-[10px] text-muted-foreground hover:text-foreground">
                Raw Response JSON
              </summary>
              <pre className="px-4 py-3 font-mono text-[10px] text-muted-foreground overflow-x-auto bg-secondary/30 border-t">
                {JSON.stringify(chainResult, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <Layers className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="font-mono text-sm text-muted-foreground">No chain loaded</p>
            <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
              Provide a manifest path or JSON to load a plugin chain
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
