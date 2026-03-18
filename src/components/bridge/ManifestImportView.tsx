import { useState } from "react";
import { FileUp, Folder, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ChainLoadRequest } from "@/services/pluginHostClient";

interface ManifestImportViewProps {
  connected: boolean;
  loading: boolean;
  onLoadChain: (req: ChainLoadRequest) => void;
}

export function ManifestImportView({ connected, loading, onLoadChain }: ManifestImportViewProps) {
  const [mode, setMode] = useState<"path" | "paste">("path");
  const [manifestPath, setManifestPath] = useState("");
  const [manifestJson, setManifestJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (mode === "path" && manifestPath.trim()) {
      onLoadChain({ manifestPath: manifestPath.trim() });
    } else if (mode === "paste" && manifestJson.trim()) {
      try {
        const parsed = JSON.parse(manifestJson);
        setJsonError(null);
        onLoadChain({ manifest: parsed });
      } catch (e) {
        setJsonError((e as Error).message);
      }
    }
  };

  const canSubmit = connected && !loading && (
    (mode === "path" && manifestPath.trim().length > 0) ||
    (mode === "paste" && manifestJson.trim().length > 0)
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full space-y-6">
        {/* Hero drop zone */}
        <div className="w-full rounded-lg border-2 border-dashed border-border bg-secondary/20 p-10 text-center transition-colors hover:border-primary/40 hover:bg-secondary/40">
          <FileUp className={`h-10 w-10 text-muted-foreground mx-auto mb-3 ${loading ? "animate-bounce" : ""}`} />
          <p className="font-mono text-sm font-semibold text-foreground">
            {loading ? "Loading manifest…" : "Import Project Manifest"}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">
            Provide a manifest file path or paste JSON directly
          </p>
          <div className="flex gap-2 justify-center mt-3">
            <Badge variant="outline" className="font-mono text-[10px]">manifest.json</Badge>
            <Badge variant="outline" className="font-mono text-[10px]">.als parser output</Badge>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 w-full">
          <Button size="sm" variant={mode === "path" ? "default" : "outline"} className="h-8 font-mono text-xs flex-1"
            onClick={() => setMode("path")}>
            <Folder className="h-3 w-3 mr-1.5" /> File Path
          </Button>
          <Button size="sm" variant={mode === "paste" ? "default" : "outline"} className="h-8 font-mono text-xs flex-1"
            onClick={() => setMode("paste")}>
            <FileUp className="h-3 w-3 mr-1.5" /> Paste JSON
          </Button>
        </div>

        {/* Input */}
        {mode === "path" ? (
          <div className="w-full space-y-2">
            <Input value={manifestPath} onChange={e => setManifestPath(e.target.value)}
              placeholder="/path/to/manifest.json" className="h-9 font-mono text-xs" />
            <p className="font-mono text-[10px] text-muted-foreground">
              Full path to the manifest JSON file on the local filesystem
            </p>
          </div>
        ) : (
          <div className="w-full space-y-2">
            <Textarea value={manifestJson} onChange={e => { setManifestJson(e.target.value); setJsonError(null); }}
              placeholder='{"name": "My Project", "sampleRate": 48000, "blockSize": 512, "nodes": [...]}'
              rows={10} className="font-mono text-xs resize-none" />
            {jsonError && (
              <p className="font-mono text-[10px] text-destructive">Parse error: {jsonError}</p>
            )}
          </div>
        )}

        <Button size="sm" className="h-9 gap-1.5 font-mono text-xs w-full" onClick={handleSubmit} disabled={!canSubmit}>
          <Upload className="h-3.5 w-3.5" /> {loading ? "Loading…" : "Load Manifest"}
        </Button>

        {!connected && (
          <p className="font-mono text-[10px] text-destructive">
            Plugin host is not connected. Start the service and check System Status.
          </p>
        )}
      </div>
    </div>
  );
}
