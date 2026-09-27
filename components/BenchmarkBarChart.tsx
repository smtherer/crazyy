// components/BenchmarkBarChart.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

export interface ComparisonItem {
  label: string;
  sublabel: string;
  ms: number;
  avatar: string;
  isUser?: boolean;
}

interface BenchmarkBarChartProps {
  subjectName: string;
  subjectMs: number;
  dynamicComparisons?: ComparisonItem[];
}

export function BenchmarkBarChart({
  subjectName,
  subjectMs,
  dynamicComparisons,
}: BenchmarkBarChartProps) {
  const userItem: ComparisonItem = {
    label: `YOU (${subjectName || "Participant"})`,
    sublabel: subjectMs > 800 ? "Severe hesitation / cognitive stall" : "Current Synaptic Conduction Run",
    ms: subjectMs,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(subjectName || "driver")}`,
    isUser: true,
  };

  // 1. Gather all comparison entities
  const baselineList: ComparisonItem[] =
    dynamicComparisons && dynamicComparisons.length > 0
      ? [...dynamicComparisons, userItem]
      : [
          { label: "Max Verstappen (F1)", sublabel: "Red Bull launch gantry", ms: 140, avatar: "🏎️" },
          { label: "Tier-1 CS2 Awper", sublabel: "Esports visual snap", ms: 170, avatar: "🎯" },
          { label: "Average High Schooler", sublabel: "CBSE cohort median", ms: 228, avatar: "🎒" },
          { label: "Sleep Deprived Adult", sublabel: "< 5 hrs sleep / fatigue", ms: 340, avatar: "🥱" },
          userItem,
        ];

  // 2. STRICT NUMERICAL SORT (Fastest at top, Slowest at bottom)
  const sortedList = [...baselineList].sort((a, b) => a.ms - b.ms);

  // 3. Dynamic scale auto-scaling so no bar overflows
  const maxMsInSet = Math.max(...sortedList.map((c) => c.ms));
  const scaleMax = Math.max(400, Math.ceil((maxMsInSet * 1.15) / 100) * 100);

  return (
    <div className="w-full border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex justify-between items-baseline border-b border-zinc-900 pb-3 mb-4">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold">
            Dynamic Reaction Comparison Horizon
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
          Ranked by biological conduction speed (Fastest → Slowest)
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Scale: 0 — {scaleMax} ms
        </span>
      </div>

      <div className="relative pl-36 sm:pl-48 pr-16">
        <div className="absolute left-36 sm:left-48 top-0 bottom-6 w-[2px] bg-zinc-700 z-10" />

        <div className="absolute left-36 sm:left-48 right-16 top-0 bottom-6 pointer-events-none flex justify-between z-0">
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <div key={pct} className="h-full border-r border-zinc-800/60" />
          ))}
        </div>

        <div className="space-y-3 py-1">
          {sortedList.map((row, idx) => {
            const widthPct = Math.min(100, Math.max(4, (row.ms / scaleMax) * 100));

            return (
              <div key={`${row.label}-${idx}`} className="relative flex items-center">
                <div className="absolute -left-36 sm:-left-48 w-32 sm:w-44 pr-3 text-right">
                  <div className={`text-xs truncate ${row.isUser ? "text-cyan-400 font-bold" : "text-zinc-300 font-medium"}`}>
                    #{idx + 1} {row.label}
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate">{row.sublabel}</div>
                </div>

                <div className="relative w-full h-7 flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.04 }}
                    className={`relative h-5 rounded-none flex items-center justify-end ${
                      row.isUser
                        ? "bg-[#0071e3] shadow-[0_0_20px_rgba(0,113,227,0.5)] ring-1 ring-cyan-400/60"
                        : "bg-zinc-700"
                    }`}
                  >
                    <div className="absolute -right-3 z-20 flex items-center justify-center">
                      <div className={`w-6 h-6 border bg-black overflow-hidden flex items-center justify-center text-xs ${
                        row.isUser ? "border-[#0071e3] ring-1 ring-cyan-400" : "border-zinc-700"
                      }`}>
                        {row.avatar.startsWith("http") ? (
                          <img src={row.avatar} alt={row.label} className="w-full h-full object-cover" />
                        ) : (
                          <span>{row.avatar}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <div className="pl-5 text-xs font-mono font-semibold tabular-nums text-zinc-300 whitespace-nowrap">
                    <span className={row.isUser ? "text-cyan-400 font-bold" : ""}>
                      {row.ms.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-zinc-500 ml-1">ms</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-500">
          <span>0ms</span>
          <span>{Math.round(scaleMax * 0.25)}ms</span>
          <span>{Math.round(scaleMax * 0.5)}ms</span>
          <span>{Math.round(scaleMax * 0.75)}ms</span>
          <span>{scaleMax}ms</span>
        </div>
      </div>
    </div>
  );
}