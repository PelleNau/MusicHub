export type Ecosystem = "Hardware" | "NI" | "Kontakt" | "Reaktor" | "Reason" | "Ableton";

export type SoundCategory =
  | "Lead" | "Bass" | "Pad" | "Texture" | "Keys" | "Drums"
  | "FX" | "Strings" | "Brass" | "Woodwinds" | "Choir"
  | "Vocal" | "Guitar" | "World" | "Mallets" | "Utility"
  | "Sampler" | "Pack";

export interface HardwareSpecs {
  audioIn?: number;
  audioOut?: number;
  midiIn?: boolean;
  midiOut?: boolean;
  midiThru?: boolean;
  usb?: boolean;
  cv?: boolean;
  gate?: boolean;
  spdif?: boolean;
  adat?: boolean;
  xlr?: number;
  headphones?: boolean;
  bluetooth?: boolean;
  wifi?: boolean;
  expression?: boolean;
  sustainPedal?: boolean;
  keys?: number;
  pads?: number;
  faders?: number;
  knobs?: number;
  polyphony?: number | string;
  custom?: { label: string; value: string }[];
}

export interface InventoryItem {
  id: string;
  ecosystem: Ecosystem;
  category: string;
  vendor: string;
  product: string;
  type: string;
  synthesis?: string;
  sonicRole?: string;
  soundCategory?: SoundCategory | string;
  rating?: number;
  description?: string;
  useCases?: string;
  notes?: string;
  // Extended info
  yearReleased?: number;
  msrp?: string;
  url?: string;
  // Hardware-specific
  quantity?: number;
  serialNumber?: string;
  purchaseYear?: number;
  purchasePrice?: number;
  location?: string;
  specs?: HardwareSpecs;
  keywords?: string;
  imageUrl?: string;
}
