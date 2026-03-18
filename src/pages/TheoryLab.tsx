import { useNavigate } from "react-router-dom";
import { BookOpen, Wrench, BarChart3, PenTool } from "lucide-react";
import { TheoryHeader } from "@/components/theory/TheoryHeader";

const sections = [
  {
    title: "Explore",
    description: "Learn and visualize theory concepts — intervals, scales, modes, chord construction, harmonic function, and common progressions.",
    icon: BookOpen,
    route: "/lab/theory/explore",
  },
  {
    title: "Tools",
    description: "Fast note, chord, scale, and key utilities — identify what you're hearing, find matching scales, transpose on the fly.",
    icon: Wrench,
    route: "/lab/theory/tools",
  },
  {
    title: "Analyze",
    description: "Inspect MIDI notes, chord progressions, and harmonic movement in your compositions.",
    icon: BarChart3,
    route: "/lab/theory/analyze",
    disabled: true,
  },
  {
    title: "Write",
    description: "Get harmonic suggestions, chord substitutions, and compositional ideas based on theory principles.",
    icon: PenTool,
    route: "/lab/theory/write",
    disabled: true,
  },
];

export default function TheoryLab() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TheoryHeader title="Theory Lab" />

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-mono font-bold tracking-tight text-foreground mb-3">
            Theory Lab
          </h2>
          <p className="text-muted-foreground font-mono text-sm leading-relaxed">
            Learn, explore, and apply music theory as a practical composition tool — not a textbook.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
          {sections.map((section) => (
            <button
              key={section.route}
              onClick={() => !section.disabled && navigate(section.route)}
              disabled={section.disabled}
              className="group relative flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:shadow-none"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-disabled:group-hover:bg-primary/15 group-disabled:group-hover:text-primary">
                <section.icon className="h-6 w-6" strokeWidth={2.25} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-mono text-sm font-semibold text-foreground">
                    {section.title}
                  </h3>
                  {section.disabled && (
                    <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  {section.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
