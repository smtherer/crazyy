"use client";

import type { BioBreakdown, PerformanceTier, SensoryMode } from "@/types/telemetry";
import { cn } from "@/lib/utils";

interface PrintableCertificateProps {
  subjectName: string;
  mode: SensoryMode;
  latency: number;
  tier: PerformanceTier;
  breakdown: BioBreakdown;
  timestamp: string;
  className?: string;
}

export function PrintableCertificate({
  subjectName,
  mode,
  latency,
  tier,
  breakdown,
  timestamp,
  className,
}: PrintableCertificateProps) {
  return (
    <article
      id="neuro-certificate"
      className={cn(
        "certificate-card rounded-lg border border-zinc-700 bg-zinc-950 p-6 font-mono text-sm text-zinc-200",
        "print:border-black print:bg-white print:text-black",
        className,
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
          <p className="text-base font-semibold">{subjectName}</p>
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
            <td className="py-1 text-right">{breakdown.transduction.toFixed(1)}</td>
          </tr>
          <tr>
            <td className="py-1">Afferent</td>
            <td className="py-1 text-right">{breakdown.afferent.toFixed(1)}</td>
          </tr>
          <tr>
            <td className="py-1">Central</td>
            <td className="py-1 text-right">{breakdown.central.toFixed(1)}</td>
          </tr>
          <tr>
            <td className="py-1">Efferent</td>
            <td className="py-1 text-right">{breakdown.efferent.toFixed(1)}</td>
          </tr>
          <tr>
            <td className="py-1">EMD</td>
            <td className="py-1 text-right">{breakdown.emd.toFixed(1)}</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}
