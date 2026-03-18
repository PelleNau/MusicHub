/**
 * InstrumentFactory — creates instrument instances from device definitions.
 */

import type { Instrument } from "./Instrument";
import type { InstrumentType } from "@/types/studio";
import { SubtractiveSynth } from "./SubtractiveSynth";
import { FMSynth } from "./FMSynth";

/**
 * Create an instrument instance for the given type and AudioContext.
 * Returns null if the type is unknown.
 */
export function createInstrument(
  ctx: AudioContext,
  type: InstrumentType,
  params: Record<string, number> = {},
): Instrument | null {
  switch (type) {
    case "subtractive":
      return new SubtractiveSynth(ctx, params);
    case "fm":
      return new FMSynth(ctx, params);
    case "sampler":
      // TODO: Sampler requires audio buffer loading — stub for now
      return new SubtractiveSynth(ctx, { ...params, osc1Wave: 0, osc2Wave: 0, oscMix: 0 });
    default:
      return null;
  }
}

export type { Instrument, NoteEvent } from "./Instrument";
