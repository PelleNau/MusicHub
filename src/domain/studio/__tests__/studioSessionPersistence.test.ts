import { beforeEach, describe, expect, it, vi } from "vitest";

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: fromMock,
  },
}));

import {
  fetchSessionTrackRecords,
  updateTrackRecord,
} from "@/domain/studio/studioSessionPersistence";

describe("studioSessionPersistence", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("normalizes legacy host-plugin fields when fetching tracks", async () => {
    const trackOrder = vi.fn().mockResolvedValue({
      data: [
        {
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
          device_chain: [
            {
              id: "device-1",
              type: "gain",
              enabled: true,
              params: {},
              nativePluginId: "legacy-1",
              nativePluginPath: "AudioUnit:Effects/aufx,dely,appl",
              nativePluginName: "AUDelay",
              nativePluginVendor: "Apple",
              nativePluginFormat: "AudioUnit",
              nativePluginRole: "effect",
            },
          ],
        },
      ],
      error: null,
    });

    const trackEq = vi.fn(() => ({ order: trackOrder }));
    const trackSelect = vi.fn(() => ({ eq: trackEq }));

    const clipIn = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    const clipSelect = vi.fn(() => ({ in: clipIn }));

    fromMock.mockImplementation((table: string) => {
      if (table === "session_tracks") return { select: trackSelect };
      if (table === "session_clips") return { select: clipSelect };
      throw new Error(`Unexpected table ${table}`);
    });

    const tracks = await fetchSessionTrackRecords("session-1");

    expect(tracks[0]?.device_chain).toEqual([
      {
        id: "device-1",
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
      },
    ]);
  });

  it("normalizes outgoing device chains before updating tracks", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ update });

    await updateTrackRecord("track-1", {
      device_chain: [
        {
          id: "device-1",
          type: "gain",
          enabled: true,
          params: {},
          nativePluginId: "legacy-1",
          nativePluginPath: "AudioUnit:Effects/aufx,dely,appl",
          nativePluginName: "AUDelay",
          nativePluginVendor: "Apple",
          nativePluginFormat: "AudioUnit",
          nativePluginRole: "effect",
        },
      ],
    });

    expect(update).toHaveBeenCalledWith({
      device_chain: [
        {
          id: "device-1",
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
        },
      ],
    });
  });
});
