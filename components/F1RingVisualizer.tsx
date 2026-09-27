"use client";

import { motion } from "framer-motion";
import type { SensoryMode, TestState } from "@/types/telemetry";
import { cn } from "@/lib/utils";

const LED_COUNT = 16;
const RADIUS = 88;
const CENTER = 100;

function ledPosition(index: number) {
  const angle = (index / LED_COUNT) * Math.PI * 2 - Math.PI / 2;
  return {
    cx: CENTER + RADIUS * Math.cos(angle),
    cy: CENTER + RADIUS * Math.sin(angle),
  };
}

interface F1RingVisualizerProps {
  state: TestState;
  mode: SensoryMode;
  countdownIndex?: number;
  size?: "default" | "arena";
  variant?: "cockpit" | "keynote";
}

export function F1RingVisualizer({
  state,
  countdownIndex = 0,
  size = "default",
  variant = "cockpit",
}: F1RingVisualizerProps) {
  const isKeynote = variant === "keynote";
  const triggeredFlash = state === "TRIGGERED" || state === "RECORDED";

  return (
    <div
      className={cn(
        "relative mx-auto w-full",
        size === "arena" ? "max-w-[min(88vw,480px)]" : "max-w-[280px]",
      )}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full"
        aria-label="Reflex stimulus ring"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 14}
          fill="none"
          stroke="#27272a"
          strokeWidth="1"
        />

        {Array.from({ length: LED_COUNT }).map((_, i) => {
          const { cx, cy } = ledPosition(i);
          const armedLit = state === "ARMED" && i <= countdownIndex;
          const triggered = state === "TRIGGERED" || state === "RECORDED";
          const falseStart = state === "FALSE_START";

          let fill = "#27272a";

          if (isKeynote) {
            if (state === "IDLE") fill = "#3f3f46";
            else if (falseStart) fill = "#52525b";
            else if (triggered) fill = i % 2 === 0 ? "#0071e3" : "#ffffff";
            else if (armedLit) fill = i === countdownIndex ? "#ffffff" : "#52525b";
          } else {
            if (state === "IDLE") fill = "#06b6d4";
            else if (falseStart) fill = i % 2 === 0 ? "#ef4444" : "#7f1d1d";
            else if (triggered) fill = i % 3 === 0 ? "#10b981" : "#06b6d4";
            else if (armedLit) fill = i === countdownIndex ? "#ef4444" : "#f59e0b";
          }

          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={5}
              fill={fill}
              animate={
                falseStart
                  ? { opacity: [1, 0.35, 1] }
                  : triggeredFlash && isKeynote
                    ? { opacity: [0.7, 1, 0.85] }
                    : state === "IDLE"
                      ? { opacity: [0.45, 0.75, 0.45] }
                      : { opacity: 1 }
              }
              transition={
                falseStart
                  ? { duration: 0.15, repeat: Infinity }
                  : triggeredFlash && isKeynote
                    ? { duration: 0.28, repeat: 1 }
                    : state === "IDLE"
                      ? { duration: 2.4, repeat: Infinity, delay: i * 0.07 }
                      : { duration: 0.2 }
              }
            />
          );
        })}

        <circle
          cx={CENTER}
          cy={CENTER}
          r={48}
          fill="#000000"
          stroke="#27272a"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
