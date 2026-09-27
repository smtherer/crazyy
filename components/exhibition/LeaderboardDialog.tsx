"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { TrialRecord } from "@/types/telemetry";
import { LEADERBOARD_STORAGE_KEY } from "@/types/telemetry";
import { cn } from "@/lib/utils";

function loadRecords(): TrialRecord[] {
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

interface LeaderboardDialogProps {
  refreshKey: number;
  triggerLabel?: string;
  triggerClassName?: string;
}

export function LeaderboardDialog({
  refreshKey,
  triggerLabel = "View session records",
  triggerClassName,
}: LeaderboardDialogProps) {
  const [records, setRecords] = useState<TrialRecord[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(() => {
    setRecords(loadRecords().sort((a, b) => a.latency - b.latency));
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh, refreshKey]);

  const deleteRecord = (id: string) => {
    const next = records.filter((r) => r.id !== id);
    saveRecords(next);
    setRecords(next);
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
    a.download = `reflex-session-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className={cn("rounded-lg", triggerClassName)}
          >
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent className="max-w-2xl rounded-xl border-white/[0.08] bg-zinc-950/95 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Session records
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-none text-zinc-400"
            onClick={exportCsv}
            disabled={!records.length}
          >
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-500">#</TableHead>
              <TableHead className="text-zinc-500">Subject</TableHead>
              <TableHead className="text-zinc-500">Pathway</TableHead>
              <TableHead className="text-right text-zinc-500">Latency</TableHead>
              <TableHead className="text-right text-zinc-500">Speed</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-500">
                  No records yet
                </TableCell>
              </TableRow>
            ) : (
              records.map((r, i) => (
                <TableRow key={r.id} className="border-zinc-800">
                  <TableCell className="font-mono text-zinc-500">{i + 1}</TableCell>
                  <TableCell>{r.subjectName}</TableCell>
                  <TableCell className="text-zinc-400">{r.mode}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-white">
                    {r.latency.toFixed(1)} ms
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-zinc-400">
                    {r.velocity.toFixed(1)} m/s
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => deleteRecord(r.id)}
                      className="text-zinc-600 hover:text-white"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
