/**
 * WaveformProcessor — AudioWorklet for live waveform capture.
 *
 * Captures audio frames and downsamples to a fixed-width buffer,
 * then sends the waveform snapshot to the main thread for visualization.
 *
 * Messages received:
 *   - { type: "set-width", value: number } — set output sample count (default 256)
 *   - { type: "set-interval", value: number } — report interval in ms (default 33ms ~30fps)
 *   - { type: "dispose" } — stop processing
 *
 * Messages sent:
 *   - { type: "waveform", data: Float32Array } — downsampled waveform (min/max interleaved)
 */
class WaveformProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._width = 256;
    this._reportInterval = 33; // ~30fps
    this._lastReport = 0;
    this._buffer = [];
    this._alive = true;

    this.port.onmessage = (e) => {
      if (e.data.type === "set-width") {
        this._width = e.data.value;
      } else if (e.data.type === "set-interval") {
        this._reportInterval = e.data.value;
      } else if (e.data.type === "dispose") {
        this._alive = false;
      }
    };
  }

  process(inputs, outputs, _parameters) {
    if (!this._alive) return false;

    const input = inputs[0];
    if (!input || input.length === 0) return true;

    // Collect mono (channel 0) samples
    const samples = input[0];
    for (let i = 0; i < samples.length; i++) {
      this._buffer.push(samples[i]);
    }

    // Pass-through
    for (let ch = 0; ch < input.length; ch++) {
      if (outputs[0] && outputs[0][ch]) {
        outputs[0][ch].set(input[ch]);
      }
    }

    // Report at interval
    const nowMs = currentTime * 1000;
    if (nowMs - this._lastReport >= this._reportInterval && this._buffer.length > 0) {
      const data = this._downsample(this._buffer, this._width);
      this._buffer = [];
      this._lastReport = nowMs;
      this.port.postMessage({ type: "waveform", data });
    }

    return true;
  }

  /**
   * Downsample a buffer to `width` points using min/max pairs.
   * Returns Float32Array of length width*2 (interleaved min, max).
   */
  _downsample(buffer, width) {
    const result = new Float32Array(width * 2);
    const samplesPerPixel = buffer.length / width;

    for (let i = 0; i < width; i++) {
      const start = Math.floor(i * samplesPerPixel);
      const end = Math.min(Math.floor((i + 1) * samplesPerPixel), buffer.length);
      let min = 1;
      let max = -1;
      for (let j = start; j < end; j++) {
        const s = buffer[j];
        if (s < min) min = s;
        if (s > max) max = s;
      }
      result[i * 2] = min;
      result[i * 2 + 1] = max;
    }
    return result;
  }
}

registerProcessor("waveform-processor", WaveformProcessor);
