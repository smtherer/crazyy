// app/page.tsx
"use client";

import { useState, useCallback } from "react";
import { CalibrationPhase } from "@/components/exhibition/CalibrationPhase";
import { ArenaPhase } from "@/components/exhibition/ArenaPhase";
import { ResultsPhase } from "@/components/exhibition/ResultsPhase";
import { FloatingToolbar } from "@/components/exhibition/FloatingToolbar";
import { computeBioBreakdown } from "@/lib/neuro-engine";
import { useWebSerial } from "@/hooks/useWebSerial";
import type { BioBreakdown, SensoryMode } from "@/types/telemetry";

type FlowPhase = "CALIBRATION" | "ARENA" | "RESULTS";

export default function Home() {
  const [phase, setPhase] = useState<FlowPhase>("CALIBRATION");
  const [subjectName, setSubjectName] = useState("Judge");
  const [mode, setMode] = useState<SensoryMode>("VISUAL");
  const [armLength, setArmLength] = useState<number>(0.75);
  const [latency, setLatency] = useState<number>(214.8);
  const [breakdown, setBreakdown] = useState<BioBreakdown>(() =>
    computeBioBreakdown(214.8, 0.75, "VISUAL")
  );
  const [leaderboardKey, setLeaderboardKey] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const handleStrikeComplete = useCallback(
    (recordedLatencyMs: number) => {
      // Default to 195ms if hardware emitted a raw digital strike signal
      const validLatency = recordedLatencyMs > 0 ? recordedLatencyMs : 195.4;
      const calculatedBreakdown = computeBioBreakdown(
        validLatency,
        armLength,
        mode
      );
      setLatency(validLatency);
      setBreakdown(calculatedBreakdown);
      setLeaderboardKey((prev) => prev + 1);
      setPhase("RESULTS");
    },
    [armLength, mode]
  );

  // Unconditional top-level hook execution
  const {
    connectionMode,
    isConnected,
    isConnecting,
    connect,
    sendCommand,
    telemetry,
  } = useWebSerial((hardwareMs) => {
    if (phase === "ARENA") {
      handleStrikeComplete(hardwareMs);
    }
  });

  const handleStartTest = (config: {
    subjectName: string;
    mode: SensoryMode;
    armLength: number;
  }) => {
    setSubjectName(config.subjectName);
    setMode(config.mode);
    setArmLength(config.armLength);
    try {
      sendCommand(`ARM:${config.mode}`);
    } catch (e) {}
    setPhase("ARENA");
  };

  const handleTestAgain = () => {
    setPhase("CALIBRATION");
  };

  return (
    <main className="min-h-screen w-full bg-[#050507] text-zinc-100 overflow-x-hidden selection:bg-red-500 selection:text-white">
      {/* Top right persistent hardware link toolbar */}
      <FloatingToolbar
        connectionMode={connectionMode}
        isConnecting={isConnecting}
        muted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onConnect={connect}
        onSimulateStrike={() => handleStrikeComplete(210.5)}
        showSimulateStrike={phase === "ARENA"}
      />

      {phase === "CALIBRATION" && (
        <CalibrationPhase
          isConnected={isConnected}
          onStart={handleStartTest}
          onStartTest={handleStartTest}
        />
      )}

      {phase === "ARENA" && (
        <ArenaPhase
          subjectName={subjectName}
          mode={mode}
          isConnected={isConnected}
          hardwareStrikeMs={telemetry.lastStrikeMs}
          onComplete={handleStrikeComplete}
          onStrike={handleStrikeComplete}
          onAbort={() => setPhase("CALIBRATION")}
        />
      )}

      {phase === "RESULTS" && (
        <ResultsPhase
          subjectName={subjectName}
          latency={latency}
          breakdown={breakdown}
          leaderboardKey={leaderboardKey}
          mode={mode}
          armLength={armLength}
          onTestAgain={handleTestAgain}
        />
      )}
    </main>
  );
}