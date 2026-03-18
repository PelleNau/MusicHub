import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimelineGrid, snapToGrid, DIVISION_VALUES } from "../useTimelineGrid";

describe("useTimelineGrid", () => {
  const beatsPerBar = 4;

  it("starts with default values", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    expect(result.current.pixelsPerBeat).toBe(24);
    expect(result.current.trackHeight).toBe(72);
    expect(result.current.snapEnabled).toBe(true);
    expect(result.current.gridMode).toBe("adaptive");
    expect(result.current.tripletMode).toBe(false);
  });

  it("zoomIn increases pixelsPerBeat", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    const initial = result.current.pixelsPerBeat;
    act(() => result.current.zoomIn());
    expect(result.current.pixelsPerBeat).toBeGreaterThan(initial);
  });

  it("zoomOut decreases pixelsPerBeat", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    const initial = result.current.pixelsPerBeat;
    act(() => result.current.zoomOut());
    expect(result.current.pixelsPerBeat).toBeLessThan(initial);
  });

  it("zoomInVertical increases trackHeight", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    const initial = result.current.trackHeight;
    act(() => result.current.zoomInVertical());
    expect(result.current.trackHeight).toBeGreaterThan(initial);
  });

  it("zoomOutVertical decreases trackHeight", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    const initial = result.current.trackHeight;
    act(() => result.current.zoomOutVertical());
    expect(result.current.trackHeight).toBeLessThan(initial);
  });

  it("toggleSnapEnabled toggles snap", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    expect(result.current.snapEnabled).toBe(true);
    act(() => result.current.toggleSnapEnabled());
    expect(result.current.snapEnabled).toBe(false);
    act(() => result.current.toggleSnapEnabled());
    expect(result.current.snapEnabled).toBe(true);
  });

  it("toggleTripletMode toggles triplet", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    expect(result.current.tripletMode).toBe(false);
    act(() => result.current.toggleTripletMode());
    expect(result.current.tripletMode).toBe(true);
  });

  it("snapBeats is 0 when snap disabled", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    act(() => result.current.toggleSnapEnabled());
    expect(result.current.snapBeats).toBe(0);
  });

  it("narrowGrid switches to fixed mode and narrows", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    act(() => result.current.narrowGrid());
    expect(result.current.gridMode).toBe("fixed");
  });

  it("widenGrid switches to fixed mode and widens", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    act(() => result.current.widenGrid());
    expect(result.current.gridMode).toBe("fixed");
  });

  it("setGridMode changes mode", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    act(() => result.current.setGridMode("fixed"));
    expect(result.current.gridMode).toBe("fixed");
    act(() => result.current.setGridMode("adaptive"));
    expect(result.current.gridMode).toBe("adaptive");
  });

  it("setFixedDivision changes division", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    act(() => {
      result.current.setGridMode("fixed");
      result.current.setFixedDivision("1/8");
    });
    expect(result.current.fixedDivision).toBe("1/8");
    expect(result.current.activeDivision).toBe("1/8");
  });

  it("zoomToSelection saves zoom memory", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    expect(result.current.hasZoomMemory).toBe(false);
    act(() => result.current.zoomToSelection(0, 32, 4, 1000, 600));
    expect(result.current.hasZoomMemory).toBe(true);
  });

  it("restoreZoom restores previous zoom", () => {
    const { result } = renderHook(() => useTimelineGrid(beatsPerBar));
    const initialPpb = result.current.pixelsPerBeat;
    act(() => result.current.zoomToSelection(0, 32, 4, 1000, 600));
    const zoomedPpb = result.current.pixelsPerBeat;
    expect(zoomedPpb).not.toBe(initialPpb);
    act(() => result.current.restoreZoom());
    expect(result.current.pixelsPerBeat).toBe(initialPpb);
  });
});

describe("snapToGrid", () => {
  it("snaps to nearest grid line", () => {
    expect(snapToGrid(3.7, 1)).toBe(4);
    expect(snapToGrid(3.2, 1)).toBe(3);
  });

  it("snaps to half-beat grid", () => {
    expect(snapToGrid(1.3, 0.5)).toBe(1.5);
    expect(snapToGrid(1.1, 0.5)).toBe(1);
  });

  it("returns original value when snapBeats is 0", () => {
    expect(snapToGrid(3.7, 0)).toBe(3.7);
  });

  it("snaps to quarter-beat grid", () => {
    expect(snapToGrid(2.13, 0.25)).toBe(2.25);
    expect(snapToGrid(2.1, 0.25)).toBe(2);
  });
});

describe("DIVISION_VALUES", () => {
  it("has correct values", () => {
    expect(DIVISION_VALUES["1"]).toBe(4);
    expect(DIVISION_VALUES["1/4"]).toBe(1);
    expect(DIVISION_VALUES["1/8"]).toBe(0.5);
    expect(DIVISION_VALUES["1/16"]).toBe(0.25);
  });
});
