"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Trash2, Trophy } from "lucide-react";
import type { TrialRecord } from "@/types/telemetry";
import { LEADERBOARD_STORAGE_KEY } from "@/types/telemetry";
import { cn } from "@/lib/utils";

const TIER_STYLES: Record<TrialRecord["tier"], string> = {
  ELITE_F1: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  ATHLETIC: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
  STANDARD: "border-zinc-600 bg-zinc-800/50 text-zinc-400",
};

function loadRecords(): TrialRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TrialRecord[];
  } catch {
    return [];
  }
}

function saveRecords(records: TrialRecord[]) {
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(records));
}

interface LeaderboardTableProps {
  refreshKey?: number;
  onRecordsChange?: (records: TrialRecord[]) => void;
}

export function LeaderboardTable({
  refreshKey = 0,
  onRecordsChange,
}: LeaderboardTableProps) {
  const [records, setRecords] = useState<TrialRecord[]>([]);

  const refresh = useCallback(() => {
    const next = loadRecords().sort((a, b) => a.latency - b.latency);
    setRecords(next);
    onRecordsChange?.(next);
  }, [onRecordsChange]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  const deleteRecord = (id: string) => {
    const next = records.filter((r) => r.id !== id);
    saveRecords(next);
    setRecords(next);
    onRecordsChange?.(next);
  };

  const exportCsv = () => {
    const header =
      "Rank,Subject,Mode,Latency_ms,AxonSpeed_m_s,Tier,Timestamp\n";
    const rows = records
      .map(
        (r, i) =>
          `${i + 1},"${r.subjectName}",${r.mode},${r.latency},${r.velocity.toFixed(1)},${r.tier},${r.timestamp}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neuro-reflex-session-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4 backdrop-blur-md">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Session Leaderboard
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={records.length === 0}
            className="flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:opacity-40"
          >
            <Download className="h-3 w-3" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-500">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Subject</th>
              <th className="py-2 pr-2">Mode</th>
              <th className="py-2 pr-2 text-right">Latency</th>
              <th className="py-2 pr-2 text-right">Axon v</th>
              <th className="py-2 pr-2">Tier</th>
              <th className="py-2 w-8" />
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-zinc-600">
                  No trials logged — ARM system to begin capture
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-zinc-800/60 text-zinc-300 last:border-0"
                >
                  <td className="py-2 pr-2 text-zinc-500">{i + 1}</td>
                  <td className="py-2 pr-2 font-sans">{r.subjectName}</td>
                  <td className="py-2 pr-2">{r.mode}</td>
                  <td className="py-2 pr-2 text-right text-cyan-400">
                    {r.latency.toFixed(1)} ms
                  </td>
                  <td className="py-2 pr-2 text-right text-emerald-400">
                    {r.velocity.toFixed(1)} m/s
                  </td>
                  <td className="py-2 pr-2">
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase",
                        TIER_STYLES[r.tier],
                      )}
                    >
                      {r.tier.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => deleteRecord(r.id)}
                      className="text-zinc-600 hover:text-red-500"
                      aria-label="Delete trial"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function appendTrialRecord(record: TrialRecord) {
  const existing = loadRecords();
  existing.push(record);
  saveRecords(existing);
}
