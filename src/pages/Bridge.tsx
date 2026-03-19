import { usePluginHost } from "@/hooks/usePluginHost";
import { useInventory } from "@/hooks/useInventory";
import {
  Radio, Wifi, WifiOff,
  HardDrive, FileUp, Layers, Activity, AlertTriangle,
  Cpu, Settings, Heart, Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SystemStatusView } from "@/components/bridge/SystemStatusView";
import { PluginLibraryView } from "@/components/bridge/PluginLibraryView";
import { ManifestImportView } from "@/components/bridge/ManifestImportView";
import { ChainLoadView } from "@/components/bridge/ChainLoadView";
import { PreviewRenderView } from "@/components/bridge/PreviewRenderView";
import { DiagnosticsView } from "@/components/bridge/DiagnosticsView";
import { WorkflowView } from "@/components/bridge/WorkflowView";
import {
  ProductMetaPill,
  ProductPageHeader,
  ProductShell,
} from "@/components/app/ProductShell";

import type { ConnectionStatus } from "@/hooks/usePluginHost";

/* ── Connection indicator ────────────────────────────────── */

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const connected = status === "connected";
  return (
    <div className={`flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs ${
      connected
        ? "border-primary/30 bg-primary/10 text-primary"
        : "border-destructive/30 bg-destructive/10 text-destructive"
    }`}>
      {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {connected ? "Connected" : status === "connecting" ? "Connecting…" : "Offline"}
      <span className={`ml-1 h-2 w-2 rounded-full ${connected ? "bg-primary animate-pulse" : "bg-destructive"}`} />
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */

export default function Bridge() {
  const [state, actions] = usePluginHost();
  const { items: inventoryItems } = useInventory();

  const connected = state.connection === "connected";

  return (
    <ProductShell
      section="Bridge"
      title="Native host control"
      description="Bridge is the desktop host control surface for plugins, rendering, diagnostics, and connected runtime state."
      contentClassName="px-0 py-0 md:px-0 md:py-0"
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="px-4 pt-4 md:px-6">
          <ProductPageHeader
            eyebrow="Bridge"
            title="Control the native host path"
            description="Use Bridge to inspect host status, scan plugins, import chain manifests, and verify the connected runtime without breaking the product shell."
            meta={
              <>
                {state.health ? <ProductMetaPill>{state.health.sampleRate / 1000}kHz</ProductMetaPill> : null}
                {state.health ? <ProductMetaPill>buf:{state.health.bufferSize}</ProductMetaPill> : null}
                {state.health ? <ProductMetaPill>{state.health.pluginCount} plugins</ProductMetaPill> : null}
              </>
            }
            actions={<ConnectionBadge status={state.connection} />}
          />
        </div>

        <Tabs defaultValue="workflow" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b px-4 bg-chrome">
          <TabsList className="h-9 bg-transparent gap-1 p-0">
            <TabsTrigger value="workflow" className="font-mono text-xs gap-1.5 data-[state=active]:bg-secondary rounded-b-none border-b-2 data-[state=active]:border-primary border-transparent px-3">
              <Workflow className="h-3.5 w-3.5" /> Workflow
            </TabsTrigger>
            <TabsTrigger value="status" className="font-mono text-xs gap-1.5 data-[state=active]:bg-secondary rounded-b-none border-b-2 data-[state=active]:border-primary border-transparent px-3">
              <Heart className="h-3.5 w-3.5" /> Status
            </TabsTrigger>
            <TabsTrigger value="library" className="font-mono text-xs gap-1.5 data-[state=active]:bg-secondary rounded-b-none border-b-2 data-[state=active]:border-primary border-transparent px-3">
              <HardDrive className="h-3.5 w-3.5" /> Library
              {state.plugins.length > 0 && (
                <Badge variant="secondary" className="font-mono text-[9px] ml-0.5">{state.plugins.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="import" className="font-mono text-xs gap-1.5 data-[state=active]:bg-secondary rounded-b-none border-b-2 data-[state=active]:border-primary border-transparent px-3">
              <FileUp className="h-3.5 w-3.5" /> Import
            </TabsTrigger>
            <TabsTrigger value="chain" className="font-mono text-xs gap-1.5 data-[state=active]:bg-secondary rounded-b-none border-b-2 data-[state=active]:border-primary border-transparent px-3">
              <Layers className="h-3.5 w-3.5" /> Chain
              {state.chainResult && (
                <Badge variant={state.chainResult.errorCount > 0 ? "destructive" : "default"} className="font-mono text-[9px] ml-0.5">
                  {state.chainResult.loadedCount}/{state.chainResult.nodeCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="render" className="font-mono text-xs gap-1.5 data-[state=active]:bg-secondary rounded-b-none border-b-2 data-[state=active]:border-primary border-transparent px-3">
              <Activity className="h-3.5 w-3.5" /> Render
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="font-mono text-xs gap-1.5 data-[state=active]:bg-secondary rounded-b-none border-b-2 data-[state=active]:border-primary border-transparent px-3">
              <AlertTriangle className="h-3.5 w-3.5" /> Diag
              {state.errors.length > 0 && (
                <Badge variant="destructive" className="font-mono text-[9px] ml-0.5">{state.errors.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="workflow" className="flex-1 m-0 min-h-0">
          <WorkflowView
            connection={state.connection}
            plugins={state.plugins}
            inventoryItems={inventoryItems || []}
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="status" className="flex-1 m-0 min-h-0 overflow-auto">
          <SystemStatusView
            connection={state.connection}
            health={state.health}
            lastHealthCheck={state.lastHealthCheck}
            onCheckHealth={actions.checkHealth}
            onSetBaseUrl={actions.setBaseUrl}
          />
        </TabsContent>

        <TabsContent value="library" className="flex-1 m-0 min-h-0">
          <PluginLibraryView
            plugins={state.plugins}
            loading={state.pluginsLoading}
            scanning={state.scanning}
            connected={connected}
            onFetch={actions.fetchPlugins}
            onScan={() => actions.triggerScan()}
          />
        </TabsContent>

        <TabsContent value="import" className="flex-1 m-0 min-h-0">
          <ManifestImportView
            connected={connected}
            loading={state.chainLoading}
            onLoadChain={actions.loadChain}
          />
        </TabsContent>

        <TabsContent value="chain" className="flex-1 m-0 min-h-0">
          <ChainLoadView
            chainResult={state.chainResult}
            loading={state.chainLoading}
            connected={connected}
            onLoadChain={actions.loadChain}
          />
        </TabsContent>

        <TabsContent value="render" className="flex-1 m-0 min-h-0">
          <PreviewRenderView
            renderResult={state.renderResult}
            renderRequestId={state.renderRequestId}
            renderEnvelopeElapsed={state.renderEnvelopeElapsed}
            renderError={state.renderError}
            rendering={state.rendering}
            connected={connected}
            hasChain={!!state.chainResult}
            chainId={state.chainResult?.chainId}
            chainName={state.chainResult?.name}
            chainNodes={state.chainResult?.nodes}
            onRender={actions.renderPreview}
          />
        </TabsContent>

        <TabsContent value="diagnostics" className="flex-1 m-0 min-h-0">
          <DiagnosticsView
            diagnostics={state.diagnostics}
            onClear={actions.clearDiagnostics}
          />
        </TabsContent>
      </Tabs>
      </div>
    </ProductShell>
  );
}
