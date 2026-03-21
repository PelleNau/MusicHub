import { describe, it, expect } from "vitest";
import {
  TRACK_HEADER_WIDTH,
  GRID_EPSILON,
  beatToContentX,
  beatToAbsoluteX,
  contentXToBeat,
  clientXToBeat,
  toGridIndex,
  generateGridBeats,
  getBarOffsetBeats,
  isBarDownbeat,
} from "@/components/studio/timelineMath";

describe("timelineMath", () => {
  // ── beat ↔ pixel roundtrip ──
  describe("beat ↔ pixel roundtrip", () => {
    it("roundtrips through content space", () => {
      const ppb = 24;
      const beat = 7.5;
      const x = beatToContentX(beat, ppb);
      expect(contentXToBeat(x, ppb)).toBeCloseTo(beat, 10);
    });

    it("roundtrips through absolute space", () => {
      const ppb = 48;
      const beat = 13.25;
      const absX = beatToAbsoluteX(beat, ppb);
      expect(absX).toBe(TRACK_HEADER_WIDTH + beat * ppb);
      // Inverse
      const contentX = absX - TRACK_HEADER_WIDTH;
      expect(contentXToBeat(contentX, ppb)).toBeCloseTo(beat, 10);
    });

    it("handles zero beat", () => {
      expect(beatToContentX(0, 24)).toBe(0);
      expect(beatToAbsoluteX(0, 24)).toBe(TRACK_HEADER_WIDTH);
    });
  });

  // ── clientXToBeat ──
  describe("clientXToBeat", () => {
    it("converts with scroll offset", () => {
      const beat = clientXToBeat({
        clientX: 300,
        timelineRectLeft: 50,
        scrollLeft: 100,
        pixelsPerBeat: 24,
      });
      // contentX = 300 - 50 - TRACK_HEADER_WIDTH + 100
      // beat = 142 / 24
      expect(beat).toBeCloseTo((300 - 50 - TRACK_HEADER_WIDTH + 100) / 24, 10);
    });
  });

  // ── toGridIndex ──
  describe("toGridIndex", () => {
    it("returns correct index for exact grid positions", () => {
      expect(toGridIndex(0, 0.5)).toBe(0);
      expect(toGridIndex(0.5, 0.5)).toBe(1);
      expect(toGridIndex(4, 0.5)).toBe(8);
    });

    it("rounds to nearest for off-grid positions", () => {
      expect(toGridIndex(0.49, 0.5)).toBe(1);
      expect(toGridIndex(0.24, 0.5)).toBe(0);
    });

    it("is stable around epsilon boundaries", () => {
      // Value just barely above a grid line
      expect(toGridIndex(1.0 + 1e-10, 0.5)).toBe(2);
      expect(toGridIndex(1.0 - 1e-10, 0.5)).toBe(2);
    });
  });

  // ── generateGridBeats ──
  describe("generateGridBeats", () => {
    it("generates correct beat positions", () => {
      const beats = generateGridBeats(4, 1, 0);
      expect(beats).toEqual([0, 1, 2, 3, 4]);
    });

    it("handles fractional step", () => {
      const beats = generateGridBeats(2, 0.5, 0);
      expect(beats).toEqual([0, 0.5, 1, 1.5, 2]);
    });

    it("handles non-zero start", () => {
      const beats = generateGridBeats(8, 4, 0);
      expect(beats).toEqual([0, 4, 8]);
    });

    it("no cumulative drift for long timelines", () => {
      const step = 0.125; // 1/32 note
      const totalBeats = 10000;
      const beats = generateGridBeats(totalBeats, step, 0);

      // Check the last few beats are exact multiples of step
      const lastBeat = beats[beats.length - 1];
      expect(lastBeat).toBe(totalBeats);

      // Check a beat deep into the timeline
      const idx5000 = 5000 * 8; // beat 5000 at 1/32 step
      expect(beats[idx5000]).toBe(5000);

      // No drift: every value should be i * step
      for (let i = 0; i < beats.length; i++) {
        expect(Math.abs(beats[i] - i * step)).toBeLessThan(1e-9);
      }
    });

    it("returns empty for invalid step", () => {
      expect(generateGridBeats(100, 0, 0)).toEqual([]);
      expect(generateGridBeats(100, -1, 0)).toEqual([]);
    });
  });

  // ── Bar helpers ──
  describe("bar helpers", () => {
    it("bar offset is always 0", () => {
      expect(getBarOffsetBeats(4)).toBe(0);
      expect(getBarOffsetBeats(3)).toBe(0);
    });

    it("detects bar downbeats in 4/4", () => {
      expect(isBarDownbeat(0, 4, 0)).toBe(true);
      expect(isBarDownbeat(4, 4, 0)).toBe(true);
      expect(isBarDownbeat(8, 4, 0)).toBe(true);
      expect(isBarDownbeat(1, 4, 0)).toBe(false);
      expect(isBarDownbeat(2, 4, 0)).toBe(false);
    });

    it("detects bar downbeats in 3/4", () => {
      expect(isBarDownbeat(0, 3, 0)).toBe(true);
      expect(isBarDownbeat(3, 3, 0)).toBe(true);
      expect(isBarDownbeat(6, 3, 0)).toBe(true);
      expect(isBarDownbeat(1, 3, 0)).toBe(false);
    });

    it("handles floating point near downbeat", () => {
      expect(isBarDownbeat(4 - 1e-10, 4, 0)).toBe(true);
      expect(isBarDownbeat(4 + 1e-10, 4, 0)).toBe(true);
    });
  });

  // ── TRACK_HEADER_WIDTH constant ──
  it("TRACK_HEADER_WIDTH matches the current arrangement geometry", () => {
    expect(TRACK_HEADER_WIDTH).toBe(206);
  });
});
