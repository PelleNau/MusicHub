import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DeviceChain } from "@/components/studio/DeviceChain";

describe("DeviceChain", () => {
  it("renders host-backed devices with resolved plugin metadata", () => {
    render(
      <DeviceChain
        devices={[
          {
            id: "device-1",
            type: "gain",
            enabled: true,
            params: { gain: 0 },
            hostPlugin: {
              id: "plugin-1",
              path: "/Library/Audio/Plug-Ins/VST3/Wide.vst3",
              name: "Wide Gain",
              vendor: "Acme",
              format: "VST3",
              role: "effect",
            },
          },
        ]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Wide Gain")).toBeInTheDocument();
    expect(screen.getByText("host")).toBeInTheDocument();
    expect(screen.getByText("Acme · VST3")).toBeInTheDocument();
    expect(screen.getByText("Parameters open in the native host.")).toBeInTheDocument();
  });
});
