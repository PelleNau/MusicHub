import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NativeParamPanel } from "@/components/studio/NativeParamPanel";
import type {
  ChainParamsResponse,
  PluginPresetsResponse,
} from "@/services/pluginHostClient";

function createParams(label: string): ChainParamsResponse {
  return {
    chainId: "chain-1",
    nodes: [
      {
        nodeIndex: 0,
        pluginName: "TestVerb",
        params: [
          {
            id: 1,
            name: "Mix",
            value: Number(label),
            min: 0,
            max: 1,
            label,
            automatable: true,
          },
        ],
      },
    ],
  };
}

function createPresets(currentIndex: number): PluginPresetsResponse {
  return {
    currentIndex,
    presets: [
      { index: 0, name: "Preset A" },
      { index: 1, name: "Preset B" },
    ],
  };
}

describe("NativeParamPanel", () => {
  it("refreshes params and presets after loading a preset", async () => {
    const onFetchParams = vi
      .fn<() => Promise<ChainParamsResponse | null>>()
      .mockResolvedValueOnce(createParams("0.5"))
      .mockResolvedValueOnce(createParams("0.9"));
    const onFetchPresets = vi
      .fn<() => Promise<PluginPresetsResponse | null>>()
      .mockResolvedValueOnce(createPresets(1))
      .mockResolvedValueOnce(createPresets(0));
    const onLoadPreset = vi.fn().mockResolvedValue({ loaded: true, name: "Preset A" });

    render(
      <NativeParamPanel
        chainId="chain-1"
        onFetchParams={onFetchParams}
        onFetchPresets={onFetchPresets}
        onLoadPreset={onLoadPreset}
        onSaveState={vi.fn().mockResolvedValue({ stateId: "state-1" })}
        onRestoreState={vi.fn().mockResolvedValue(true)}
        onSetParam={vi.fn()}
        onParamChanged={() => () => undefined}
      />,
    );

    expect(await screen.findByText("TestVerb")).toBeInTheDocument();
    expect(screen.getByText("0.5")).toBeInTheDocument();

    const presetSelect = await screen.findByRole("combobox");
    fireEvent.change(presetSelect, { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Load Preset" }));

    await waitFor(() => {
      expect(onLoadPreset).toHaveBeenCalledWith("chain-1", 0, 0);
      expect(onFetchParams).toHaveBeenCalledTimes(2);
      expect(onFetchPresets).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("0.9")).toBeInTheDocument();
    expect((await screen.findByRole("combobox")).value).toBe("0");
  });

  it("keeps saved state available across preset loads and refreshes after restore", async () => {
    const onFetchParams = vi
      .fn<() => Promise<ChainParamsResponse | null>>()
      .mockResolvedValueOnce(createParams("0.5"))
      .mockResolvedValueOnce(createParams("0.9"))
      .mockResolvedValueOnce(createParams("0.2"));
    const onFetchPresets = vi
      .fn<() => Promise<PluginPresetsResponse | null>>()
      .mockResolvedValueOnce(createPresets(1))
      .mockResolvedValueOnce(createPresets(0))
      .mockResolvedValueOnce(createPresets(1));
    const onLoadPreset = vi.fn().mockResolvedValue({ loaded: true, name: "Preset A" });
    const onSaveState = vi.fn().mockResolvedValue({ stateId: "state-1" });
    const onRestoreState = vi.fn().mockResolvedValue(true);

    render(
      <NativeParamPanel
        chainId="chain-1"
        onFetchParams={onFetchParams}
        onFetchPresets={onFetchPresets}
        onLoadPreset={onLoadPreset}
        onSaveState={onSaveState}
        onRestoreState={onRestoreState}
        onSetParam={vi.fn()}
        onParamChanged={() => () => undefined}
      />,
    );

    expect(await screen.findByText("TestVerb")).toBeInTheDocument();
    expect(screen.getByText("0.5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save State" }));

    await waitFor(() => {
      expect(onSaveState).toHaveBeenCalledWith("chain-1", 0);
    });

    fireEvent.change(await screen.findByRole("combobox"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Load Preset" }));

    await waitFor(() => {
      expect(onLoadPreset).toHaveBeenCalledWith("chain-1", 0, 0);
      expect(screen.getByRole("button", { name: "Restore State" })).toBeEnabled();
    });

    expect(await screen.findByText("0.9")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Restore State" }));

    await waitFor(() => {
      expect(onRestoreState).toHaveBeenCalledWith("chain-1", 0, "state-1");
      expect(onFetchParams).toHaveBeenCalledTimes(3);
      expect(onFetchPresets).toHaveBeenCalledTimes(3);
    });

    expect(await screen.findByText("0.2")).toBeInTheDocument();
  });
});
