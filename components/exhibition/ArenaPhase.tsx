// components/exhibition/ArenaPhase.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Zap, Target } from "lucide-react";
import { DriverVisionOverlay } from "@/components/DriverVisionOverlay";
import { NeuroAnticipationEngine } from "@/lib/neuroAnticipationEngine";
import type { SensoryMode } from "@/types/telemetry";

interface ArenaPhaseProps {
  subjectName?: string;
  mode?: SensoryMode;
  isConnected?: boolean;
  hardwareStrikeMs?: number | null;
  onComplete?: (latency: number) => void;
  onStrike?: (latency: number) => void;
  onAbort?: () => void;
  [key: string]: any;
}

type Stage = "STANDBY" | "COUNTDOWN" | "WAITING_FOR_STRIKE" | "RECORDED" | "FALSE_START";

export function ArenaPhase(props: ArenaPhaseProps) {
  const {
    subjectName = "Driver",
    mode = "VISUAL",
    isConnected = false,
    hardwareStrikeMs = null,
    onAbort,
  } = props;

  const [stage, setStage] = useState<Stage>("STANDBY");
  const [activeLedCount, setActiveLedCount] = useState<number>(0);
  const [falseStartNotice, setFalseStartNotice] = useState<string>("");
  const [extinctionFlash, setExtinctionFlash] = useState<boolean>(false);

  // Direct DOM ref for the clock — ZERO React re-renders during timing loop
  const msDisplayRef = useRef<HTMLSpanElement | null>(null);

  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const countdownTimerRef = useRef<NodeJS.Timeout[]>([]);
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedStrikeRef = useRef<number | null>(null);

  // 1. Strike Completion
  const completeTest = useCallback((finalLatency: number) => {
    setStage("RECORDED");
    if (msDisplayRef.current) {
      msDisplayRef.current.textContent = finalLatency.toFixed(1);
    }
    NeuroAnticipationEngine.playStimulusRelease(false);

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const finishCallback = props.onComplete || props.onStrike;
    setTimeout(() => {
      if (typeof finishCallback === "function") {
        finishCallback(finalLatency);
      }
    }, 600);
  }, [props]);

  // 2. F1 Sequence with Intersensory Facilitation & Constant Hazard Rate
  const startSequence = useCallback(() => {
    setStage("COUNTDOWN");
    setActiveLedCount(0);
    setFalseStartNotice("");
    setExtinctionFlash(false);
    if (msDisplayRef.current) msDisplayRef.current.textContent = "—";

    // Ascending Gantry Tone Sequence
    const steps = [3, 6, 10, 13, 16];
    steps.forEach((count, i) => {
      const t = setTimeout(() => {
        setActiveLedCount(count);
        NeuroAnticipationEngine.playGantryBeep(i, steps.length);
      }, (i + 1) * 700);
      countdownTimerRef.current.push(t);
    });

    // Niemi & Näätänen Flat Hazard Delay (Exponential Curve: 1.8s - 5.0s)
    const hazardDelay = NeuroAnticipationEngine.generateConstantHazardDelay(2000, 5200);

    triggerTimeoutRef.current = setTimeout(() => {
      // EXTINCTION EVENT: Snap LEDs off instantly
      setActiveLedCount(0);
      setExtinctionFlash(true);
      setTimeout(() => setExtinctionFlash(false), 80);

      // INTERSENSORY FACILITATION: Audio tone simultaneously with visual drop
      NeuroAnticipationEngine.playStimulusRelease(mode === "AUDITORY");

      setStage("WAITING_FOR_STRIKE");
      startTimeRef.current = performance.now();

      // Zero-lag direct DOM counter
      const updateClock = () => {
        const currentDelta = performance.now() - startTimeRef.current;
        if (msDisplayRef.current) {
          msDisplayRef.current.textContent = currentDelta.toFixed(1);
        }
        animFrameRef.current = requestAnimationFrame(updateClock);
      };
      animFrameRef.current = requestAnimationFrame(updateClock);
    }, hazardDelay);
  }, [mode]);

  // 3. Strike & False-Start Handler (Early Keypress / Early Button Slam)
  const handleStrike = useCallback(() => {
    if (stage === "COUNTDOWN" || stage === "STANDBY") {
      const penalty = NeuroAnticipationEngine.evaluateFalseStartPenalty();
      setStage("FALSE_START");
      setFalseStartNotice(penalty.penaltyLabel);

      countdownTimerRef.current.forEach(clearTimeout);
      if (triggerTimeoutRef.current) clearTimeout(triggerTimeoutRef.current);
      setActiveLedCount(0);

      setTimeout(() => {
        setStage("STANDBY");
        startSequence();
      }, penalty.lockoutDurationMs);
      return;
    }

    if (stage === "WAITING_FOR_STRIKE") {
      const delta = performance.now() - startTimeRef.current;
      completeTest(delta);
    }
  }, [stage, completeTest, startSequence]);

  // 4. GAZE LOST HANDLER (Triggered by DriverVisionOverlay)
  const handleGazeLost = useCallback(() => {
    if (stage === "COUNTDOWN") {
      NeuroAnticipationEngine.playPenaltyBuzz();
      setStage("FALSE_START");
      setFalseStartNotice("⚠️ GAZE LOST // KEEP EYES LOCKED ON TARGET");

      countdownTimerRef.current.forEach(clearTimeout);
      if (triggerTimeoutRef.current) clearTimeout(triggerTimeoutRef.current);
      setActiveLedCount(0);

      setTimeout(() => {
        setStage("STANDBY");
        startSequence();
      }, 2500);
    }
  }, [stage, startSequence]);

  // Initial sequence arming
  useEffect(() => {
    const initTimer = setTimeout(() => {
      startSequence();
    }, 500);

    return () => {
      clearTimeout(initTimer);
      countdownTimerRef.current.forEach(clearTimeout);
      if (triggerTimeoutRef.current) clearTimeout(triggerTimeoutRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [startSequence]);

  // Keyboard Spacebar / Enter Strike Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleStrike();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleStrike]);

  // Hardware Strike / Contact Listener from Arduino Web Serial
  useEffect(() => {
    if (
      hardwareStrikeMs !== undefined &&
      hardwareStrikeMs !== null &&
      hardwareStrikeMs !== lastProcessedStrikeRef.current
    ) {
      lastProcessedStrikeRef.current = hardwareStrikeMs;

      if (stage === "WAITING_FOR_STRIKE") {
        // Use firmware microsecond reading if positive; calculate from browser delta if raw contact pulse
        const finalLatency =
          hardwareStrikeMs > 0 && hardwareStrikeMs < 10000
            ? hardwareStrikeMs
            : performance.now() - startTimeRef.current;
        completeTest(finalLatency);
      } else if (stage === "COUNTDOWN" || stage === "STANDBY") {
        handleStrike(); // Registers false start penalty on early touch
      }
    }
  }, [hardwareStrikeMs, stage, completeTest, handleStrike]);

  return (
    <div
      onClick={handleStrike}
      className={`relative h-screen w-screen bg-[#050507] text-zinc-100 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 select-none overflow-hidden cursor-pointer transition-colors duration-75 ${
        extinctionFlash ? "bg-zinc-900" : ""
      }`}
    >
      {/* 1. TOP HEADER STATUS */}
      <div className="w-full max-w-6xl flex justify-between items-center border-b border-zinc-800/80 pb-3 z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-red-500 font-bold">
            Live Arena // {subjectName}
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-xs font-mono text-zinc-400">
            {mode === "AUDITORY" ? "ACOUSTIC TRIGGER" : "VISUAL GANTRY (EXTINCTION)"}
          </span>
        </div>

        {onAbort && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAbort();
            }}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-mono text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="size-3.5" /> Abort Test
          </button>
        )}
      </div>

      {/* 2. DUAL COCKPIT: LED RING + FOVEAL RETICLE + DRIVER VISION */}
      <div className="relative my-auto flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 w-full max-w-5xl z-10">
        
        {/* Ring Stage */}
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            {stage === "WAITING_FOR_STRIKE" && (
              <div className="absolute size-72 sm:size-80 rounded-full bg-emerald-500/25 blur-3xl pointer-events-none animate-pulse" />
            )}

            {stage === "FALSE_START" && (
              <div className="absolute size-72 sm:size-80 rounded-full bg-red-600/30 blur-3xl pointer-events-none" />
            )}

            <div className="relative size-64 sm:size-72 lg:size-80 flex items-center justify-center">
              <svg className="size-full overflow-visible" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="70" fill="none" stroke="#18181b" strokeWidth="1.5" />
                <circle cx="100" cy="100" r="85" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="2 4" />

                {/* 16 LED Ring Nodes */}
                {Array.from({ length: 16 }).map((_, i) => {
                  const angle = (i * 360) / 16 - 90;
                  const rad = (angle * Math.PI) / 180;
                  const cx = 100 + 78 * Math.cos(rad);
                  const cy = 100 + 78 * Math.sin(rad);

                  const isActive = i < activeLedCount;
                  const isTriggered = stage === "WAITING_FOR_STRIKE";
                  const isFalse = stage === "FALSE_START";

                  let fillColor = "#18181b";
                  let glow = "none";

                  if (isFalse) {
                    fillColor = "#ef4444";
                    glow = "drop-shadow(0 0 8px #ef4444)";
                  } else if (isTriggered) {
                    fillColor = "#10b981";
                    glow = "drop-shadow(0 0 12px #10b981)";
                  } else if (isActive) {
                    fillColor = "#dc2626";
                    glow = "drop-shadow(0 0 10px #dc2626)";
                  }

                  return (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r="7.5"
                      fill={fillColor}
                      style={{ filter: glow, transition: "fill 0.06s ease" }}
                    />
                  );
                })}
              </svg>

              {/* CENTER FOVEAL FIXATION RETICLE & STATUS */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                {stage === "FALSE_START" ? (
                  <div className="text-red-500 flex flex-col items-center">
                    <AlertTriangle className="size-10 mb-1" />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest">
                      Fault Triggered
                    </span>
                  </div>
                ) : stage === "WAITING_FOR_STRIKE" ? (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-emerald-400 text-3xl font-black font-mono tracking-widest uppercase animate-pulse">
                      GO!
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mt-0.5">
                      LIGHTS OUT
                    </span>
                  </motion.div>
                ) : stage === "COUNTDOWN" ? (
                  <div className="flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 0.4, 0.7, 0.35], opacity: [0.7, 1, 0.8, 1] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      className="relative flex items-center justify-center size-14 border border-cyan-500/50 rounded-full"
                    >
                      <div className="absolute size-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
                      <div className="absolute w-8 h-[1px] bg-cyan-500/80" />
                      <div className="absolute h-8 w-[1px] bg-cyan-500/80" />
                    </motion.div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold mt-2">
                      LOCK GAZE HERE
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Target className="size-8 text-zinc-600 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mt-2">
                      ARMING
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Millisecond Counter */}
          <div className="mt-4 text-center font-mono">
            <div className="text-4xl sm:text-5xl font-black tabular-nums tracking-tighter text-white">
              <span ref={msDisplayRef}>—</span>
              <span className="text-lg font-normal text-zinc-500 ml-2">ms</span>
            </div>
            {falseStartNotice && (
              <div className="text-xs font-mono text-red-500 mt-1 uppercase tracking-wider font-bold">
                {falseStartNotice}
              </div>
            )}
          </div>
        </div>

        {/* Vision Cockpit Overlay */}
        <div className="w-64 sm:w-72 lg:w-80 pointer-events-auto">
          <DriverVisionOverlay
            isArmed={stage === "COUNTDOWN"}
            onGazeLost={handleGazeLost}
          />
        </div>
      </div>

      {/* 3. FOOTER */}
      <div className="w-full max-w-xl text-center pb-2 z-10 pointer-events-none">
        <div className="p-3 border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
          <div className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Zap className="size-3.5 text-red-500 fill-current" />
            {stage === "WAITING_FOR_STRIKE"
              ? "SLAM BUTTON / TAP WIRES NOW!"
              : "FOCUS ON CENTER DOT — WAIT FOR LIGHTS OUT"}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
            Grip desk edge with non-striking hand to facilitate spinal motor firing.
          </div>
        </div>
      </div>
    </div>
  );
}