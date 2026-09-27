"use client";

import { Cable, MousePointerClick, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassPanel } from "@/lib/surface";
import type { SerialConnectionMode } from "@/hooks/useWebSerial";

interface FloatingToolbarProps {
  connectionMode: SerialConnectionMode;
  isConnecting: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onConnect: () => void;
  onSimulateStrike: () => void;
  showSimulateStrike?: boolean;
}

export function FloatingToolbar({
  connectionMode,
  isConnecting,
  muted,
  onToggleMute,
  onConnect,
  onSimulateStrike,
  showSimulateStrike = true,
}: FloatingToolbarProps) {
  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-0.5 p-1",
        glassPanel,
      )}
    >
      <button
        type="button"
        disabled={isConnecting || connectionMode === "hardware"}
        onClick={() => void onConnect()}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50",
          connectionMode === "hardware" && "text-emerald-400/90",
        )}
      >
        <Cable className="size-3.5" />
        {connectionMode === "hardware"
          ? "Linked"
          : isConnecting
            ? "…"
            : "Connect"}
      </button>
      <button
        type="button"
        onClick={onToggleMute}
        className="flex size-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
      </button>
      {showSimulateStrike && (
        <button
          type="button"
          onClick={onSimulateStrike}
          className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <MousePointerClick className="size-3.5" />
          Simulate
        </button>
      )}
    </div>
  );
}
