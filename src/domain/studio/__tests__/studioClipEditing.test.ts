import { describe, expect, it } from "vitest";

import { resolveClipSplitBeat } from "@/domain/studio/studioClipEditing";

describe("resolveClipSplitBeat", () => {
  it("uses the playhead beat when it falls inside the clip", () => {
    expect(resolveClipSplitBeat(4, 12, 7.1, 0.25)).toBe(7);
  });

  it("falls back to midpoint when the playhead is outside the clip", () => {
    expect(resolveClipSplitBeat(4, 12, 15, 0.25)).toBe(8);
  });

  it("falls back to midpoint when the snapped beat collapses to an edge", () => {
    expect(resolveClipSplitBeat(4, 12, 4.01, 1)).toBe(8);
  });
});
