import { useNavigate } from "react-router-dom";
import { Microscope, Cable, Music, Radio, BookOpen, Layout } from "lucide-react";

const areas = [
  {
    title: "Deep Dive",
    description: "Parse your Ableton projects, visualise arrangement timelines, inspect signal chains, and let AI uncover hidden insights in your sessions.",
    icon: Microscope,
    route: "/lab/deep-dive",
  },
  {
    title: "Patch Lab",
    description: "Drag gear from your inventory onto a virtual canvas, wire up signal chains, and let AI suggest creative routing ideas.",
    icon: Cable,
    route: "/lab/patch-lab",
  },
  {
    title: "Studio",
    description: "Arrange tracks, mix audio, and build sessions with your gear — a browser-based production workspace.",
    icon: Music,
    route: "/lab/studio",
  },
  {
    title: "Bridge",
    description: "Control panel for your local companion app — scan plugins, load instruments, and route audio between browser and desktop.",
    icon: Radio,
    route: "/lab/bridge",
  },
  {
    title: "Theory Lab",
    description: "Learn, explore, and apply music theory — intervals, scales, chords, progressions, and practical composition tools.",
    icon: BookOpen,
    route: "/lab/theory",
  },
  {
    title: "Platform Mockups",
    description: "Explore the proposed new UX — dashboard, learning path, studio integration, and app shell prototypes.",
    icon: Layout,
    route: "/mockup",
  },
];

export default function Lab() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background pb-20">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-mono font-bold tracking-tight text-foreground mb-3">
            The Lab
          </h2>
          <p className="text-muted-foreground font-mono text-sm leading-relaxed">
            Your experimental playground — dissect projects, prototype signal chains,
            and discover creative possibilities hiding in your gear collection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl px-4 sm:px-0">
          {areas.map((area) => (
            <button
              key={area.route}
              onClick={() => navigate(area.route)}
              className="group relative flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <area.icon className="h-6 w-6" strokeWidth={2.25} />
              </div>
              <div>
                <h3 className="font-mono text-sm font-semibold text-foreground mb-1">
                  {area.title}
                </h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  {area.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
