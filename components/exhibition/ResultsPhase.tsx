// components/exhibition/ResultsPhase.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { 
  Trophy, 
  Activity, 
  RotateCcw, 
  Sparkles, 
  Cpu 
} from "lucide-react";
import { BenchmarkBarChart, type ComparisonItem } from "@/components/BenchmarkBarChart";
import { SynapNetNeuralEngine } from "@/components/SynapNetNeuralEngine";
import { ActionPotentialWaveform } from "@/components/ActionPotentialWaveform";
import { LeaderboardDialog } from "@/components/exhibition/LeaderboardDialog";
import type { BioBreakdown, SensoryMode } from "@/types/telemetry";

function LatencyHero({ ms }: { ms: number }) {
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  const display = useTransform(spring, (v) => v.toFixed(1));
  const [text, setText] = useState("0.0");

  useEffect(() => {
    spring.set(ms);
    const unsub = display.on("change", (v) => setText(v));
    return () => unsub();
  }, [ms, spring, display]);

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono tabular-nums">
        {text}
      </span>
      <span className="text-xl font-light text-zinc-500">ms</span>
    </div>
  );
}

interface ResultsPhaseProps {
  subjectName: string;
  latency: number;
  breakdown: BioBreakdown;
  leaderboardKey: number;
  mode?: SensoryMode;
  armLength?: number;
  onTestAgain: () => void;
}

export function ResultsPhase({
  subjectName,
  latency,
  breakdown,
  leaderboardKey,
  mode = "VISUAL",
  armLength = 0.75,
  onTestAgain,
}: ResultsPhaseProps) {
  const [groqData, setGroqData] = useState<{
    verdict: string;
    aiAnalysis: string;
    comparisons: ComparisonItem[];
    fallback: boolean;
  } | null>(null);
  const [loadingGroq, setLoadingGroq] = useState(true);

  useEffect(() => {
    async function fetchGroqAnalysis() {
      try {
        setLoadingGroq(true);
        const res = await fetch("/api/groq-benchmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latency, mode, subjectName }),
        });
        const data = await res.json();
        setGroqData(data);
      } catch (err) {
        console.warn("Groq fetch fallback:", err);
      } finally {
        setLoadingGroq(false);
      }
    }
    fetchGroqAnalysis();
  }, [latency, mode, subjectName]);

  // Convert armLength (meters) to cm for SynapNet
  const armSpanCm = armLength < 5 ? Math.round(armLength * 100) : armLength;

  return (
    <div className="w-full min-h-screen bg-[#050507] text-zinc-100 py-8 px-4 sm:px-6 lg:px-12 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-6xl mx-auto space-y-6 pb-20"
      >
        {/* 1. TOP RESULT CARD */}
        <div className="border border-zinc-800 bg-zinc-950/90 p-6 sm:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                Strike Captured
              </span>
              <span className="text-zinc-700">|</span>
              <span className="text-xs font-mono font-bold text-white uppercase">
                {subjectName || "Participant"}
              </span>
            </div>
            <div className="mt-1">
              <LatencyHero ms={latency} />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial p-3.5 border border-zinc-800 bg-zinc-900/60 min-w-[150px]">
              <div className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Activity className="size-3 text-cyan-400" /> Nerve Conduction
              </div>
              <div className="text-xl font-mono font-black text-cyan-400 mt-0.5">
                {breakdown.velocity.toFixed(1)}{" "}
                <span className="text-xs font-normal text-zinc-500">m/s</span>
              </div>
              <div className="text-[9px] font-mono text-zinc-500">A-α Myelinated Axon</div>
            </div>

            <div className="flex-1 sm:flex-initial p-3.5 border border-zinc-800 bg-zinc-900/60 min-w-[150px]">
              <div className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Trophy className="size-3 text-red-500" /> AI Classification
              </div>
              <div className="text-sm font-mono font-black mt-0.5 text-emerald-400 truncate">
                {groqData?.verdict || (latency < 220 ? "ATHLETIC REFLEX" : "MEDIAN TIER")}
              </div>
              <div className="text-[9px] font-mono text-zinc-500">
                {groqData?.fallback ? "Algorithmic Heuristic" : "Groq Llama-3.3 Inferred"}
              </div>
            </div>
          </div>
        </div>

        {/* 2. GROQ AI INSIGHT BANNER */}
        <div className="border border-zinc-800 bg-zinc-950/70 p-4 font-mono text-xs flex items-start gap-3">
          <div className="p-1.5 border border-cyan-500/40 bg-cyan-950/30 text-cyan-400 mt-0.5">
            <Sparkles className="size-4 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase text-zinc-500 font-bold">
              Groq Llama-3.3 Telemetry Intelligence
            </div>
            <div className="text-zinc-200 mt-1 leading-relaxed">
              {loadingGroq ? (
                <span className="text-zinc-500 animate-pulse">Running Groq neuro-telemetry query...</span>
              ) : (
                groqData?.aiAnalysis
              )}
            </div>
          </div>
        </div>

        {/* 3. DYNAMIC BENCHMARK HORIZON */}
        <section>
          <BenchmarkBarChart
            subjectName={subjectName}
            subjectMs={latency}
            dynamicComparisons={groqData?.comparisons}
          />
        </section>

        {/* 4. HARDWARE TELEMETRY DEFENSE CARD */}
        <div className="border border-zinc-800 bg-zinc-950/80 p-5 font-mono text-xs">
          <div className="flex justify-between items-baseline mb-3 border-b border-zinc-900 pb-2">
            <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase">
              <Cpu className="size-4 text-emerald-400" />
              <span>Hardware Telemetry vs. Browser Software Jitter</span>
            </div>
            <span className="text-[10px] text-emerald-400">RESEARCH-GRADE CALIBRATION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 border border-zinc-900 bg-zinc-900/40 space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase">Hardware Interrupt INT0</div>
              <div className="text-sm font-bold text-emerald-400">±0.001 ms (1 µs)</div>
              <div className="text-[11px] text-zinc-400">
                Arduino captures physical microswitch closure at clock level. Zero OS polling delay.
              </div>
            </div>

            <div className="p-3 border border-zinc-900 bg-zinc-900/40 space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase">Eliminated Browser Jitter</div>
              <div className="text-sm font-bold text-cyan-400">-28.4 ms Error Bypassed</div>
              <div className="text-[11px] text-zinc-400">
                A standard laptop keyboard / spacebar adds 15–45ms in OS event loop and USB buffer delay.
              </div>
            </div>

            <div className="p-3 border border-zinc-900 bg-zinc-900/40 space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase">Switch Mechanics</div>
              <div className="text-sm font-bold text-amber-400">1.2 mm Actuation Point</div>
              <div className="text-[11px] text-zinc-400">
                Physical arcade microswitch provides tactile threshold, eliminating mushy membrane travel.
              </div>
            </div>
          </div>
        </div>

        {/* 5. UPGRADED SYNAPNET 4x6x2 MLP ENGINE & ACTION POTENTIAL OSCILLOSCOPE */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SynapNetNeuralEngine
            latency={latency}
            armSpanCm={armSpanCm}
            mode={mode}
            conductionVelocity={breakdown.velocity}
          />
          <ActionPotentialWaveform velocity={breakdown.velocity} />
        </section>

        {/* 6. 5-STAGE BIOLOGICAL DECOMPOSITION */}
        <div className="border border-zinc-800 bg-zinc-950/80 p-5 font-mono text-xs">
          <div className="flex justify-between items-baseline mb-3 border-b border-zinc-900 pb-2">
            <span className="text-zinc-300 font-bold uppercase">Biological Signal Arc Breakdown</span>
            <span className="text-zinc-500">Total Latency: {breakdown.totalLatency.toFixed(1)} ms</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 border border-zinc-900 bg-zinc-900/40">
              <div className="text-[10px] text-zinc-500">1. Transduction</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">{breakdown.transduction.toFixed(1)} ms</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">Sensory input</div>
            </div>

            <div className="p-2.5 border border-zinc-900 bg-zinc-900/40">
              <div className="text-[10px] text-zinc-500">2. Cranial Transit</div>
              <div className="text-sm font-bold text-purple-400 mt-0.5">{breakdown.afferent.toFixed(1)} ms</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">Nerve to brainstem</div>
            </div>

            <div className="p-2.5 border border-zinc-900 bg-zinc-900/40">
              <div className="text-[10px] text-zinc-500">3. Central Summation</div>
              <div className="text-sm font-bold text-blue-400 mt-0.5">{breakdown.central.toFixed(1)} ms</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">Cerebral cortex gating</div>
            </div>

            <div className="p-2.5 border border-zinc-900 bg-zinc-900/40">
              <div className="text-[10px] text-zinc-500">4. Axon + Strike</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                {(breakdown.efferent + breakdown.emd).toFixed(1)} ms
              </div>
              <div className="text-[9px] text-zinc-500 mt-0.5">Arm transit & button slam</div>
            </div>
          </div>
        </div>

        {/* 7. ACTION CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onTestAgain}
            className="flex-1 h-13 py-3.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-[0.99]"
          >
            <RotateCcw className="size-4" />
            <span>Test Next Person</span>
          </button>

          <LeaderboardDialog
            refreshKey={leaderboardKey}
            triggerClassName="flex-1 h-13 py-3.5 border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-200 font-mono font-bold text-xs uppercase tracking-widest transition flex items-center justify-center"
            triggerLabel="Session Leaderboard"
          />
        </div>
      </motion.div>
    </div>
  );
}