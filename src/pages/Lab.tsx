import { useNavigate } from "react-router-dom";
import { Microscope, Cable, Music, Radio, BookOpen, Layout } from "lucide-react";
import {
  ProductMetaPill,
  ProductPageHeader,
  ProductSectionCard,
  ProductShell,
  ProductSurfaceGrid,
} from "@/components/app/ProductShell";

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
    <ProductShell
      section="Lab"
      title="Exploration surfaces"
      description="Use Lab for experimentation, analysis, and support workflows that feed back into Studio."
    >
      <ProductPageHeader
        eyebrow="Lab"
        title="Experiment before you commit"
        description="Lab is the exploration layer around Studio. Use it to inspect arrangements, test routing, explore theory, and review prototype directions without fragmenting the product."
        meta={
          <>
            <ProductMetaPill>Support surface, not a separate product</ProductMetaPill>
            <ProductMetaPill>Feeds back into Studio</ProductMetaPill>
          </>
        }
      />

      <ProductSurfaceGrid className="md:grid-cols-2 xl:grid-cols-12">
        {areas.map((area) => (
          <button
            key={area.route}
            type="button"
            onClick={() => navigate(area.route)}
            className="text-left xl:col-span-4"
          >
            <ProductSectionCard
              icon={area.icon}
              title={area.title}
              description={area.description}
              className="h-full transition-colors hover:border-primary/30"
            />
          </button>
        ))}
      </ProductSurfaceGrid>
    </ProductShell>
  );
}
