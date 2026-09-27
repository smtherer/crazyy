"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SCALE_MAX_MS = 400;

const REFERENCE_BENCHMARKS = [
  { id: "f1", label: "Max Verstappen / F1 Pilot", ms: 140 },
  { id: "esports", label: "Pro CS / Valorant Player", ms: 170 },
  { id: "student", label: "Average College Adult", ms: 235 },
  { id: "tired", label: "Distracted / Sleep Deprived", ms: 340 },
] as const;

function widthPct(ms: number) {
  return Math.min(100, (ms / SCALE_MAX_MS) * 100);
}

interface BenchmarkHorizonProps {
  subjectLabel: string;
  subjectMs: number;
}

export function BenchmarkHorizon({
  subjectLabel,
  subjectMs,
}: BenchmarkHorizonProps) {
  const rows = [
    ...REFERENCE_BENCHMARKS.slice(0, 2).map((r) => ({ ...r, isYou: false })),
    {
      id: "you",
      label: `YOU (${subjectLabel})`,
      ms: subjectMs,
      isYou: true,
    },
    ...REFERENCE_BENCHMARKS.slice(2).map((r) => ({ ...r, isYou: false })),
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
        Benchmark Comparison Horizon
      </h3>
      <div className="space-y-3">
        {rows.map((row, rowIndex) => {
          const pct = widthPct(row.ms);
          return (
            <div key={row.id} className="relative grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 sm:grid-cols-[200px_1fr_56px]">
              <span
                className={cn(
                  "truncate text-[11px] sm:text-xs",
                  row.isYou
                    ? "font-semibold text-cyan-400"
                    : "text-muted-foreground",
                )}
              >
                {row.label}
              </span>
              <div className="relative h-3 rounded-sm bg-zinc-900 ring-1 ring-zinc-800">
                <motion.div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-sm",
                    row.isYou
                      ? "bg-cyan-500 shadow-[0_0_16px_rgba(6,182,212,0.55)] ring-2 ring-cyan-400/60"
                      : "bg-zinc-600",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                    delay: rowIndex * 0.08,
                  }}
                />
                {row.isYou && (
                  <motion.div
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-cyan-400"
                    initial={{ left: 0, opacity: 0 }}
                    animate={{ left: `calc(${pct}% - 4px)`, opacity: 1 }}
                    transition={{
                      duration: 1.2,
                      ease: "easeOut",
                      delay: rowIndex * 0.08,
                    }}
                  >
                    <span className="block size-0 border-y-[6px] border-l-[8px] border-y-transparent border-l-cyan-400" />
                  </motion.div>
                )}
              </div>
              <motion.span
                className={cn(
                  "text-right font-mono text-xs tabular-nums",
                  row.isYou ? "text-cyan-300" : "text-zinc-500",
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + rowIndex * 0.08, duration: 0.4 }}
              >
                {row.ms.toFixed(1)} ms
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
