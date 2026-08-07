/**
 * Original carnival-cabinet SFX via Web Audio — no commercial samples.
 */

export class ClawgrabAudio {
  constructor() {
    /** @type {AudioContext | null} */
    this.ctx = null;
    this.enabled = true;
    this.master = 0.24;
  }

  async unlock() {
    this.ensure();
    if (this.ctx?.state === "suspended") await this.ctx.resume();
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
  }

  setEnabled(on) {
    this.enabled = on;
  }

  /**
   * @param {number} freq
   * @param {number} dur
   * @param {OscillatorType} [type]
   * @param {number} [gain]
   * @param {number} [when]
   */
  tone(freq, dur, type = "square", gain = 0.12, when = 0) {
    if (!this.enabled) return;
    this.ensure();
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain * this.master, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.03, dur));
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  coin() {
    this.tone(880, 0.06, "square", 0.09);
    this.tone(1320, 0.08, "triangle", 0.07, 0.05);
  }

  move() {
    this.tone(190, 0.035, "triangle", 0.055);
    this.tone(140, 0.03, "sine", 0.03, 0.02);
  }

  drop() {
    this.tone(240, 0.09, "sawtooth", 0.09);
    this.tone(160, 0.13, "triangle", 0.07, 0.06);
  }

  clamp() {
    this.tone(320, 0.04, "square", 0.08);
    this.tone(200, 0.06, "sawtooth", 0.05, 0.04);
  }

  slip() {
    this.tone(140, 0.1, "sawtooth", 0.06);
    this.tone(90, 0.14, "triangle", 0.05, 0.08);
  }

  win() {
    for (let i = 0; i < 5; i++) {
      this.tone(440 * Math.pow(1.2, i), 0.09, "square", 0.08, i * 0.06);
    }
  }

  miss() {
    this.tone(220, 0.08, "triangle", 0.06);
    this.tone(160, 0.12, "sine", 0.05, 0.08);
  }

  empty() {
    this.tone(110, 0.1, "sawtooth", 0.05);
  }

  startBeep() {
    this.tone(520, 0.08, "square", 0.1);
    this.tone(780, 0.1, "triangle", 0.08, 0.07);
  }
}
