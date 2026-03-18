import { useState } from "react";
import { TheoryHeader } from "@/components/theory/TheoryHeader";
import { ChordFinderTool } from "@/components/theory/ChordFinderTool";
import { ScaleFinderTool } from "@/components/theory/ScaleFinderTool";
import { KeyFinderTool } from "@/components/theory/KeyFinderTool";
import { IntervalCalcTool } from "@/components/theory/IntervalCalcTool";
import { TransposeTool } from "@/components/theory/TransposeTool";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Disc, Layers, Search, Key, ArrowUpDown } from "lucide-react";

const tools = [
  { value: "chord-finder", label: "Chord Finder", icon: Disc, description: "Click notes on the keyboard to identify the chord name and inversions.", Component: ChordFinderTool },
  { value: "scale-finder", label: "Scale Finder", icon: Search, description: "Select notes to discover which scales contain all of them.", Component: ScaleFinderTool },
  { value: "key-finder", label: "Key Finder", icon: Key, description: "Enter the notes you're using to find the most likely key.", Component: KeyFinderTool },
  { value: "interval-calc", label: "Interval Calc", icon: Layers, description: "Select two notes to calculate the interval between them.", Component: IntervalCalcTool },
  { value: "transpose", label: "Transpose", icon: ArrowUpDown, description: "Select notes and a semitone offset to transpose them.", Component: TransposeTool },
];

export default function TheoryLabTools() {
  const [active, setActive] = useState("chord-finder");
  const activeTool = tools.find((t) => t.value === active)!;
  const ActiveComponent = activeTool.Component;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TheoryHeader title="Tools" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on small screens */}
        <nav className="hidden md:block w-52 shrink-0 border-r border-border bg-card/50 overflow-y-auto">
          <div className="p-3 space-y-0.5">
            {tools.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setActive(value)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-mono transition-colors text-left",
                  active === value
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="max-w-5xl p-4 sm:p-6">
            {/* Mobile dropdown */}
            <div className="md:hidden mb-4">
              <Select value={active} onValueChange={setActive}>
                <SelectTrigger className="font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tools.map(({ value, label }) => (
                    <SelectItem key={value} value={value} className="font-mono text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-mono font-semibold text-foreground mb-1">{activeTool.label}</h2>
              <p className="text-xs font-mono text-muted-foreground">{activeTool.description}</p>
            </div>
            <ActiveComponent />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
