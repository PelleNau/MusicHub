import { useNavigate } from "react-router-dom";
import { Grid3X3, MonitorPlay, Music2, Palette, Piano, SlidersHorizontal, SlidersVertical } from "lucide-react";

const cards = [
  {
    title: "Arrangement Review",
    description: "Current arrangement alignment target. Use this to compare the DAW shell directly against reference screenshots.",
    route: "/design/arrangement",
    icon: Music2,
  },
  {
    title: "Piano Roll Review",
    description: "Static piano-roll review route inside the design app. No session creation required.",
    route: "/design/piano-roll",
    icon: Piano,
  },
  {
    title: "Mixer Review",
    description: "Static mixer review route inside the design app. No session creation required.",
    route: "/design/mixer",
    icon: SlidersVertical,
  },
  {
    title: "Imported Components",
    description: "Review bounded Figma components already ported into the runtime.",
    route: "/design/components",
    icon: Grid3X3,
  },
  {
    title: "Neumorphic Library",
    description: "Inspect the light and dark library study and reusable control experiments.",
    route: "/design/library",
    icon: SlidersHorizontal,
  },
  {
    title: "Lesson Theme",
    description: "Compare the imported lesson panel against the tokenized treatment.",
    route: "/design/lesson-theme",
    icon: Palette,
  },
  {
    title: "System Capture",
    description: "Open the broader design-system showcase used for current styling experiments.",
    route: "/design/system-capture",
    icon: MonitorPlay,
  },
];

export default function DesignHome() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <button
          key={card.route}
          type="button"
          onClick={() => navigate(card.route)}
          className="rounded-[24px] border border-white/10 bg-white/4 p-5 text-left transition-colors hover:border-cyan-300/25 hover:bg-white/6"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-200">
            <card.icon className="h-5 w-5" />
          </div>
          <div className="font-mono text-sm font-semibold text-white">{card.title}</div>
          <div className="mt-2 font-mono text-xs leading-relaxed text-white/56">{card.description}</div>
        </button>
      ))}
    </div>
  );
}
