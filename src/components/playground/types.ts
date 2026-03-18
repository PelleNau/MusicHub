export interface NodeSetting {
  label: string;
  value: string;
}

export interface CanvasNode {
  id: string;
  inventoryId: string;
  label: string;       // vendor + product
  subtitle: string;    // type / category
  ecosystem: string;
  x: number;
  y: number;
  color: string;       // accent color based on ecosystem
  settings?: NodeSetting[];
}

export interface PatchCable {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromPort: "out";
  toPort: "in";
}

export const ECOSYSTEM_COLORS: Record<string, string> = {
  Hardware: "hsl(166, 100%, 50%)",   // cyan / primary
  Ableton: "hsl(217, 90%, 60%)",     // blue
  Kontakt: "hsl(38, 90%, 55%)",      // amber
  Reaktor: "hsl(292, 70%, 60%)",     // fuchsia
  NI: "hsl(25, 90%, 55%)",           // orange
  Reason: "hsl(0, 80%, 58%)",        // red
};

export const NODE_WIDTH = 200;
export const NODE_BASE_HEIGHT = 56;
export const SETTING_ROW_HEIGHT = 16;
export const PORT_RADIUS = 7;

export function getNodeHeight(node: CanvasNode): number {
  const settingsCount = node.settings?.length || 0;
  return NODE_BASE_HEIGHT + (settingsCount > 0 ? 8 + settingsCount * SETTING_ROW_HEIGHT : 0);
}
