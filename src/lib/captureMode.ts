export type CaptureScenarioId =
  | "guided-mode"
  | "standard-mode"
  | "focused-mode"
  | "arrangement"
  | "arrangement-piano-roll"
  | "piano-roll"
  | "mixer"
  | "control-bar"
  | "components-showcase";

export type CaptureOverlayId =
  | "transform-menu"
  | "pitch-menu"
  | "duration-menu"
  | "humanize-dialog"
  | "collapsed-mixer"
  | "compact-tracks";

export interface CaptureScenario {
  id: CaptureScenarioId;
  title: string;
  description: string;
  filename: string;
  href: string;
}

const CAPTURE_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_APP_FLAVOR === "design";

const CAPTURE_SCENARIOS: CaptureScenario[] = [
  {
    id: "guided-mode",
    title: "Guided Mode",
    description: "Full Studio view with lesson context visible.",
    filename: "01-guided-mode.png",
    href: "/lab/studio?capture=true&captureScenario=guided-mode&mode=guided&lesson=studio.transport-basics",
  },
  {
    id: "standard-mode",
    title: "Standard Mode",
    description: "Balanced production shell with the full Studio layout.",
    filename: "02-standard-mode.png",
    href: "/lab/studio?capture=true&captureScenario=standard-mode&mode=standard&lesson=studio.sketch-capstone",
  },
  {
    id: "focused-mode",
    title: "Focused Mode",
    description: "Dense Studio layout with reduced chrome.",
    filename: "03-focused-mode.png",
    href: "/lab/studio?capture=true&captureScenario=focused-mode&mode=focused&lesson=studio.sketch-capstone",
  },
  {
    id: "arrangement",
    title: "Arrangement View",
    description: "Timeline, tracks, clips, and arrangement toolbar.",
    filename: "04-arrangement.png",
    href: "/lab/studio?capture=true&captureScenario=arrangement&mode=standard&lesson=studio.sketch-capstone",
  },
  {
    id: "arrangement-piano-roll",
    title: "Arrangement + Piano Roll",
    description: "Arrangement view with the piano roll open in the bottom workspace.",
    filename: "04b-arrangement-piano-roll.png",
    href: "/lab/studio?capture=true&captureScenario=arrangement-piano-roll&mode=standard",
  },
  {
    id: "piano-roll",
    title: "Piano Roll",
    description: "MIDI editor with the first fixture clip selected.",
    filename: "05-piano-roll.png",
    href: "/lab/studio?capture=true&captureScenario=piano-roll&mode=standard",
  },
  {
    id: "mixer",
    title: "Mixer Panel",
    description: "Channel-strip view in the bottom workspace.",
    filename: "06-mixer.png",
    href: "/lab/studio?capture=true&captureScenario=mixer&mode=standard&lesson=studio.mixer-basics",
  },
  {
    id: "control-bar",
    title: "Control Bar",
    description: "Top transport and shell chrome for an isolated toolbar capture.",
    filename: "07-control-bar.png",
    href: "/lab/studio?capture=true&captureScenario=control-bar&mode=standard&lesson=studio.sketch-capstone",
  },
  {
    id: "components-showcase",
    title: "Components Showcase",
    description: "Design-system primitives and representative product surfaces.",
    filename: "08-components-showcase.png",
    href: "/capture/design-system?capture=true&captureScenario=components-showcase",
  },
];

function getSearchParams() {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.location.search) {
    return new URLSearchParams(window.location.search);
  }

  const hash = window.location.hash;
  const queryIndex = hash.indexOf("?");
  if (queryIndex === -1) {
    return new URLSearchParams();
  }

  return new URLSearchParams(hash.slice(queryIndex));
}

export function isCaptureMode() {
  if (!CAPTURE_ENABLED) {
    return false;
  }

  const searchParams = getSearchParams();
  if (!searchParams) {
    return false;
  }

  return searchParams.get("capture") === "true";
}

export function getCaptureScenario() {
  if (!CAPTURE_ENABLED) {
    return null;
  }

  return (getSearchParams()?.get("captureScenario") as CaptureScenarioId | null) ?? null;
}

export function getCaptureOverlay() {
  if (!CAPTURE_ENABLED) {
    return null;
  }

  return (getSearchParams()?.get("captureOverlay") as CaptureOverlayId | null) ?? null;
}

export function shouldShowCaptureBar() {
  const searchParams = getSearchParams();
  if (!searchParams) {
    return true;
  }

  return searchParams.get("captureBar") !== "false";
}

export function getCaptureScenarios() {
  return CAPTURE_SCENARIOS;
}

export function getCaptureScenarioById(id: CaptureScenarioId | null | undefined) {
  if (!id) {
    return null;
  }

  return CAPTURE_SCENARIOS.find((scenario) => scenario.id === id) ?? null;
}
