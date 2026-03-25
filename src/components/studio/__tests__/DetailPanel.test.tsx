import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DetailPanel } from "@/components/studio/DetailPanel";
import type { SessionTrack } from "@/types/studio";

function createTrack(): SessionTrack {
  return {
    id: "track-1",
    session_id: "session-1",
    name: "Synth",
    type: "midi",
    color: 1,
    volume: 0.8,
    pan: 0,
    is_muted: false,
    is_soloed: false,
    sort_order: 0,
    sends: [],
    input_from: null,
    created_at: "",
    clips: [],
    device_chain: [
      {
        id: "device-1",
        type: "sampler",
        enabled: true,
        params: {},
        hostPlugin: {
          id: "plugin-1",
          path: "AudioUnit:Synths/aumu,samp,appl",
          name: "AUSampler",
          vendor: "Apple",
          format: "AudioUnit",
          role: "instrument",
        },
      },
    ],
  };
}

describe("DetailPanel", () => {
  it("shows and triggers the host load action from explicit view-model state", async () => {
    const onLoadNativeChain = vi.fn().mockResolvedValue("chain-1");

    render(
      <DetailPanel
        track={createTrack()}
        onDeviceChainChange={vi.fn()}
        onClose={vi.fn()}
        isConnected
        hasHostBackedDevices
        canLoadNativeChain
        nativeNodeCount={0}
        openEditors={{}}
        onLoadNativeChain={onLoadNativeChain}
      />,
    );

    const loadButtons = screen.getAllByText("Load in Host");
    expect(loadButtons.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(loadButtons[0]);
    });

    await waitFor(() => {
      expect(onLoadNativeChain).toHaveBeenCalledWith("track-1");
    });
  });

  it("shows the native node summary from derived state", () => {
    render(
      <DetailPanel
        track={createTrack()}
        onDeviceChainChange={vi.fn()}
        onClose={vi.fn()}
        isConnected
        nativeChainId="chain-1"
        nativeChainNodes={[]}
        nativeNodeCount={2}
        hasHostBackedDevices
        canLoadNativeChain={false}
        openEditors={{}}
      />,
    );

    expect(screen.getByText("2 native nodes")).toBeInTheDocument();
  });

  it("adds built-in effects as host-backed devices from the detail panel", () => {
    const onDeviceChainChange = vi.fn();

    render(
      <DetailPanel
        track={createTrack()}
        onDeviceChainChange={onDeviceChainChange}
        onClose={vi.fn()}
        nativeNodeCount={0}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Effect/i }));
    fireEvent.click(screen.getByRole("button", { name: "EQ Three" }));

    expect(onDeviceChainChange).toHaveBeenCalledTimes(1);
    const [, nextDevices] = onDeviceChainChange.mock.calls[0];
    expect(nextDevices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "eq3",
          hostPlugin: expect.objectContaining({
            id: "builtin-aunbandeq",
            name: "AUNBandEQ",
          }),
        }),
      ]),
    );
  });

  it("shows busy state while opening a loaded host editor", async () => {
    let resolveOpen: (() => void) | null = null;
    const onOpenEditor = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveOpen = resolve;
        }),
    );

    render(
      <DetailPanel
        track={createTrack()}
        onDeviceChainChange={vi.fn()}
        onClose={vi.fn()}
        isConnected
        nativeChainId="chain-1"
        nativeChainNodes={[
          {
            chainId: "chain-1",
            index: 0,
            pluginId: "plugin-1",
            pluginName: "AUSampler",
            vendor: "Apple",
            format: "AudioUnit",
            bypass: false,
            status: "loaded",
            paramCount: 8,
            supportsEditor: true,
          },
        ]}
        nativeNodeCount={1}
        hasHostBackedDevices
        canLoadNativeChain={false}
        openEditors={{}}
        onOpenEditor={onOpenEditor}
      />,
    );

    const openButtons = screen.getAllByRole("button", { name: "Open in Host" });

    fireEvent.click(openButtons[0]);

    expect(onOpenEditor).toHaveBeenCalledWith("chain-1", 0);
    const openingButtons = screen.getAllByRole("button", { name: "Opening…" });
    expect(openingButtons).toHaveLength(2);
    openingButtons.forEach((button) => expect(button).toBeDisabled());

    resolveOpen?.();

    await waitFor(() => {
      const restoredButtons = screen.getAllByRole("button", { name: "Open in Host" });
      expect(restoredButtons).toHaveLength(2);
      restoredButtons.forEach((button) => expect(button).toBeEnabled());
    });
  });

  it("shows busy state while closing an open editor and marks unsupported nodes", async () => {
    let resolveClose: (() => void) | null = null;
    const onCloseEditor = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveClose = resolve;
        }),
    );

    render(
      <DetailPanel
        track={createTrack()}
        onDeviceChainChange={vi.fn()}
        onClose={vi.fn()}
        isConnected
        nativeChainId="chain-1"
        nativeChainNodes={[
          {
            chainId: "chain-1",
            index: 0,
            pluginId: "plugin-1",
            pluginName: "Massive X",
            vendor: "Native Instruments",
            format: "VST3",
            bypass: false,
            status: "loaded",
            paramCount: 120,
            supportsEditor: true,
          },
          {
            chainId: "chain-1",
            index: 1,
            pluginId: "plugin-2",
            pluginName: "Utility",
            vendor: "Internal",
            format: "Native",
            bypass: false,
            status: "loaded",
            paramCount: 4,
            supportsEditor: false,
          },
        ]}
        nativeNodeCount={2}
        hasHostBackedDevices
        canLoadNativeChain={false}
        openEditors={{ "chain-1:0": true }}
        onCloseEditor={onCloseEditor}
      />,
    );

    const closeButtons = screen.getAllByRole("button", { name: "Close Editor" });

    fireEvent.click(closeButtons[0]);

    expect(onCloseEditor).toHaveBeenCalledWith("chain-1", 0);
    const closingButtons = screen.getAllByRole("button", { name: "Closing…" });
    expect(closingButtons).toHaveLength(2);
    closingButtons.forEach((button) => expect(button).toBeDisabled());
    expect(screen.getByText("No Editor")).toBeInTheDocument();

    resolveClose?.();

    await waitFor(() => {
      const restoredButtons = screen.getAllByRole("button", { name: "Close Editor" });
      expect(restoredButtons).toHaveLength(2);
      restoredButtons.forEach((button) => expect(button).toBeEnabled());
    });
  });
});
