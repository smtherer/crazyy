// components/ActionPotentialWaveform.tsx
"use client";

import React from "react";
import { Zap } from "lucide-react";

interface ActionPotentialWaveformProps {
  velocity?: number;
}

export function ActionPotentialWaveform({ velocity = 52.1 }: ActionPotentialWaveformProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/80 p-5 font-mono relative backdrop-blur-xl">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Zap className="size-3.5 text-red-500 fill-current" />
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-300 font-bold">
            AXONAL MEMBRANE POTENTIAL (HODGKIN-HUXLEY)
          </span>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold">PEAK: +35 mV</span>
      </div>

      <p className="text-[11px] text-zinc-400 font-mono mb-4">
        Depolarization spike (Na⁺ influx) and repolarization (K⁺ efflux) across Nodes of Ranvier.
      </p>

      {/* SVG Membrane Potential Waveform */}
      <div className="relative w-full h-32">
        <svg className="size-full overflow-visible" viewBox="0 0 400 130">
          <line x1="0" y1="35" x2="400" y2="35" stroke="#27272a" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="0" y1="75" x2="400" y2="75" stroke="#27272a" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="0" y1="105" x2="400" y2="105" stroke="#3f3f46" strokeWidth="1" />

          <text x="8" y="32" className="fill-zinc-600 text-[8.5px] font-mono">+35 mV (Spike)</text>
          <text x="8" y="72" className="fill-zinc-600 text-[8.5px] font-mono">0 mV</text>
          <text x="8" y="102" className="fill-zinc-600 text-[8.5px] font-mono">-70 mV (Resting)</text>

          <path
            d="M 40 105 L 140 105 Q 170 105 185 85 L 205 20 Q 212 10 220 50 L 235 120 Q 248 126 265 110 L 285 105 L 380 105"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <circle cx="205" cy="20" r="4.5" fill="#10b981" style={{ filter: "drop-shadow(0 0 6px #10b981)" }} />
        </svg>
      </div>

      <div className="flex justify-between pt-3 border-t border-zinc-900 text-[10px] text-zinc-500">
        <span>Conduction: {velocity.toFixed(1)} m/s</span>
        <span>Myelin Sheath: A-α Motor Axon</span>
      </div>
    </div>
  );
}