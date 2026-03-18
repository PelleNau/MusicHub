import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useStudioModeModel } from "@/hooks/useStudioModeModel";

describe("useStudioModeModel", () => {
  it("prefers the explicit route mode", () => {
    const { result } = renderHook(() =>
      useStudioModeModel({
        routeMode: "focused",
        preferredMode: "guided",
        lessonState: {
          visible: true,
          lessonStatus: "active",
        },
        panelState: {
          showBottomWorkspace: true,
          showPianoRoll: true,
          showMixer: false,
        },
      }),
    );

    expect(result.current.mode).toBe("focused");
    expect(result.current.reason).toBe("route");
    expect(result.current.shell.density).toBe("dense");
  });

  it("uses the persisted preference when no route mode is present", () => {
    const { result } = renderHook(() =>
      useStudioModeModel({
        routeMode: null,
        preferredMode: "guided",
        lessonState: {
          visible: false,
          lessonStatus: "idle",
        },
        panelState: {
          showBottomWorkspace: false,
          showPianoRoll: false,
          showMixer: false,
        },
      }),
    );

    expect(result.current.mode).toBe("guided");
    expect(result.current.reason).toBe("preference");
    expect(result.current.shell.showBrowserPanel).toBe(false);
  });

  it("falls back to guided mode for an active lesson in auto mode", () => {
    const { result } = renderHook(() =>
      useStudioModeModel({
        routeMode: null,
        preferredMode: "auto",
        lessonState: {
          visible: true,
          lessonStatus: "active",
        },
        panelState: {
          showBottomWorkspace: false,
          showPianoRoll: false,
          showMixer: false,
        },
      }),
    );

    expect(result.current.mode).toBe("guided");
    expect(result.current.reason).toBe("lesson");
    expect(result.current.shell.showGuideSidebar).toBe(true);
  });

  it("defaults to standard mode when nothing else selects a mode", () => {
    const { result } = renderHook(() =>
      useStudioModeModel({
        routeMode: null,
        preferredMode: "auto",
        lessonState: {
          visible: false,
          lessonStatus: "idle",
        },
        panelState: {
          showBottomWorkspace: true,
          showPianoRoll: false,
          showMixer: true,
        },
      }),
    );

    expect(result.current.mode).toBe("standard");
    expect(result.current.reason).toBe("default");
    expect(result.current.shell.showBrowserPanel).toBe(true);
    expect(result.current.shell.showBottomWorkspace).toBe(true);
  });
});
