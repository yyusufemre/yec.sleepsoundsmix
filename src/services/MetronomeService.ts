/**
 * MetronomeService
 *
 * BPM-driven tick engine. Uses a drift-corrected setInterval to trigger
 * native one-shot tick synthesis.
 *
 * Design decisions:
 * - Each beat: asks the native module to synthesize one short tick. This keeps
 *   the metronome independent from Firebase URLs and avoids looping audio files.
 * - Drift correction: we track the expected next-beat timestamp and compute how
 *   far ahead or behind we are, adjusting the next interval accordingly.
 * - The service is a plain singleton (not a React component) so it survives
 *   re-renders and can be called from anywhere.
 */

import NativeSoundManager from './NativeSoundManager';

type OnTickCallback = () => void;

class MetronomeService {
  private bpm: number = 60;
  private volume: number = 0.5; // 0-1
  private running: boolean = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private nextBeatAt: number = 0;
  private onTickCallbacks: Set<OnTickCallback> = new Set();

  /** Start or restart the metronome at the current BPM. */
  start(bpm: number, volume: number) {
    this.stop();
    this.bpm = bpm;
    this.volume = volume;
    this.running = true;
    this.nextBeatAt = Date.now();
    this._tick();
  }

  /** Update BPM in real-time without restarting the audio session. */
  setBpm(bpm: number) {
    this.bpm = bpm;
    // Rebase nextBeatAt so the next tick fires at the correct interval from NOW,
    // preventing double-ticks or extra-long gaps when BPM changes mid-flight.
    this.nextBeatAt = Date.now() + (60 / bpm) * 1000;
  }

  /** Update volume in real-time. */
  setVolume(volume: number) {
    this.volume = volume;
  }

  stop() {
    this.running = false;
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  isRunning() {
    return this.running;
  }

  /** Register a callback invoked on every beat (for UI animations). */
  addTickListener(cb: OnTickCallback) {
    this.onTickCallbacks.add(cb);
    return () => this.onTickCallbacks.delete(cb);
  }

  private _tick() {
    if (!this.running) return;

    NativeSoundManager.playMetronomeTick(this.volume);

    // Notify UI listeners
    this.onTickCallbacks.forEach(cb => cb());

    // Compute next beat time with drift correction
    const intervalMs = (60 / this.bpm) * 1000;
    this.nextBeatAt += intervalMs;
    const delay = Math.max(0, this.nextBeatAt - Date.now());

    this.timeoutId = setTimeout(() => this._tick(), delay);
  }
}

export default new MetronomeService();
