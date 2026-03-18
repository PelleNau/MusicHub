/**
 * MeterProcessor — AudioWorklet for RMS & peak level metering.
 *
 * Runs on the audio render thread for sample-accurate, low-latency analysis.
 * Sends { rms: number[], peak: number[] } per channel to the main thread
 * at a configurable reporting interval (default ~60fps).
 *
 * Parameters:
 *   - reportIntervalMs (via port message): how often to report (default 16ms)
 */
class MeterProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._reportInterval = 16; // ms (~60fps)
    this._lastReport = 0;
    this._rmsAccum = [];
    this._peakAccum = [];
    this._sampleCount = 0;
    this._alive = true;

    this.port.onmessage = (e) => {
      if (e.data.type === "set-interval") {
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

    const numChannels = input.length;

    // Initialize accumulators if channel count changed
    if (this._rmsAccum.length !== numChannels) {
      this._rmsAccum = new Array(numChannels).fill(0);
      this._peakAccum = new Array(numChannels).fill(0);
      this._sampleCount = 0;
    }

    // Accumulate RMS and peak
    for (let ch = 0; ch < numChannels; ch++) {
      const samples = input[ch];
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        this._rmsAccum[ch] += s * s;
        const abs = Math.abs(s);
        if (abs > this._peakAccum[ch]) this._peakAccum[ch] = abs;
      }
    }
    this._sampleCount += input[0].length;

    // Pass-through: copy input to output so the signal chain isn't broken
    for (let ch = 0; ch < numChannels; ch++) {
      if (outputs[0] && outputs[0][ch]) {
        outputs[0][ch].set(input[ch]);
      }
    }

    // Check if it's time to report
    const nowMs = currentTime * 1000;
    if (nowMs - this._lastReport >= this._reportInterval && this._sampleCount > 0) {
      const rms = new Float32Array(numChannels);
      const peak = new Float32Array(numChannels);

      for (let ch = 0; ch < numChannels; ch++) {
        rms[ch] = Math.sqrt(this._rmsAccum[ch] / this._sampleCount);
        peak[ch] = this._peakAccum[ch];
        this._rmsAccum[ch] = 0;
        this._peakAccum[ch] = 0;
      }
      this._sampleCount = 0;
      this._lastReport = nowMs;

      this.port.postMessage({ type: "meter", rms, peak });
    }

    return true;
  }
}

registerProcessor("meter-processor", MeterProcessor);
