import { useState } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { NOTE_NAMES, SCALES, getDiatonicChords, COMMON_PROGRESSIONS } from "@/lib/musicTheory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TheoryLearnPractice } from "./TheoryLearnPractice";

export function ProgressionPanel() {
  const [root, setRoot] = useState(0);
  const [activeProgIdx, setActiveProgIdx] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const scaleIntervals = SCALES["Major"];
  const chords = getDiatonicChords(root, scaleIntervals);
  const activeProg = activeProgIdx !== null ? COMMON_PROGRESSIONS[activeProgIdx] : null;
  const activeChord = activeProg && activeStep !== null ? chords[activeProg.degrees[activeStep]] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-muted-foreground">Key:</span>
        <Select value={String(root)} onValueChange={(v) => { setRoot(Number(v)); setActiveStep(null); }}>
          <SelectTrigger className="w-24 h-8 font-mono text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {NOTE_NAMES.map((n, i) => (
              <SelectItem key={i} value={String(i)} className="font-mono text-xs">{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs font-mono text-muted-foreground">Major</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {COMMON_PROGRESSIONS.map((prog, i) => (
          <button
            key={i}
            onClick={() => { setActiveProgIdx(activeProgIdx === i ? null : i); setActiveStep(null); }}
            className={`p-2.5 rounded-md text-left transition-colors ${
              activeProgIdx === i ? "bg-primary/15 ring-1 ring-primary/30" : "bg-muted/40 hover:bg-muted/60"
            }`}
          >
            <span className="text-xs font-mono font-semibold text-foreground">{prog.name}</span>
          </button>
        ))}
      </div>
      {activeProg && (
        <div className="space-y-3">
          <div className="flex gap-1.5">
            {activeProg.degrees.map((deg, step) => {
              const chord = chords[deg];
              return (
                <button
                  key={step}
                  onClick={() => setActiveStep(activeStep === step ? null : step)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-md transition-colors ${
                    activeStep === step ? "bg-primary/25 ring-1 ring-primary/40" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <span className="text-sm font-mono font-bold text-foreground">{activeProg.numerals[step]}</span>
                  <span className="text-[9px] font-mono text-muted-foreground">{chord?.root ?? ""}</span>
                </button>
              );
            })}
          </div>
          <PianoKeyboard octaves={2} highlightedNotes={activeChord ? activeChord.notes : []} activeNotes={activeChord ? [activeChord.rootIndex] : []} compact />
        </div>
      )}
      <TheoryLearnPractice topicKey="progressions" moduleKey="progressions" />
    </div>
  );
}
