"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Printer, X } from "lucide-react";
import type { BioBreakdown, SensoryMode, PerformanceTier } from "@/types/telemetry";
import { cn } from "@/lib/utils";

interface PrintableReportModalProps {
  open: boolean;
  onClose: () => void;
  subjectName: string;
  mode: SensoryMode;
  latency: number;
  tier: PerformanceTier;
  breakdown: BioBreakdown;
  timestamp: string;
}

export function PrintableReportModal({
  open,
  onClose,
  subjectName,
  mode,
  latency,
  tier,
  breakdown,
  timestamp,
}: PrintableReportModalProps) {
  const printReport = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm print:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed inset-4 z-50 mx-auto flex max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl print:static print:inset-auto print:max-h-none print:border-0 print:bg-white print:shadow-none"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 print:hidden">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-500">
                Diagnostic Certificate
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={printReport}
                  className="flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-4 print:overflow-visible print:p-0">
              <article
                id="neuro-certificate"
                className={cn(
                  "certificate-card rounded-lg border border-zinc-700 bg-zinc-950 p-6 font-mono text-sm text-zinc-200",
                  "print:border-black print:bg-white print:text-black",
                )}
              >
                <header className="border-b border-dashed border-zinc-600 pb-4 print:border-black">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-500 print:text-black">
                    Neuro-Reflex // Synaptic Telemetry Bench
                  </p>
                  <h2 className="mt-2 text-lg font-bold tracking-tight">
                    Neural Conduction Velocity Diagnostic Certificate
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 print:text-zinc-700">
                    Issued {new Date(timestamp).toLocaleString()}
                  </p>
                </header>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500">Subject</span>
                    <p className="text-base font-semibold">{subjectName || "—"}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Stimulus Mode</span>
                    <p className="font-semibold">{mode}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Total Latency</span>
                    <p className="text-base tabular-nums">{latency.toFixed(1)} ms</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Myelinated Axon Speed</span>
                    <p className="text-base tabular-nums text-emerald-400 print:text-black">
                      {breakdown.velocity.toFixed(1)} m/s
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Performance Tier</span>
                    <p className="font-semibold">{tier.replace("_", " ")}</p>
                  </div>
                </div>

                <table className="mt-6 w-full border-collapse text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-zinc-700 print:border-black">
                      <th className="py-2 pr-2">Stage</th>
                      <th className="py-2 text-right">ms</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    <tr>
                      <td className="py-1">Transduction</td>
                      <td className="py-1 text-right">
                        {breakdown.transduction.toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">Afferent</td>
                      <td className="py-1 text-right">
                        {breakdown.afferent.toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">Central</td>
                      <td className="py-1 text-right">
                        {breakdown.central.toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">Efferent</td>
                      <td className="py-1 text-right">
                        {breakdown.efferent.toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">EMD</td>
                      <td className="py-1 text-right">{breakdown.emd.toFixed(1)}</td>
                    </tr>
                  </tbody>
                </table>

                <footer className="mt-8 flex items-end justify-between border-t border-dashed border-zinc-600 pt-4 print:border-black">
                  <div className="space-y-1">
                    <div
                      className="h-10 w-40 bg-[repeating-linear-gradient(90deg,#71717a_0,#71717a_2px,transparent_2px,transparent_4px)] print:bg-[repeating-linear-gradient(90deg,#000_0,#000_2px,transparent_2px,transparent_4px)]"
                      aria-hidden
                    />
                    <p className="text-[9px] text-zinc-600">NR-SYN-{latency.toFixed(0).padStart(4, "0")}</p>
                  </div>
                  <div className="h-14 w-14 border-2 border-dashed border-zinc-600 print:border-black" title="QR footprint" />
                  <div className="rotate-[-8deg] rounded border-2 border-red-500/60 px-3 py-1 text-[10px] font-bold uppercase text-red-400 print:border-black print:text-black">
                    Exhibition Valid
                  </div>
                </footer>
              </article>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
