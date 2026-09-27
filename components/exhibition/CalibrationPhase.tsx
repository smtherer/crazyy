// components/exhibition/CalibrationPhase.tsx
"use client";

import React, { useState } from "react";
import { Eye, Volume2, ArrowRight, Zap, Ruler, User } from "lucide-react";
import type { SensoryMode } from "@/types/telemetry";

interface CalibrationPhaseProps {
  onStart?: (config: { subjectName: string; mode: SensoryMode; armLength: number }) => void;
  onStartTest?: (config: { subjectName: string; mode: SensoryMode; armLength: number }) => void;
  onComplete?: (config: { subjectName: string; mode: SensoryMode; armLength: number }) => void;
  onBegin?: (config: { subjectName: string; mode: SensoryMode; armLength: number }) => void;
  isConnected?: boolean;
  [key: string]: any;
}

export function CalibrationPhase(props: CalibrationPhaseProps) {
  const { isConnected = false } = props;
  const [subjectName, setSubjectName] = useState("");
  const [mode, setMode] = useState<SensoryMode>("VISUAL");
  const [armLength, setArmLength] = useState<number>(0.75);

  // Auto-detect and fire whatever start function was provided by page.tsx
  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const payload = {
      subjectName: subjectName.trim() || "Participant #01",
      mode,
      armLength,
    };

    console.log("Starting test with payload:", payload);

    const callback =
      props.onStart ||
      props.onStartTest ||
      props.onComplete ||
      props.onBegin ||
      props.onCalibrate ||
      (Object.values(props).find((v) => typeof v === "function") as any);

    if (typeof callback === "function") {
      callback(payload);
    } else {
      console.error("No launch callback found on props:", props);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050507] text-zinc-100 flex flex-col justify-between p-4 sm:p-6 lg:px-12 lg:py-8 overflow-hidden font-sans select-none">
      
      {/* 1. TOP STATUS & F1 LIGHTS */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-red-500 uppercase">
              Human Reaction Bench
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-[11px] font-mono text-zinc-500">SPEED OF NERVES (v = d / t)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase mt-0.5">
            Reaction Time Setup
          </h1>
        </div>

        {/* F1 5-Light Gantry */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 p-1.5 border border-zinc-800 bg-zinc-950">
            {[1, 2, 3, 4, 5].map((light) => (
              <span
                key={light}
                className="size-3 bg-red-600/90 shadow-[0_0_8px_rgba(220,38,38,0.7)]"
              />
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-1 border border-zinc-800 bg-zinc-950 text-xs font-mono">
            <span className={`size-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
            <span className="text-zinc-300">
              {isConnected ? "HARDWARE ONLINE" : "SIMULATION MODE"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. THREE-STEP WIDE CONFIGURATION GRID */}
      <div className="w-full max-w-6xl mx-auto my-auto py-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* STEP 1: NAME */}
        <div className="border border-zinc-800/80 bg-zinc-950/80 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-baseline border-b border-zinc-900 pb-2">
              <span className="text-3xl font-black font-mono text-zinc-700">01</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Step One</span>
            </div>

            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wide">
                Your Name
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Saved to the session leaderboard.
              </p>
            </div>
            {/* NEUROMUSCULAR FACILITATION BRIEFING (JENDRASSIK PROTOCOL) */}
<div className="p-3.5 border border-cyan-500/20 bg-cyan-950/10 font-mono mb-4 text-left">
  <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5 mb-1.5">
    <Zap className="size-3 text-cyan-400 fill-current" />
    Pre-Strike Neuromuscular Protocol (Jendrassik Priming)
  </div>
  <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
    <li>
      <strong className="text-zinc-200">Grip the Desk:</strong> Clench the edge of the desk firmly with your <span className="text-cyan-300">non-striking hand</span> to prime the spinal motor-neuron pool.
    </li>
    <li>
      <strong className="text-zinc-200">Lock Foveal Focus:</strong> Stare strictly at the center cyan crosshair to suppress 40ms of saccadic eye jumps.
    </li>
    <li>
      <strong className="text-zinc-200">Zero Anticipation Guessing:</strong> Early strikes incur an immediate disqualification lockout.
    </li>
  </ul>
</div>
            <input
              type="text"
              placeholder="e.g. Aadi, Judge, Alex..."
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full h-11 px-3.5 bg-zinc-900 border border-zinc-800 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {["Visitor", "Judge", "Student", "Gamer"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSubjectName(tag)}
                className="px-2.5 py-1 text-[11px] font-mono border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-red-500/60 transition"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: SENSE SELECTION */}
        <div className="border border-zinc-800/80 bg-zinc-950/80 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-baseline border-b border-zinc-900 pb-2">
              <span className="text-3xl font-black font-mono text-zinc-700">02</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Step Two</span>
            </div>

            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wide">
                Choose Sense
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                React to a visual light or an acoustic beep.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode("VISUAL")}
                className={`p-3.5 border text-left flex flex-col justify-between h-28 transition ${
                  mode === "VISUAL"
                    ? "border-red-500 bg-red-950/20 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <Eye className={`size-4 ${mode === "VISUAL" ? "text-red-400" : "text-zinc-500"}`} />
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Eyes
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-white">Light Flash</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Avg: ~220 ms</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode("AUDITORY")}
                className={`p-3.5 border text-left flex flex-col justify-between h-28 transition ${
                  mode === "AUDITORY"
                    ? "border-emerald-500 bg-emerald-950/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <Volume2 className={`size-4 ${mode === "AUDITORY" ? "text-emerald-400" : "text-zinc-500"}`} />
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-emerald-400">
                    Faster!
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-white">Sound Beep</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Avg: ~170 ms</div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-2.5 border border-zinc-900 bg-zinc-900/40 text-[10px] text-zinc-400 font-mono">
            {mode === "VISUAL"
              ? "Eyes take ~35ms to convert light into nerve pulses."
              : "Ears vibrate hair cells directly — faster than light!"}
          </div>
        </div>

        {/* STEP 3: ARM LENGTH */}
        <div className="border border-zinc-800/80 bg-zinc-950/80 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-baseline border-b border-zinc-900 pb-2">
              <span className="text-3xl font-black font-mono text-zinc-700">03</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Step Three</span>
            </div>

            <div>
              <div className="flex justify-between items-baseline">
                <h2 className="text-base font-bold text-white uppercase tracking-wide">
                  Arm Length
                </h2>
                <span className="font-mono text-xs font-bold text-red-400">
                  {armLength.toFixed(2)} meters
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Calculates your nerve speed ($v = d / t$).
              </p>
            </div>

            <input
              type="range"
              min="0.50"
              max="1.05"
              step="0.01"
              value={armLength}
              onChange={(e) => setArmLength(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 accent-red-500 cursor-pointer"
            />

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "Shorter", desc: "Kids", val: 0.62 },
                { label: "Average", desc: "Teens/Adults", val: 0.75 },
                { label: "Longer", desc: "Tall", val: 0.88 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setArmLength(p.val)}
                  className={`py-2 px-1 border text-center transition ${
                    armLength === p.val
                      ? "border-red-500 bg-red-950/30 text-white font-bold"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="text-xs font-mono">{p.label}</div>
                  <div className="text-[9px] text-zinc-500 mt-0.5">{p.val}m</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-2.5 border border-zinc-900 bg-zinc-900/40 text-[10px] text-zinc-400 font-mono">
            Signal travel down your arm: ~{((armLength / 58.0) * 1000).toFixed(1)} ms
          </div>
        </div>

      </div>

      {/* 3. FULL-WIDTH LAUNCH BUTTON */}
      <div className="w-full max-w-6xl mx-auto pt-2">
        <button
          type="button"
          onClick={handleStart}
          className="group w-full h-14 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition shadow-[0_0_30px_rgba(220,38,38,0.4)] active:scale-[0.99]"
        >
          <span>Start Reaction Test</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1.5" />
        </button>
      </div>

    </div>
  );
}