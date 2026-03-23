import { describe, expect, it } from "vitest";

import { getDisplayClipDuration } from "@/components/studio/pianoroll/usePianoRollInteractions";

describe("getDisplayClipDuration", () => {
  it("keeps the piano roll horizontally scrollable beyond the initial viewport width", () => {
    const displayClipDuration = getDisplayClipDuration({
      clipDuration: 16,
      clipExtendDelta: 0,
      beatsPerBar: 4,
      pxPerBeat: 32,
      viewportWidth: 32 * 24,
    });

    expect(displayClipDuration).toBe(28);
    expect(displayClipDuration * 32).toBeGreaterThan(32 * 24);
  });

  it("preserves extended editing range beyond the initial visible width", () => {
    const displayClipDuration = getDisplayClipDuration({
      clipDuration: 16,
      clipExtendDelta: 32 * 12,
      beatsPerBar: 4,
      pxPerBeat: 32,
      viewportWidth: 32 * 20,
    });

    expect(displayClipDuration).toBe(32);
    expect(displayClipDuration * 32).toBeGreaterThan(32 * 20);
  });
});
