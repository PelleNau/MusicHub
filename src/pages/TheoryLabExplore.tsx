import { useState } from "react";
import { IntervalPanel } from "@/components/theory/IntervalPanel";
import { ScalePanel } from "@/components/theory/ScalePanel";
import { ModePanel } from "@/components/theory/ModePanel";
import { ChordConstructionPanel } from "@/components/theory/ChordConstructionPanel";
import { HarmonicFunctionPanel } from "@/components/theory/HarmonicFunctionPanel";
import { ProgressionPanel } from "@/components/theory/ProgressionPanel";
import { CircleOfFifths } from "@/components/theory/CircleOfFifths";
import { EarTrainingPanel } from "@/components/theory/EarTrainingPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductPageHeader, ProductShell } from "@/components/app/ProductShell";
import { cn } from "@/lib/utils";
import { Layers, Music, Piano, Boxes, GitBranch, ListMusic, Circle, Ear } from "lucide-react";

const panels = [
  { value: "intervals", label: "Intervals", icon: Layers, description: "Click two notes to visualize intervals, their quality, and semitone distance.", Component: IntervalPanel },
  { value: "scales", label: "Scales", icon: Music, description: "Select a root and scale type to see all notes highlighted on the keyboard.", Component: ScalePanel },
  { value: "modes", label: "Modes", icon: Piano, description: "Explore the modes of the major scale — Ionian through Locrian.", Component: ModePanel },
  { value: "chords", label: "Chord Construction", icon: Boxes, description: "Build chords by stacking intervals on a root note.", Component: ChordConstructionPanel },
  { value: "harmonic", label: "Harmonic Function", icon: GitBranch, description: "View diatonic chords and their Roman numeral analysis in any key.", Component: HarmonicFunctionPanel },
  { value: "progressions", label: "Progressions", icon: ListMusic, description: "Explore common chord progressions and hear each chord in context.", Component: ProgressionPanel },
  { value: "circle", label: "Circle of Fifths", icon: Circle, description: "Rotate, click, and listen to the circle of fifths. See how keys relate.", Component: CircleOfFifths },
  { value: "ear-training", label: "Ear Training", icon: Ear, description: "Hear a scale or mode played and identify it by name. Train your ear recognition.", Component: EarTrainingPanel },
];

export default function TheoryLabExplore() {
  const [active, setActive] = useState("intervals");
  const activePanel = panels.find((p) => p.value === active)!;
  const ActiveComponent = activePanel.Component;

  return (
    <ProductShell
      section="Theory"
      title="Explore"
      description="Visualize core theory concepts and keep the active topic in one bounded workspace."
      contentClassName="p-0"
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="px-4 pt-4 md:px-6">
          <ProductPageHeader
            eyebrow="Theory / Explore"
            title="Explore concepts visually"
            description="Keep the active concept isolated in one workspace so the theory surface stays legible and useful during composition."
          />
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar — hidden on small screens */}
        <nav className="hidden md:block w-52 shrink-0 border-r border-border bg-chrome/50 overflow-y-auto">
          <div className="p-3 space-y-0.5">
            {panels.map(({ value, label, icon: Icon }) => (
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
                  {panels.map(({ value, label }) => (
                    <SelectItem key={value} value={value} className="font-mono text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-mono font-semibold text-foreground mb-1">{activePanel.label}</h2>
              <p className="text-xs font-mono text-muted-foreground">{activePanel.description}</p>
            </div>
            <ActiveComponent />
          </div>
        </ScrollArea>
      </div>
      </div>
    </ProductShell>
  );
}
