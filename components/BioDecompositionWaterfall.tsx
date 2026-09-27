"use client";

import { motion } from "framer-motion";
import type { BioBreakdown } from "@/types/telemetry";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  {
    key: "transduction" as const,
    label: "Sensory Transduction",
    sub: "Cochlear / retinal receptor cascade",
    color: "bg-amber-500",
    bar: "bg-amber-500/90",
  },
  {
    key: "afferent" as const,
    label: "Cranial Afferent",
    sub: "CN VIII / II → brainstem relay",
    color: "bg-violet-500",
    bar: "bg-violet-500/90",
  },
  {
    key: "central" as const,
    label: "Central Cortex",
    sub: "Premotor + prefrontal integration",
    color: "bg-blue-500",
    bar: "bg-blue-500/90",
  },
  {
    key: "efferent" as const,
    label: "Efferent Peripheral",
    sub: "Myelinated A-α motor axon (v = d/t)",
    color: "bg-cyan-500",
    bar: "bg-cyan-500/90",
  },
  {
    key: "emd" as const,
    label: "EMD Coupling",
    sub: "Flexor carpi radialis electromechanical delay",
    color: "bg-emerald-500",
    bar: "bg-emerald-500/90",
  },
];

interface BioDecompositionWaterfallProps {
  breakdown: BioBreakdown | null;
  className?: string;
}

export function BioDecompositionWaterfall({
  breakdown,
  className,
}: BioDecompositionWaterfallProps) {
  const total = breakdown?.totalLatency ?? 1;

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4 backdrop-blur-md",
        className,
      )}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Latency Budget Waterfall
        </h3>
        <span className="font-mono text-xs tabular-nums text-cyan-500">
          {breakdown ? `${breakdown.totalLatency.toFixed(1)} ms` : "— ms"}
        </span>
      </div>

      <div className="flex h-3 overflow-hidden rounded-sm bg-zinc-950 ring-1 ring-zinc-800">
        {breakdown &&
          SEGMENTS.map((seg, i) => {
            const ms = breakdown[seg.key];
            const pct = (ms / total) * 100;
            return (
              <motion.div
                key={seg.key}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={cn("h-full min-w-0", seg.bar)}
                title={`${seg.label}: ${ms.toFixed(1)} ms`}
              />
            );
          })}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {SEGMENTS.map((seg) => {
          const ms = breakdown?.[seg.key];
          return (
            <div
              key={seg.key}
              className="rounded-lg border border-zinc-800/60 bg-zinc-950/50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", seg.color)} />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {seg.label}
                </span>
              </div>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums tracking-tighter text-zinc-100">
                {ms != null ? `${ms.toFixed(1)}` : "—"}
                <span className="ml-0.5 text-xs text-zinc-500">ms</span>
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-zinc-600">
                {seg.sub}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
