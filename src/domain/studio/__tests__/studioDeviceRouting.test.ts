import { describe, expect, it } from "vitest";

import {
  appendDevice,
  moveDevice,
  removeDevice,
  routeSend,
  setSendLevel,
  toggleDeviceEnabled,
  toggleSendPreFader,
  updateDeviceParams,
} from "@/domain/studio/studioDeviceRouting";

describe("studioDeviceRouting", () => {
  it("adds or updates send levels through one helper", () => {
    expect(setSendLevel([], "return-a", 0.42)).toEqual([{ return_track_id: "return-a", level: 0.42 }]);
    expect(
      setSendLevel([{ return_track_id: "return-a", level: 0.2 }], "return-a", 0.8),
    ).toEqual([{ return_track_id: "return-a", level: 0.8 }]);
  });

  it("toggles pre-fader state while preserving existing sends", () => {
    expect(toggleSendPreFader([], "return-a")).toEqual([
      { return_track_id: "return-a", level: 0, pre_fader: true },
    ]);
    expect(
      toggleSendPreFader([{ return_track_id: "return-a", level: 0.4, pre_fader: true }], "return-a"),
    ).toEqual([{ return_track_id: "return-a", level: 0.4, pre_fader: false }]);
  });

  it("reroutes or removes sends through a single path", () => {
    expect(
      routeSend([{ return_track_id: "return-a", level: 0.3 }], "return-a", "return-b"),
    ).toEqual([{ return_track_id: "return-b", level: 0.3 }]);
    expect(
      routeSend([{ return_track_id: "return-a", level: 0.3 }], "return-a", undefined),
    ).toEqual([]);
  });

  it("applies device mutations through shared helpers", () => {
    const devices = [
      { id: "device-a", type: "gain", enabled: true, params: { gain: 0 } },
      { id: "device-b", type: "delay", enabled: false, params: { mix: 0.4 } },
    ];

    expect(appendDevice(devices, { id: "device-c", type: "reverb", enabled: true, params: { mix: 0.2 } })).toHaveLength(3);
    expect(toggleDeviceEnabled(devices, "device-b", true)[1].enabled).toBe(true);
    expect(updateDeviceParams(devices, "device-a", { gain: 3 })[0].params).toEqual({ gain: 3 });
    expect(moveDevice(devices, "device-b", -1).map((device) => device.id)).toEqual(["device-b", "device-a"]);
    expect(removeDevice(devices, "device-a").map((device) => device.id)).toEqual(["device-b"]);
  });
});
