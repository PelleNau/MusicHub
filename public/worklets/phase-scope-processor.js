/**
 * PhaseScopeProcessor — AudioWorklet for stereo phase/correlation analysis.
 *
 * Computes stereo correlation coefficient and balance metrics.
 * Useful for phase meters, vectorscopes, and mono-compatibility checks.
 *
 * Messages sent:
 *   - { type: "phase", correlation: number, balance: number }
 *     correlation: -1 (out of phase) to +1 (in phase)
 *     balance: -1 (left) to +1 (right)
 */
class PhaseScopeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._reportInterval = 50; // ~20fps (less demanding)
    this._lastReport = 0;
    this._alive = true;

    // Accumulators for correlation calculation
    this._sumLR = 0;
    this._sumLL = 0;
    this._sumRR = 0;
    this._sumL = 0;
    this._sumR = 0;
    this._count = 0;

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
    if (!input || input.length < 2) return true;

    const left = input[0];
    const right = input[1];

    for (let i = 0; i < left.length; i++) {
      const l = left[i];
      const r = right[i];
      this._sumLR += l * r;
      this._sumLL += l * l;
      this._sumRR += r * r;
      this._sumL += Math.abs(l);
      this._sumR += Math.abs(r);
      this._count++;
    }

    // Pass-through
    for (let ch = 0; ch < input.length; ch++) {
      if (outputs[0] && outputs[0][ch]) {
        outputs[0][ch].set(input[ch]);
      }
    }

    const nowMs = currentTime * 1000;
    if (nowMs - this._lastReport >= this._reportInterval && this._count > 0) {
      // Pearson correlation coefficient
      const denom = Math.sqrt(this._sumLL * this._sumRR);
      const correlation = denom > 0 ? this._sumLR / denom : 0;

      // Stereo balance: -1 = full left, +1 = full right
      const totalEnergy = this._sumL + this._sumR;
      const balance = totalEnergy > 0 ? (this._sumR - this._sumL) / totalEnergy : 0;

      this.port.postMessage({ type: "phase", correlation, balance });

      this._sumLR = 0;
      this._sumLL = 0;
      this._sumRR = 0;
      this._sumL = 0;
      this._sumR = 0;
      this._count = 0;
      this._lastReport = nowMs;
    }

    return true;
  }
}

registerProcessor("phase-scope-processor", PhaseScopeProcessor);
