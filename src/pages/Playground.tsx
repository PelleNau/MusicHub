import { useState, useCallback } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Cable } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatchCanvas } from "@/components/playground/PatchCanvas";
import { GearPalette } from "@/components/playground/GearPalette";
import { ChatPanel } from "@/components/playground/ChatPanel";
import { CanvasNode, PatchCable, ECOSYSTEM_COLORS, NODE_WIDTH, NodeSetting } from "@/components/playground/types";
import { toast } from "sonner";

// Parse "Vendor Product {Key: Val, Key2: Val2}" format
function parseChainItem(raw: string): { name: string; settings: NodeSetting[] } {
  const match = raw.match(/^(.+?)\s*\{(.+)\}\s*$/);
  if (!match) return { name: raw.trim(), settings: [] };
  const name = match[1].trim();
  const settingsStr = match[2];
  const settings: NodeSetting[] = [];
  // Split by comma but be careful with values that might contain commas
  const pairs = settingsStr.split(/,\s*(?=[A-Za-z])/);
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(":");
    if (colonIdx === -1) continue;
    settings.push({
      label: pair.slice(0, colonIdx).trim(),
      value: pair.slice(colonIdx + 1).trim(),
    });
  }
  return { name, settings };
}

const Playground = () => {
  const { items } = useInventory();

  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [cables, setCables] = useState<PatchCable[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const handleDropGear = useCallback((inventoryId: string, x: number, y: number) => {
    const item = items.find(i => i.id === inventoryId);
    if (!item) return;
    if (nodes.some(n => n.inventoryId === inventoryId)) return;
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      inventoryId,
      label: `${item.vendor} ${item.product}`,
      subtitle: `${item.category} · ${item.type}`,
      ecosystem: item.ecosystem,
      x, y,
      color: ECOSYSTEM_COLORS[item.ecosystem] || "hsl(0,0%,40%)",
    };
    setNodes(prev => [...prev, newNode]);
  }, [items, nodes]);

  const handleBuildChain = useCallback((gearNames: string[]) => {
    const startX = 80;
    const startY = 200;
    const spacingX = NODE_WIDTH + 100;
    const newNodes: CanvasNode[] = [];
    const newCables: PatchCable[] = [];
    let matched = 0;
    const unmatched: string[] = [];

    gearNames.forEach((raw, i) => {
      const { name, settings } = parseChainItem(raw);
      const nameLower = name.toLowerCase();

      const item = items.find(it => {
        const full = `${it.vendor} ${it.product}`.toLowerCase();
        return full === nameLower || full.includes(nameLower) || nameLower.includes(full);
      });

      if (!item) { unmatched.push(name); return; }

      const existing = nodes.find(n => n.inventoryId === item.id);
      const nodeId = existing?.id || `node-${Date.now()}-${i}`;

      if (!existing) {
        newNodes.push({
          id: nodeId,
          inventoryId: item.id,
          label: `${item.vendor} ${item.product}`,
          subtitle: `${item.category} · ${item.type}`,
          ecosystem: item.ecosystem,
          x: startX + matched * spacingX,
          y: startY + (matched % 2 === 1 ? 50 : 0),
          color: ECOSYSTEM_COLORS[item.ecosystem] || "hsl(0,0%,40%)",
          settings,
        });
      } else if (settings.length > 0) {
        // Update existing node with settings
        setNodes(prev => prev.map(n => n.id === existing.id ? { ...n, settings } : n));
      }

      if (matched > 0) {
        const allNodes = [...nodes, ...newNodes];
        const currentNode = existing || newNodes[newNodes.length - 1];
        const prevNode = allNodes.length >= 2 ? allNodes[allNodes.length - 2] : allNodes[allNodes.length - 1];
        if (prevNode && currentNode && prevNode.id !== currentNode.id) {
          newCables.push({
            id: `cable-${Date.now()}-${i}`,
            fromNodeId: prevNode.id,
            toNodeId: currentNode.id,
            fromPort: "out",
            toPort: "in",
          });
        }
      }
      matched++;
    });

    if (newNodes.length > 0) setNodes(prev => [...prev, ...newNodes]);
    if (newCables.length > 0) setCables(prev => [...prev, ...newCables]);
    if (matched > 0) toast.success(`Built chain: ${matched} items on canvas`);
    if (unmatched.length > 0) toast.warning(`Could not find: ${unmatched.join(", ")}`);
  }, [items, nodes]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background pb-20">
      <header className="flex items-center justify-between border-b border-border px-3 py-2 shrink-0 bg-chrome">
        <div className="flex items-center gap-2">
          <Cable className="h-4 w-4 text-primary" />
          <h1 className="font-mono text-sm font-semibold tracking-tight text-foreground">PATCH LAB</h1>
          <span className="font-mono text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
            {nodes.length} on canvas
          </span>
        </div>
        <div className="flex items-center gap-1">
          {nodes.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => { setNodes([]); setCables([]); setSelectedNodeId(null); }}
              className="font-mono text-[10px] text-muted-foreground h-7 px-2">Clear</Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <GearPalette items={items} />
        <div className="flex-1 overflow-hidden bg-background">
          <PatchCanvas
            nodes={nodes} cables={cables}
            onNodesChange={setNodes} onCablesChange={setCables}
            onDropGear={handleDropGear} onNodeSelect={setSelectedNodeId}
            selectedNodeId={selectedNodeId}
          />
        </div>
        <ChatPanel
          isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)}
          canvasContext={{ nodes, cables }} onBuildChain={handleBuildChain}
        />
      </div>
    </div>
  );
};

export default Playground;
