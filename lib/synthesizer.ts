/** Zero-dependency Web Audio synthesizer for cockpit cues */
export class SynapticSynthesizer {
  private ctx: AudioContext | null = null;
  private muted = false;

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted() {
    return this.muted;
  }

  init(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  playTone(
    frequency: number,
    type: OscillatorType,
    duration: number,
    gainValue = 0.15,
  ) {
    if (this.muted) return;
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  playF1CountdownBeep() {
    this.playTone(440, "sine", 0.07, 0.12);
  }

  playGoCue() {
    if (this.muted) return;
    const ctx = this.init();
    const t = ctx.currentTime;
    [1200, 1200].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.02);
      gain.gain.setValueAtTime(0.14, t + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i * 0.02);
      osc.stop(t + 0.12);
    });
  }

  playSuccessChime() {
    if (this.muted) return;
    const freqs = [523, 659, 784, 1046];
    freqs.forEach((f, i) => {
      setTimeout(() => this.playTone(f, "sine", 0.09, 0.1), i * 55);
    });
  }

  playFalseStartAlarm() {
    if (this.muted) return;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playTone(130, "sawtooth", 0.18, 0.2), i * 220);
    }
  }

  playStrikeSound() {
    if (this.muted) return;
    const ctx = this.init();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }
}

export const synthesizer = new SynapticSynthesizer();
