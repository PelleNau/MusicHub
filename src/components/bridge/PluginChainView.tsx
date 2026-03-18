import {
  ArrowLeft, ChevronRight, Cpu, Power, Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Track, PluginInstance } from "@/types/bridge";

interface PluginChainViewProps {
  track: Track;
  onBack: () => void;
}

function DeviceBlock({ device, index }: { device: PluginInstance; index: number }) {
  const isInstrument = device.name.match(/serum|diva|massive|pigments|vital|kontakt|omnisphere|spire|sylenth/i);

  return (
    <div className={`relative rounded-lg border bg-card p-4 transition-all ${
      device.missing ? "border-destructive/40 bg-destructive/5" :
      device.bypass ? "border-border opacity-50" :
      "border-primary/20"
    }`}>
      <div className="absolute -top-2.5 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary border border-border">
        <span className="font-mono text-[9px] text-muted-foreground font-bold">{index + 1}</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-md ${
            isInstrument ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"
          }`}>
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <p className="font-mono text-xs font-semibold text-foreground">{device.name}</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {device.preset && <span className="text-primary">{device.preset}</span>}
              {device.wet < 1 && <span className="ml-1">· Wet: {Math.round(device.wet * 100)}%</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {device.preset && (
            <Badge variant="secondary" className="font-mono text-[9px]">{device.preset}</Badge>
          )}
          {device.missing && (
            <Badge variant="destructive" className="font-mono text-[9px]">MISSING</Badge>
          )}
          {device.stateBlob && (
            <Badge variant="outline" className="font-mono text-[9px]">STATE</Badge>
          )}
          <Power className={`h-3.5 w-3.5 ${device.bypass ? "text-muted-foreground" : "text-primary"}`} />
        </div>
      </div>

      {/* Params */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {device.params.map(p => (
          <div key={p.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-muted-foreground">{p.label}</span>
              <span className="font-mono text-[10px] text-primary">{p.displayValue}</span>
            </div>
            <Slider value={[p.value * 100]} max={100} step={1} className="h-1" disabled />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PluginChainView({ track, onBack }: PluginChainViewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-2.5">
        <Button size="sm" variant="ghost" className="h-7 gap-1 font-mono text-xs" onClick={onBack}>
          <ArrowLeft className="h-3 w-3" /> Track List
        </Button>
        <div className="h-4 w-1 rounded-full shrink-0" style={{ backgroundColor: track.color }} />
        <span className="font-mono text-sm font-semibold text-foreground">{track.name}</span>
        <Badge variant="outline" className="font-mono text-[10px]">{track.type}</Badge>
        <div className="ml-auto flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <Volume2 className="h-3 w-3" />
          <span>Vol: {track.volume}%</span>
          <span>·</span>
          <span>Pan: {track.pan === 0 ? "C" : track.pan > 0 ? `${track.pan}R` : `${Math.abs(track.pan)}L`}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b px-4 py-2 overflow-x-auto">
        <span className="font-mono text-[10px] text-muted-foreground shrink-0">Signal Flow:</span>
        {track.chain.map((d, i) => (
          <div key={d.id} className="flex items-center gap-1 shrink-0">
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
              d.missing ? "text-destructive bg-destructive/10" :
              d.bypass ? "text-muted-foreground line-through" :
              "text-primary bg-primary/10"
            }`}>{d.name}</span>
            {i < track.chain.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        ))}
        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
        <Volume2 className="h-3 w-3 text-muted-foreground shrink-0" />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {track.chain.map((device, index) => (
            <div key={device.id} className="relative">
              <DeviceBlock device={device} index={index} />
              {index < track.chain.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="h-4 w-px bg-border" />
                </div>
              )}
            </div>
          ))}

          {track.sends.length > 0 && (
            <div className="mt-4 rounded-lg border border-dashed border-border p-3">
              <p className="font-mono text-[10px] text-muted-foreground font-semibold mb-2">SENDS</p>
              <div className="space-y-1.5">
                {track.sends.map(send => (
                  <div key={send.targetTrackId} className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-foreground">→ {send.targetTrackName}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{send.preFader ? "Pre" : "Post"}</Badge>
                      <span className="text-primary">{send.level}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
