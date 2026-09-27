// components/NeuralNetworkVisualizer.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import type { SynapNetOutput } from "@/lib/synapNet";

interface NeuralNetworkVisualizerProps {
  inference: SynapNetOutput;
  latency: number;
  velocity: number;
}

export function NeuralNetworkVisualizer({
  inference,
  latency,
  velocity,
}: NeuralNetworkVisualizerProps) {
  const { activations, predictedAge, efficiency } = inference;

  const inputLabels = ["LATENCY", "ARM SPAN", "MODE", "EFFERENT"];
  const outputLabels = [
    { label: "EFFICIENCY", val: `${efficiency}%`, color: "text-cyan-400" },
    { label: "NEURAL AGE", val: `${predictedAge} yrs`, color: "text-emerald-400" },
  ];

  return (
    <div className="border border-zinc-800 bg-zinc-950/80 p-5 text-zinc-100 flex flex-col justify-between">
      <div className="flex justify-between items-baseline border-b border-zinc-900 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Brain className="size-4 text-cyan-400" />
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-bold">
            SynapNet MLP Inference Engine
          </h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-400">STATUS: INFERENCE ACTIVE</span>
      </div>

      {/* SVG Neural Layer Canvas */}
      <div className="relative w-full h-44 my-auto flex items-center justify-center">
        <svg viewBox="0 0 380 160" className="w-full h-full overflow-visible">
          {/* Layer 1 to 2 Connections */}
          {activations.inputs.map((val, i) => {
            const y1 = 20 + i * 40;
            return activations.hidden.map((hVal, j) => {
              const y2 = 15 + j * 26;
              const opacity = Math.max(0.1, Math.min(0.8, (val + hVal) / 2));
              return (
                <line
                  key={`l1-${i}-${j}`}
                  x1="55"
                  y1={y1}
                  x2="190"
                  y2={y2}
                  stroke="#0071e3"
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
              );
            });
          })}

          {/* Layer 2 to 3 Connections */}
          {activations.hidden.map((hVal, j) => {
            const y1 = 15 + j * 26;
            return activations.outputs.map((oVal, k) => {
              const y2 = 45 + k * 70;
              const opacity = Math.max(0.15, Math.min(0.9, (hVal + oVal) / 2));
              return (
                <line
                  key={`l2-${j}-${k}`}
                  x1="190"
                  y1={y1}
                  x2="320"
                  y2={y2}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
              );
            });
          })}

          {/* Input Nodes (4) */}
          {activations.inputs.map((val, i) => {
            const y = 20 + i * 40;
            return (
              <g key={`in-${i}`}>
                <circle cx="55" cy={y} r="8" fill="#09090b" stroke="#0071e3" strokeWidth="2" />
                <circle cx="55" cy={y} r={Math.max(2, val * 5)} fill="#38bdf8" />
                <text x="42" y={y + 3} textAnchor="end" fill="#71717a" fontSize="8" fontFamily="monospace">
                  {inputLabels[i]}
                </text>
              </g>
            );
          })}

          {/* Hidden Nodes (6) */}
          {activations.hidden.map((hVal, j) => {
            const y = 15 + j * 26;
            return (
              <g key={`h-${j}`}>
                <circle cx="190" cy={y} r="6" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
                <circle cx="190" cy={y} r={Math.max(1.5, Math.min(4.5, hVal * 4))} fill="#0071e3" />
              </g>
            );
          })}

          {/* Output Nodes (2) */}
          {outputLabels.map((node, k) => {
            const y = 45 + k * 70;
            return (
              <g key={`out-${k}`}>
                <circle cx="320" cy={y} r="9" fill="#09090b" stroke="#10b981" strokeWidth="2" />
                <circle cx="320" cy={y} r="4" fill="#10b981" />
                <text x="335" y={y + 4} textAnchor="start" fill="#a1a1aa" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  {node.val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-zinc-900 text-center font-mono">
        <div className="p-1.5 border border-zinc-900 bg-zinc-900/40">
          <div className="text-[9px] text-zinc-500">Predicted Age</div>
          <div className="text-xs font-bold text-emerald-400 mt-0.5">{predictedAge} yrs</div>
        </div>
        <div className="p-1.5 border border-zinc-900 bg-zinc-900/40">
          <div className="text-[9px] text-zinc-500">Efficiency</div>
          <div className="text-xs font-bold text-cyan-400 mt-0.5">{efficiency}%</div>
        </div>
        <div className="p-1.5 border border-zinc-900 bg-zinc-900/40">
          <div className="text-[9px] text-zinc-500">Conduction</div>
          <div className="text-xs font-bold text-white mt-0.5">{velocity.toFixed(1)} m/s</div>
        </div>
      </div>
    </div>
  );
}