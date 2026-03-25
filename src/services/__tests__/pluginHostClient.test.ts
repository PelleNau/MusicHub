import { describe, expect, it } from "vitest";

import {
  normalizeChainNodes,
  normalizeChainLoadRequest,
  normalizeChainLoadResponseData,
  normalizeRenderPreviewRequest,
} from "@/services/pluginHostClient";

describe("pluginHostClient request normalization", () => {
  it("serializes chain load requests to the host contract", () => {
    expect(
      normalizeChainLoadRequest({
        manifestPath: "/tmp/example.json",
      }),
    ).toEqual({
      manifest_path: "/tmp/example.json",
    });
  });

  it("serializes render preview requests with snake_case overrides", () => {
    expect(
      normalizeRenderPreviewRequest({
        manifestPath: "/tmp/example.json",
        inputType: "midi",
        midiNote: 60,
        midiVelocity: 100,
        durationMs: 2000,
      }),
    ).toEqual({
      manifest_path: "/tmp/example.json",
      overrides: {
        input_mode: "midi_note",
        midi_note: 60,
        midi_velocity: 100,
        duration_seconds: 2,
      },
    });
  });

  it("normalizes live chain load responses from the native host", () => {
    expect(
      normalizeChainLoadResponseData(
        {
          chainId: "chain-1",
          manifest: { name: "Workflow Validation Chain" },
          loadedChain: {
            sampleRate: 48000,
            blockSize: 512,
            plugins: [
              {
                index: -1,
                pluginId: "plugin-1",
                pluginName: "AUSampler",
                vendor: "Apple",
                format: "AudioUnit",
                bypass: false,
                supportsEditor: false,
                status: "ok",
                parameterCount: 11,
                latencySamples: 0,
              },
            ],
          },
        },
        17,
      ),
    ).toEqual({
      chainId: "chain-1",
      name: "Workflow Validation Chain",
      sampleRate: 48000,
      blockSize: 512,
      nodeCount: 1,
      nodes: [
        {
          index: 0,
          pluginId: "plugin-1",
          pluginName: "AUSampler",
          vendor: "Apple",
          format: "AudioUnit",
          bypass: false,
          supportsEditor: false,
          stateRestored: false,
          paramCount: 11,
          latencySamples: 0,
          status: "loaded",
          error: undefined,
        },
      ],
      loadedCount: 1,
      missingCount: 0,
      errorCount: 0,
      totalLatencySamples: 0,
      elapsedMs: 17,
    });
  });

  it("normalizes invalid or alternate node indexes from live host events", () => {
    expect(
      normalizeChainNodes([
        {
          index: -1,
          nodeIndex: 4,
          pluginId: "plugin-1",
          pluginName: "AUMatrixReverb",
          vendor: "Apple",
          format: "AudioUnit",
          status: "ok",
        },
        {
          index: -1,
          pluginId: "plugin-2",
          pluginName: "AUSampler",
          vendor: "Apple",
          format: "AudioUnit",
          status: "ok",
        },
      ]),
    ).toEqual([
      {
        index: 4,
        pluginId: "plugin-1",
        pluginName: "AUMatrixReverb",
        vendor: "Apple",
        format: "AudioUnit",
        bypass: false,
        supportsEditor: undefined,
        stateRestored: false,
        paramCount: 0,
        latencySamples: 0,
        status: "loaded",
        error: undefined,
      },
      {
        index: 1,
        pluginId: "plugin-2",
        pluginName: "AUSampler",
        vendor: "Apple",
        format: "AudioUnit",
        bypass: false,
        supportsEditor: undefined,
        stateRestored: false,
        paramCount: 0,
        latencySamples: 0,
        status: "loaded",
        error: undefined,
      },
    ]);
  });
});
