// lib/neuro-engine.ts

import type { BioBreakdown, PerformanceTier, SensoryMode } from "@/types/telemetry";

const AFFERENT_MS = 10.0;
const EMD_MS = 24.0;
const EFFERENT_MIN_MS = 8.0;

function transductionMs(mode: SensoryMode): number {
  switch (mode) {
    case "AUDITORY":
      return 1.2; // Mechanical stereocilia deflection (Organ of Corti)
    case "VISUAL":
    case "STROOP":
    case "FATIGUE_BURST":
    default:
      return 35.0; // Retinal rhodopsin phototransduction cascade
  }
}

export function tierFromLatency(latencyMs: number): PerformanceTier {
  if (latencyMs < 185) return "ELITE_F1";
  if (latencyMs <= 240) return "ATHLETIC";
  return "STANDARD";
}

/**
 * Corrected Bio-Mathematical Engine:
 * Peripheral motor axons (A-alpha) conduct at 54-62 m/s.
 * The dynamic variable that changes between humans is Central Synaptic Processing.
 */
export function computeBioBreakdown(
  latencyMs: number,
  armLengthMeters: number,
  mode: SensoryMode,
): BioBreakdown {
  const transduction = transductionMs(mode);
  const afferent = AFFERENT_MS;
  const emd = EMD_MS;

  // Real human A-alpha motor velocity: 54 to 62 m/s based on reflex tier
  const calculatedVelocity = Math.max(
    52.0,
    Math.min(64.0, 62.0 - (latencyMs - 160) * 0.05)
  );

  // t = d / v (in ms) -> Typically ~12.5 - 14.2 ms for a 0.75m arm
  const efferent = Math.max(
    EFFERENT_MIN_MS,
    parseFloat(((armLengthMeters / calculatedVelocity) * 1000).toFixed(1))
  );

  // The true biological variable is central processing (dendritic summation & cortex delay)
  const central = Math.max(
    30.0,
    parseFloat((latencyMs - (transduction + afferent + efferent + emd)).toFixed(1))
  );

  const totalLatency = parseFloat(latencyMs.toFixed(1));
  const efferentSec = efferent / 1000;
  const velocity = parseFloat((armLengthMeters / efferentSec).toFixed(1));

  return {
    transduction,
    afferent,
    central,
    efferent,
    emd,
    totalLatency,
    velocity,
  };
}

export interface SynapNetDiagnostics {
  predictedNeuralAge: number;
  neuromuscularEfficiency: number; // 0 - 100%
  synapticVesicleRisk: "OPTIMAL" | "ELEVATED FATIGUE" | "DEPLETED";
  actionPotentialPeakMv: number;
  dopaminergicIndex: number;
}

/**
 * SynapNet AI: In-browser heuristic neural inference
 */
export function computeNeuralInference(
  latencyMs: number,
  breakdown: BioBreakdown,
  mode: SensoryMode
): SynapNetDiagnostics {
  const targetMs = mode === "AUDITORY" ? 155 : 205;
  const delta = latencyMs - targetMs;

  // Neuromuscular Efficiency (0 - 100%)
  const efficiency = Math.round(
    Math.max(28, Math.min(99, 100 - Math.max(0, delta * 0.42)))
  );

  // Predicted Biological Neural Age (Reflex conduction peaks around age 18-22)
  let neuralAge = 19 + Math.round(delta / 8.5);
  neuralAge = Math.max(16, Math.min(68, neuralAge));

  // Acetylcholine vesicle depletion risk
  let vesicleRisk: SynapNetDiagnostics["synapticVesicleRisk"] = "OPTIMAL";
  if (breakdown.central > 135) vesicleRisk = "DEPLETED";
  else if (breakdown.central > 105) vesicleRisk = "ELEVATED FATIGUE";

  return {
    predictedNeuralAge: neuralAge,
    neuromuscularEfficiency: efficiency,
    synapticVesicleRisk: vesicleRisk,
    actionPotentialPeakMv: parseFloat((32.4 + (latencyMs % 3) * 0.8).toFixed(1)),
    dopaminergicIndex: Math.round(Math.max(40, 100 - delta * 0.35)),
  };
}