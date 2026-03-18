import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const DESCRIPTORS = [
  "Bright", "Warm", "Buzzy", "Smooth", "Harsh",
  "Thin", "Full", "Sharp", "Mellow", "Rich",
  "Metallic", "Hollow",
];

interface DescriptorTaggerProps {
  /** Currently playing preset label */
  presetLabel?: string;
  minTags?: number;
  onTagsChanged?: (tags: string[]) => void;
  className?: string;
}

/**
 * Lesson 1.5 — Chip/tag selector for timbre descriptors.
 * User listens to a sound and picks descriptors.
 */
export function DescriptorTagger({
  presetLabel,
  minTags = 2,
  onTagsChanged,
  className = "",
}: DescriptorTaggerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (desc: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(desc)) next.delete(desc); else next.add(desc);
      onTagsChanged?.(Array.from(next));
      return next;
    });
  };

  const met = selected.size >= minTags;

  return (
    <div className={`rounded-xl border border-border bg-card/50 p-5 space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-muted-foreground">
          {presetLabel ? `Describe "${presetLabel}"` : "Pick descriptors"}
        </span>
        <span className={`text-[10px] font-mono ${met ? "text-primary" : "text-muted-foreground"}`}>
          {selected.size}/{minTags}+ tags
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {DESCRIPTORS.map((desc) => {
          const active = selected.has(desc);
          return (
            <button
              key={desc}
              onClick={() => toggle(desc)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                active
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-secondary/20 text-muted-foreground hover:bg-secondary/40"
              }`}
            >
              {active && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
              {desc}
            </button>
          );
        })}
      </div>
    </div>
  );
}
