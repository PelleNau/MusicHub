import { useNavigate } from "react-router-dom";
import { BookOpen, Wrench, BarChart3, PenTool } from "lucide-react";
import {
  ProductMetaPill,
  ProductPageHeader,
  ProductSectionCard,
  ProductShell,
  ProductSurfaceGrid,
} from "@/components/app/ProductShell";

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
    <ProductShell
      section="Theory"
      title="Theory Lab"
      description="Applied theory reference, exploration, and utilities aligned to the production workflow."
    >
      <ProductPageHeader
        eyebrow="Theory"
        title="Use theory as a working tool"
        description="Theory Lab should stay practical. Move from explanation to exploration to action without turning the product into a disconnected classroom."
        meta={
          <>
            <ProductMetaPill>Reference + tools</ProductMetaPill>
            <ProductMetaPill>Direct path back to Studio</ProductMetaPill>
          </>
        }
      />

      <ProductSurfaceGrid className="md:grid-cols-2 xl:grid-cols-12">
        {sections.map((section) => (
          <button
            key={section.route}
            type="button"
            onClick={() => !section.disabled && navigate(section.route)}
            disabled={section.disabled}
            className="text-left disabled:cursor-not-allowed disabled:opacity-45 xl:col-span-6"
          >
            <ProductSectionCard
              icon={section.icon}
              title={section.title}
              description={section.description}
              eyebrow={section.disabled ? "Coming soon" : "Available"}
              className="h-full transition-colors hover:border-primary/30"
            />
          </button>
        ))}
      </ProductSurfaceGrid>
    </ProductShell>
  );
}
