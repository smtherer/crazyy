export type SensoryMode = "VISUAL" | "AUDITORY" | "STROOP" | "FATIGUE_BURST";

export type TestState =
  | "IDLE"
  | "ARMED"
  | "TRIGGERED"
  | "RECORDED"
  | "FALSE_START";

export type PerformanceTier = "ELITE_F1" | "ATHLETIC" | "STANDARD";

export interface BioBreakdown {
  transduction: number;
  afferent: number;
  central: number;
  efferent: number;
  emd: number;
  totalLatency: number;
  velocity: number;
}

export interface TrialRecord {
  id: string;
  subjectName: string;
  armLength: number;
  mode: SensoryMode;
  latency: number;
  velocity: number;
  tier: PerformanceTier;
  timestamp: string;
}

export const LEADERBOARD_STORAGE_KEY = "neuro-reflex-synaptic-leaderboard";
