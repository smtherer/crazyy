// lib/neuroAnticipationEngine.ts
/**
 * Consolidated Neuro-Anticipation & Psychophysics Engine
 * Implements:
 * 1. Flat Hazard Rate (Exponential Decay Delay)
 * 2. Web Audio Psychoacoustic Gantry Synthesizer
 * 3. Inhibitory Motor Tension & Tremor Scoring
 * 4. Asymmetric High-Stakes Penalty Logic
 * 5. Jensen Dual-Point Latency & Conduction Velocity Biometrics
 */

export interface NeuroTensionTelemetry {
    hazardHoldMs: number;
    microTremorIndex: number;
    inhibitoryControlScore: number; // 0 - 100%
    arousalState: "HYPO-AROUSED" | "OPTIMAL_FLOW" | "HYPER_TENSION" | "FALSE_START_TRAP";
    biologicalConductionVelocity?: number; // m/s
  }
  
  export class NeuroAnticipationEngine {
    private static audioCtx: AudioContext | null = null;
  
    // 1. WEB AUDIO PSYCHOACOUSTIC SYNTHESIZER
    private static getAudioContext(): AudioContext | null {
      if (typeof window === "undefined") return null;
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    }
  
    /**
     * Ascending F1 Gantry Metronome Tone (440Hz -> 659Hz)
     * Entrains neural phase locking in auditory cortex
     */
    static playGantryBeep(step: number, totalSteps = 5) {
      const ctx = this.getAudioContext();
      if (!ctx) return;
  
      const baseFrequencies = [440, 493.88, 554.37, 587.33, 659.25];
      const freq = baseFrequencies[Math.min(step, baseFrequencies.length - 1)];
  
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
  
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
  
      osc.connect(gain);
      gain.connect(ctx.destination);
  
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    }
  
    /**
     * Stimulus Crack (Lights Out / Trigger Signal)
     * High-intensity burst to provoke immediate M1 motor firing
     */
    static playStimulusRelease(isAuditoryMode = false) {
      const ctx = this.getAudioContext();
      if (!ctx) return;
  
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
  
      osc.type = isAuditoryMode ? "square" : "sine";
      osc.frequency.setValueAtTime(isAuditoryMode ? 1200 : 880, ctx.currentTime);
  
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
  
      osc.connect(gain);
      gain.connect(ctx.destination);
  
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    }
  
    /**
     * Jarring False-Start Low Sawtooth Buzz (110Hz)
     * Signals immediate autonomic penalty
     */
    static playPenaltyBuzz() {
      const ctx = this.getAudioContext();
      if (!ctx) return;
  
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
  
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(75, ctx.currentTime + 0.35);
  
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
  
      osc.connect(gain);
      gain.connect(ctx.destination);
  
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  
    // 2. FLAT HAZARD RATE HOLD GENERATOR (Niemi & Näätänen Paradigm)
    /**
     * Generates a delay using an exponential distribution:
     * h(t) = lambda (constant hazard rate)
     * Eliminates temporal expectation; the probability of the signal firing
     * in any given millisecond remains completely identical.
     */
    static generateConstantHazardDelay(
      minHoldMs = 1800,
      maxHoldMs = 5200,
      lambda = 0.0014
    ): number {
      // Inverse transform sampling: t = -ln(1 - U) / lambda
      const uniformRandom = Math.random();
      const exponentialDelay = -Math.log(1 - uniformRandom) / lambda;
      const computedDelay = minHoldMs + exponentialDelay;
      return Math.min(maxHoldMs, Math.max(minHoldMs, Math.round(computedDelay)));
    }
  
    // 3. INHIBITORY TENSION & MICRO-TREMOR SCORING
    /**
     * Analyzes kinetic flux and hover stability to compute real-time
     * inhibitory control stability during the silent hold.
     */
    static analyzeMotorInhibition(
      currentKineticFlux: number,
      hoverAltitudeCm: number,
      elapsedHoldMs: number
    ): NeuroTensionTelemetry {
      // Normalize flux into a tremor index
      const microTremorIndex = Math.min(100, Math.round(currentKineticFlux * 1.8));
  
      // Tension increases as hold time extends under high stakes
      const timeTensionMultiplier = Math.min(1.5, 1 + elapsedHoldMs / 4000);
      const effectiveStrain = microTremorIndex * timeTensionMultiplier;
  
      let arousalState: NeuroTensionTelemetry["arousalState"] = "OPTIMAL_FLOW";
      if (effectiveStrain > 60) {
        arousalState = "FALSE_START_TRAP";
      } else if (effectiveStrain > 35) {
        arousalState = "HYPER_TENSION";
      } else if (currentKineticFlux < 5 && elapsedHoldMs > 1500) {
        arousalState = "OPTIMAL_FLOW";
      } else if (currentKineticFlux < 3) {
        arousalState = "HYPO-AROUSED";
      }
  
      const inhibitoryControlScore = Math.max(
        10,
        Math.min(99, Math.round(100 - effectiveStrain * 0.9))
      );
  
      return {
        hazardHoldMs: elapsedHoldMs,
        microTremorIndex,
        inhibitoryControlScore,
        arousalState,
      };
    }
  
    // 4. ASYMMETRIC HIGH-STAKES PENALTY PROTOCOL
    /**
     * Computes penalty status and lockout delta for jump starts
     */
    static evaluateFalseStartPenalty(): {
      penaltyLabel: string;
      lockoutDurationMs: number;
      penaltyDescription: string;
    } {
      this.playPenaltyBuzz();
      return {
        penaltyLabel: "DISQUALIFIED // JUMP START",
        lockoutDurationMs: 3500, // 3.5s forced cognitive reset lockout
        penaltyDescription:
          "Severe rIFC motor brake collapse. Efferent strike triggered prior to sensory release.",
      };
    }
  
    // 5. JENSEN BIOMECHANICAL NERVE CONDUCTION FORMULA
    /**
     * Estimates true peripheral median nerve conduction velocity (m/s)
     * by removing estimated central retinal & cortical synaptic delays (~110ms)
     */
    static calculateMedianNerveVelocity(
      totalLatencyMs: number,
      armLengthCm = 75
    ): { velocityMps: number; centralDelayMs: number; peripheralTransitMs: number } {
      const centralDelayMs = 110; // ~30ms Retina + ~50ms V1/M1 Cortical Gating + ~30ms Motor Endplate
      const peripheralTransitMs = Math.max(15, totalLatencyMs - centralDelayMs);
      const armLengthMeters = armLengthCm / 100;
  
      // v = d / t (m/s)
      const velocityMps = parseFloat(
        (armLengthMeters / (peripheralTransitMs / 1000)).toFixed(1)
      );
  
      return {
        velocityMps: Math.min(85, Math.max(12, velocityMps)),
        centralDelayMs,
        peripheralTransitMs,
      };
    }
  }