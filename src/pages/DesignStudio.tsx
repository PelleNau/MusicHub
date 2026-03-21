import { useNavigate } from "react-router-dom";
import { Layers3, MonitorPlay, Grid3X3, SlidersHorizontal, Music2 } from "lucide-react";

import {
  ProductMetaPill,
  ProductPageHeader,
  ProductSectionCard,
  ProductShell,
  ProductSurfaceGrid,
} from "@/components/app/ProductShell";

const areas = [
  {
    title: "Arrangement Review",
    description: "Open the Studio arrangement capture route and inspect the current DAW shell alignment work.",
    icon: Music2,
    route: "/lab/studio?capture=true&captureBar=false&captureScenario=arrangement&mode=standard",
  },
  {
    title: "Imported Components",
    description: "Review the bounded Figma components that have been ported into the runtime.",
    icon: Grid3X3,
    route: "/preview/imported-components?capture=true&captureBar=false&v=19",
  },
  {
    title: "Neumorphic Library",
    description: "Inspect the light and dark neumorphic design-system study and mixer-control experiments.",
    icon: SlidersHorizontal,
    route: "/preview/neumorphic-library?capture=true&captureBar=false&v=3",
  },
  {
    title: "Design System Capture",
    description: "Open the broader design-system showcase for current visual-language experiments.",
    icon: MonitorPlay,
    route: "/capture/design-system?capture=true&captureBar=false",
  },
];

export default function DesignStudio() {
  const navigate = useNavigate();

  return (
    <ProductShell
      section="DesignStudio"
      title="Design review workspace"
      description="Use this surface to inspect design studies, imported components, and current Studio alignment work."
    >
      <ProductPageHeader
        eyebrow="DesignStudio"
        title="UI review and design implementation"
        description="This page is the design workbench inside the product shell. It links the current Studio alignment target, imported Figma components, and design-system experiments in one place."
        meta={
          <>
            <ProductMetaPill>Design review hub</ProductMetaPill>
            <ProductMetaPill>Studio alignment in progress</ProductMetaPill>
          </>
        }
      />

      <ProductSurfaceGrid className="md:grid-cols-2 xl:grid-cols-12">
        {areas.map((area) => (
          <button
            key={area.route}
            type="button"
            onClick={() => navigate(area.route)}
            className="text-left xl:col-span-6"
          >
            <ProductSectionCard
              icon={area.icon}
              title={area.title}
              description={area.description}
              className="h-full transition-colors hover:border-primary/30"
            />
          </button>
        ))}

        <ProductSectionCard
          icon={Layers3}
          title="Current purpose"
          description="DesignStudio is a navigation entry for design-facing work. It does not replace Studio. It gives you one place to reach the current review surfaces without memorizing preview URLs."
          className="xl:col-span-12"
        />
      </ProductSurfaceGrid>
    </ProductShell>
  );
}
