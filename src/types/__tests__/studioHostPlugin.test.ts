import { describe, expect, it } from "vitest";

import {
  getAutomatableParams,
  getDeviceDisplayInfo,
  getHostPluginDescriptor,
  isHostBackedDevice,
  normalizeDeviceInstance,
  type DeviceInstance,
  type SessionTrack,
} from "@/types/studio";

describe("studio host-backed device helpers", () => {
  it("prefers the explicit hostPlugin descriptor", () => {
    const device: DeviceInstance = {
      id: "device-1",
      type: "sampler",
      enabled: true,
      params: {},
      hostPlugin: {
        id: "plugin-1",
        path: "/Library/Audio/Plug-Ins/VST3/Test.vst3",
        name: "Test",
        vendor: "Vendor",
        format: "VST3",
        role: "instrument",
        scanStatus: "ok",
      },
    };

    expect(isHostBackedDevice(device)).toBe(true);
    expect(getHostPluginDescriptor(device)).toEqual(device.hostPlugin);
  });

  it("reconstructs host plugin descriptors from legacy flat fields", () => {
    const device = {
      id: "device-2",
      type: "gain",
      enabled: true,
      params: {},
      nativePluginId: "legacy-1",
      nativePluginPath: "AudioUnit:Effects/aufx,dely,appl",
      nativePluginName: "AUDelay",
      nativePluginVendor: "Apple",
      nativePluginFormat: "AudioUnit",
      nativePluginRole: "effect",
      nativePluginScanStatus: "warning",
    } as DeviceInstance;

    expect(isHostBackedDevice(device)).toBe(true);
    expect(getHostPluginDescriptor(device)).toEqual({
      id: "legacy-1",
      path: "AudioUnit:Effects/aufx,dely,appl",
      name: "AUDelay",
      vendor: "Apple",
      format: "AudioUnit",
      role: "effect",
      scanStatus: "warning",
    });
  });

  it("normalizes legacy native fields into the canonical hostPlugin shape", () => {
    const device = {
      id: "device-legacy",
      type: "gain",
      enabled: true,
      params: {},
      nativePluginId: "legacy-1",
      nativePluginPath: "AudioUnit:Effects/aufx,dely,appl",
      nativePluginName: "AUDelay",
      nativePluginVendor: "Apple",
      nativePluginFormat: "AudioUnit",
      nativePluginRole: "effect",
    } as DeviceInstance;

    expect(normalizeDeviceInstance(device)).toEqual({
      id: "device-legacy",
      type: "gain",
      enabled: true,
      params: {},
      hostPlugin: {
        id: "legacy-1",
        path: "AudioUnit:Effects/aufx,dely,appl",
        name: "AUDelay",
        vendor: "Apple",
        format: "AudioUnit",
        role: "effect",
      },
    });
  });

  it("returns null for local-only devices", () => {
    const device: DeviceInstance = {
      id: "device-3",
      type: "reverb",
      enabled: true,
      params: { mix: 0.3 },
    };

    expect(isHostBackedDevice(device)).toBe(false);
    expect(getHostPluginDescriptor(device)).toBeNull();
  });

  it("exposes host-backed device display metadata", () => {
    const device: DeviceInstance = {
      id: "device-4",
      type: "gain",
      enabled: true,
      params: {},
      hostPlugin: {
        id: "plugin-2",
        path: "/Library/Audio/Plug-Ins/Components/Space.component",
        name: "Space Echo",
        vendor: "Acme",
        format: "AudioUnit",
        role: "effect",
      },
    };

    expect(getDeviceDisplayInfo(device)).toEqual({
      label: "Space Echo",
      subtitle: "Acme · AudioUnit",
      isHostBacked: true,
    });
  });

  it("uses the resolved device display label in automation targets", () => {
    const track: SessionTrack = {
      id: "track-1",
      session_id: "session-1",
      name: "Track 1",
      type: "audio",
      color: 0,
      volume: 0.8,
      pan: 0,
      is_muted: false,
      is_soloed: false,
      sort_order: 0,
      input_from: null,
      created_at: "",
      sends: [],
      clips: [],
      device_chain: [
        {
          id: "device-5",
          type: "gain",
          enabled: true,
          params: {},
          hostPlugin: {
            id: "plugin-3",
            path: "/Library/Audio/Plug-Ins/VST3/Wide.vst3",
            name: "Wide Gain",
            vendor: "Acme",
            format: "VST3",
            role: "effect",
          },
        },
      ],
    };

    const gainAutomation = getAutomatableParams(track).find((candidate) => candidate.target === "device:device-5:gain");
    expect(gainAutomation?.label).toBe("Wide Gain › Gain");
  });
});
