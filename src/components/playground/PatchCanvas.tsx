import { useRef, useState, useCallback } from "react";
import {
  CanvasNode,
  PatchCable,
  NODE_WIDTH,
  NODE_BASE_HEIGHT,
  PORT_RADIUS,
  ECOSYSTEM_COLORS,
  getNodeHeight,
} from "./types";

interface PatchCanvasProps {
  nodes: CanvasNode[];
  cables: PatchCable[];
  onNodesChange: (nodes: CanvasNode[]) => void;
  onCablesChange: (cables: PatchCable[]) => void;
  onDropGear: (inventoryId: string, x: number, y: number) => void;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

export function PatchCanvas({
  nodes, cables, onNodesChange, onCablesChange, onDropGear, onNodeSelect, selectedNodeId,
}: PatchCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{ nodeId: string; offsetX: number; offsetY: number } | null>(null);
  const [cabling, setCabling] = useState<{ fromNodeId: string; mouseX: number; mouseY: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const getSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: clientX - rect.left - pan.x, y: clientY - rect.top - pan.y };
  }, [pan]);

  const startDrag = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const pt = getSvgPoint(e.clientX, e.clientY);
    setDragging({ nodeId, offsetX: pt.x - node.x, offsetY: pt.y - node.y });
    onNodeSelect(nodeId);
  }, [nodes, getSvgPoint, onNodeSelect]);

  const startCable = useCallback((e: React.MouseEvent, fromNodeId: string) => {
    e.stopPropagation();
    const pt = getSvgPoint(e.clientX, e.clientY);
    setCabling({ fromNodeId, mouseX: pt.x, mouseY: pt.y });
  }, [getSvgPoint]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.current.x + panStart.current.panX,
        y: e.clientY - panStart.current.y + panStart.current.panY,
      });
      return;
    }
    if (dragging) {
      const pt = getSvgPoint(e.clientX, e.clientY);
      onNodesChange(nodes.map(n =>
        n.id === dragging.nodeId ? { ...n, x: pt.x - dragging.offsetX, y: pt.y - dragging.offsetY } : n
      ));
    }
    if (cabling) {
      const pt = getSvgPoint(e.clientX, e.clientY);
      setCabling(prev => prev ? { ...prev, mouseX: pt.x, mouseY: pt.y } : null);
    }
  }, [dragging, cabling, isPanning, nodes, getSvgPoint, onNodesChange]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isPanning) { setIsPanning(false); return; }
    if (cabling) {
      const pt = getSvgPoint(e.clientX, e.clientY);
      const target = nodes.find(n => {
        const h = getNodeHeight(n);
        return Math.hypot(pt.x - n.x, pt.y - (n.y + h / 2)) < PORT_RADIUS * 2.5;
      });
      if (target && target.id !== cabling.fromNodeId) {
        const exists = cables.some(c => c.fromNodeId === cabling.fromNodeId && c.toNodeId === target.id);
        if (!exists) {
          onCablesChange([...cables, {
            id: `cable-${Date.now()}`, fromNodeId: cabling.fromNodeId, toNodeId: target.id, fromPort: "out", toPort: "in",
          }]);
        }
      }
      setCabling(null);
    }
    setDragging(null);
  }, [cabling, cables, nodes, getSvgPoint, onCablesChange, isPanning]);

  const handleBgMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as SVGElement).classList?.contains("canvas-bg")) {
      onNodeSelect(null);
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
  }, [onNodeSelect, pan]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const inventoryId = e.dataTransfer.getData("inventoryId");
    if (!inventoryId) return;
    const pt = getSvgPoint(e.clientX, e.clientY);
    onDropGear(inventoryId, pt.x - NODE_WIDTH / 2, pt.y - NODE_BASE_HEIGHT / 2);
  }, [getSvgPoint, onDropGear]);

  const removeCable = useCallback((cableId: string) => {
    onCablesChange(cables.filter(c => c.id !== cableId));
  }, [cables, onCablesChange]);

  const removeNode = useCallback((nodeId: string) => {
    onNodesChange(nodes.filter(n => n.id !== nodeId));
    onCablesChange(cables.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) onNodeSelect(null);
  }, [nodes, cables, onNodesChange, onCablesChange, selectedNodeId, onNodeSelect]);

  const getCablePath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.5;
    const sag = Math.min(Math.abs(y2 - y1) * 0.15 + 20, 60);
    return `M${x1},${y1} C${x1 + dx},${y1 + sag} ${x2 - dx},${y2 + sag} ${x2},${y2}`;
  };

  return (
    <svg
      ref={svgRef}
      className="w-full h-full select-none"
      style={{ cursor: isPanning ? "grabbing" : dragging ? "grabbing" : "default" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleBgMouseDown}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"
          patternTransform={`translate(${pan.x % 40},${pan.y % 40})`}>
          <circle cx="20" cy="20" r="0.8" fill="hsl(0,0%,18%)" />
        </pattern>
      </defs>
      <rect className="canvas-bg" width="100%" height="100%" fill="url(#grid)" />

      <g transform={`translate(${pan.x},${pan.y})`}>
        {/* Cables */}
        {cables.map(cable => {
          const from = nodes.find(n => n.id === cable.fromNodeId);
          const to = nodes.find(n => n.id === cable.toNodeId);
          if (!from || !to) return null;
          const fromH = getNodeHeight(from);
          const toH = getNodeHeight(to);
          const x1 = from.x + NODE_WIDTH;
          const y1 = from.y + fromH / 2;
          const x2 = to.x;
          const y2 = to.y + toH / 2;
          const color = ECOSYSTEM_COLORS[from.ecosystem] || "hsl(0,0%,40%)";
          return (
            <g key={cable.id} className="group cursor-pointer" onClick={() => removeCable(cable.id)}>
              <path d={getCablePath(x1, y1, x2, y2)} fill="none" stroke={color} strokeWidth={3} strokeOpacity={0.7}
                className="transition-all group-hover:stroke-[5] group-hover:[stroke-opacity:1]" />
              <path d={getCablePath(x1, y1, x2, y2)} fill="none" stroke="transparent" strokeWidth={14} />
            </g>
          );
        })}

        {/* Active cable */}
        {cabling && (() => {
          const from = nodes.find(n => n.id === cabling.fromNodeId);
          if (!from) return null;
          const fromH = getNodeHeight(from);
          return (
            <path
              d={getCablePath(from.x + NODE_WIDTH, from.y + fromH / 2, cabling.mouseX, cabling.mouseY)}
              fill="none" stroke="hsl(166,100%,50%)" strokeWidth={2} strokeDasharray="6 4" strokeOpacity={0.6}
            />
          );
        })()}

        {/* Nodes */}
        {nodes.map(node => {
          const color = ECOSYSTEM_COLORS[node.ecosystem] || "hsl(0,0%,40%)";
          const isSelected = node.id === selectedNodeId;
          const h = getNodeHeight(node);
          const settings = node.settings || [];

          return (
            <g key={node.id} onMouseDown={(e) => startDrag(e, node.id)} style={{ cursor: "grab" }}>
              {/* Body */}
              <rect x={node.x} y={node.y} width={NODE_WIDTH} height={h} rx={8}
                fill="hsl(0,0%,10%)" stroke={isSelected ? color : "hsl(0,0%,20%)"} strokeWidth={isSelected ? 2 : 1} />
              {/* Accent bar */}
              <rect x={node.x} y={node.y} width={4} height={h} rx={2} fill={color} />

              {/* Label */}
              <text x={node.x + 14} y={node.y + 22} fill="hsl(0,0%,90%)" fontSize={11} fontFamily="monospace" fontWeight={600}>
                {node.label.length > 20 ? node.label.slice(0, 19) + "…" : node.label}
              </text>
              <text x={node.x + 14} y={node.y + 36} fill="hsl(0,0%,45%)" fontSize={9} fontFamily="monospace">
                {node.subtitle.length > 26 ? node.subtitle.slice(0, 25) + "…" : node.subtitle}
              </text>

              {/* Settings */}
              {settings.length > 0 && (
                <>
                  <line x1={node.x + 10} y1={node.y + 46} x2={node.x + NODE_WIDTH - 10} y2={node.y + 46}
                    stroke="hsl(0,0%,18%)" strokeWidth={0.5} />
                  {settings.map((s, si) => {
                    const sy = node.y + 60 + si * 16;
                    return (
                      <g key={si}>
                        <text x={node.x + 14} y={sy} fill="hsl(0,0%,42%)" fontSize={9} fontFamily="monospace">
                          {s.label}
                        </text>
                        <text x={node.x + NODE_WIDTH - 10} y={sy} fill={color} fontSize={9} fontFamily="monospace"
                          textAnchor="end" fontWeight={500}>
                          {s.value.length > 14 ? s.value.slice(0, 13) + "…" : s.value}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}

              {/* Input port */}
              <circle cx={node.x} cy={node.y + h / 2} r={PORT_RADIUS}
                fill="hsl(0,0%,14%)" stroke="hsl(0,0%,30%)" strokeWidth={1.5}
                className="hover:stroke-[hsl(166,100%,50%)] transition-colors cursor-crosshair" />
              <circle cx={node.x} cy={node.y + h / 2} r={2.5} fill="hsl(0,0%,35%)" pointerEvents="none" />

              {/* Output port */}
              <circle cx={node.x + NODE_WIDTH} cy={node.y + h / 2} r={PORT_RADIUS}
                fill="hsl(0,0%,14%)" stroke={color} strokeWidth={1.5}
                className="hover:fill-[hsl(166,100%,50%)] transition-colors cursor-crosshair"
                onMouseDown={(e) => { e.stopPropagation(); startCable(e, node.id); }} />
              <circle cx={node.x + NODE_WIDTH} cy={node.y + h / 2} r={2.5} fill={color} pointerEvents="none"
                onMouseDown={(e) => { e.stopPropagation(); startCable(e, node.id); }} />

              {/* Delete */}
              {isSelected && (
                <g onClick={(e) => { e.stopPropagation(); removeNode(node.id); }} className="cursor-pointer">
                  <circle cx={node.x + NODE_WIDTH - 8} cy={node.y + 8} r={9} fill="hsl(0,84%,30%)" />
                  <line x1={node.x + NODE_WIDTH - 12} y1={node.y + 4} x2={node.x + NODE_WIDTH - 4} y2={node.y + 12}
                    stroke="hsl(0,0%,90%)" strokeWidth={1.5} />
                  <line x1={node.x + NODE_WIDTH - 4} y1={node.y + 4} x2={node.x + NODE_WIDTH - 12} y2={node.y + 12}
                    stroke="hsl(0,0%,90%)" strokeWidth={1.5} />
                </g>
              )}
            </g>
          );
        })}
      </g>

      {nodes.length === 0 && (
        <text x="50%" y="50%" textAnchor="middle" fill="hsl(0,0%,30%)" fontSize={13} fontFamily="monospace">
          Drag gear from the left panel to start patching
        </text>
      )}
    </svg>
  );
}
