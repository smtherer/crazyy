// hooks/useWebSerial.ts
"use client";

import { useState, useRef, useCallback } from "react";

export type SerialConnectionMode = "simulated" | "hardware";

export interface SerialTelemetry {
  status: "disconnected" | "connected" | "armed" | "staging" | "go" | "false_start" | "timeout";
  currentStage: number;
  lastStrikeMs: number | null;
}

export function useWebSerial(onHardwareStrike?: (ms: number) => void) {
  const [connectionMode, setConnectionMode] = useState<SerialConnectionMode>("simulated");
  const [isConnecting, setIsConnecting] = useState(false);
  const [telemetry, setTelemetry] = useState<SerialTelemetry>({
    status: "disconnected",
    currentStage: 0,
    lastStrikeMs: null,
  });

  const portRef = useRef<any>(null);
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
  const keepReadingRef = useRef(false);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !("serial" in navigator)) {
      alert("Web Serial is supported on Google Chrome or Microsoft Edge.");
      return;
    }

    try {
      setIsConnecting(true);
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(port.writable);
      writerRef.current = textEncoder.writable.getWriter();

      keepReadingRef.current = true;
      setConnectionMode("hardware");
      setTelemetry((prev) => ({ ...prev, status: "connected" }));
      setIsConnecting(false);

      let buffer = "";
      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;

            // 1. Matches timed strike readings from Arduino firmware
            if (line.startsWith("STRIKE:") || line.includes("STRIKE RECORDED:")) {
              const match = line.match(/\d+(\.\d+)?/);
              if (match) {
                const ms = parseFloat(match[0]);
                setTelemetry((prev) => ({ ...prev, lastStrikeMs: ms }));
                if (onHardwareStrike) onHardwareStrike(ms);
              }
            } 
            // 2. Matches raw physical wire taps ("CONTACT_STRIKE")
            else if (line.includes("CONTACT_STRIKE") || line.includes("CONTACT DETECTED")) {
              // Send negative timestamp ID to guarantee React state change detection
              const contactId = -performance.now();
              setTelemetry((prev) => ({ ...prev, lastStrikeMs: contactId }));
              if (onHardwareStrike) onHardwareStrike(contactId);
            }
            // 3. Status events from hardware
            else if (line.includes("EVENT:ARMED") || line.includes("ARMING")) {
              setTelemetry((prev) => ({ ...prev, status: "armed" }));
            } else if (line.startsWith("STAGE:")) {
              const stageNum = parseInt(line.replace("STAGE:", ""), 10);
              setTelemetry((prev) => ({ ...prev, currentStage: stageNum }));
            } else if (line.includes("EVENT:GO")) {
              setTelemetry((prev) => ({ ...prev, status: "go" }));
            } else if (line.includes("FALSE START")) {
              setTelemetry((prev) => ({ ...prev, status: "false_start" }));
            }
          }
        }
      }
    } catch (err) {
      console.error("Serial connection failed:", err);
      setIsConnecting(false);
      setConnectionMode("simulated");
    }
  }, [onHardwareStrike]);

  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;
    if (writerRef.current) {
      try {
        await writerRef.current.close();
      } catch (e) {}
      writerRef.current = null;
    }
    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch (e) {}
      portRef.current = null;
    }
    setConnectionMode("simulated");
    setTelemetry((prev) => ({ ...prev, status: "disconnected" }));
  }, []);

  const sendCommand = useCallback(async (cmd: string) => {
    if (writerRef.current) {
      try {
        await writerRef.current.write(cmd.endsWith("\n") ? cmd : `${cmd}\n`);
      } catch (err) {
        console.error("Failed to send command over serial:", err);
      }
    }
  }, []);

  return {
    connectionMode,
    isConnected: connectionMode === "hardware",
    isConnecting,
    telemetry,
    connect,
    disconnect,
    sendCommand,
  };
}