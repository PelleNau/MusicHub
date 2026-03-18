import iconSynth from "@/assets/icons/icon-synth.png";
import iconFx from "@/assets/icons/icon-fx.png";
import iconDrums from "@/assets/icons/icon-drums.png";
import iconAudioInterface from "@/assets/icons/icon-audio-interface.png";
import iconController from "@/assets/icons/icon-controller.png";
import iconMonitor from "@/assets/icons/icon-monitor.png";
import iconMicrophone from "@/assets/icons/icon-microphone.png";
import iconGuitar from "@/assets/icons/icon-guitar.png";
import iconTurntable from "@/assets/icons/icon-turntable.png";
import iconPlugin from "@/assets/icons/icon-plugin.png";
import iconLibrary from "@/assets/icons/icon-library.png";
import iconGear from "@/assets/icons/icon-gear.png";

const CATEGORY_ICONS: Record<string, string> = {
  Synth: iconSynth,
  Keyboard: iconSynth,
  "Drum Machine": iconDrums,
  Drums: iconDrums,
  "Drums / Percussion": iconDrums,
  Percussion: iconDrums,
  FX: iconFx,
  Effect: iconFx,
  Guitar: iconGuitar,
  Controller: iconController,
  "Audio Interface": iconAudioInterface,
  "MIDI Interface": iconAudioInterface,
  Monitor: iconMonitor,
  Subwoofer: iconMonitor,
  Speaker: iconMonitor,
  Microphone: iconMicrophone,
  Turntable: iconTurntable,
  "DJ System": iconTurntable,
  Library: iconLibrary,
  Pack: iconLibrary,
  Plugin: iconPlugin,
};

/**
 * Returns a category-specific fallback icon for gear without a product image.
 * Checks category first, then ecosystem for software items.
 */
export function getCategoryFallbackIcon(category: string, ecosystem?: string): string {
  // Direct category match
  if (CATEGORY_ICONS[category]) return CATEGORY_ICONS[category];

  // Fuzzy match on category keywords
  const catLower = category.toLowerCase();
  if (catLower.includes("synth")) return iconSynth;
  if (catLower.includes("drum") || catLower.includes("percussion")) return iconDrums;
  if (catLower.includes("fx") || catLower.includes("effect")) return iconFx;
  if (catLower.includes("guitar") || catLower.includes("bass")) return iconGuitar;
  if (catLower.includes("controller") || catLower.includes("midi")) return iconController;
  if (catLower.includes("interface") || catLower.includes("audio")) return iconAudioInterface;
  if (catLower.includes("monitor") || catLower.includes("speaker")) return iconMonitor;
  if (catLower.includes("mic")) return iconMicrophone;
  if (catLower.includes("turntable") || catLower.includes("dj")) return iconTurntable;
  if (catLower.includes("library") || catLower.includes("sample") || catLower.includes("pack")) return iconLibrary;

  // Software ecosystem → plugin icon
  if (ecosystem && ecosystem !== "Hardware") return iconPlugin;

  return iconGear;
}
