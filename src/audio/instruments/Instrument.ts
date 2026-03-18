/**
 * Instrument — abstract interface for synth/sampler instruments.
 *
 * Instruments generate audio from MIDI note events and connect their
 * output into a track's signal chain. They manage polyphonic voices
 * internally and handle parameter updates in real-time.
 */

export interface NoteEvent {
  pitch: number;      // MIDI note number 0–127
  velocity: number;   // 0–127
  when: number;       // AudioContext time to start
  duration: number;   // seconds
}

export interface Instrument {
  /** Human-readable type identifier */
  readonly type: string;

  /** The output node to connect into the signal chain */
  readonly output: AudioNode;

  /** Schedule a note-on + note-off pair */
  scheduleNote(event: NoteEvent): void;

  /** Immediate note-on (for audition / live play) */
  noteOn(pitch: number, velocity: number): void;

  /** Immediate note-off */
  noteOff(pitch: number): void;

  /** All notes off (panic) */
  allNotesOff(): void;

  /** Update a parameter value */
  setParam(key: string, value: number): void;

  /** Update all parameters at once */
  setParams(params: Record<string, number>): void;

  /** Dispose all resources */
  dispose(): void;
}

/** Wave type mapping from numeric param to OscillatorType */
export const WAVE_TYPES: OscillatorType[] = ["sine", "triangle", "sawtooth", "square"];
