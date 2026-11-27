import type { Tier } from "../types";

export type BenchmarkMeasure = "Overall" | Tier;

export interface BenchmarkRow {
  measure: BenchmarkMeasure;
  saudi: number;
  global: number;
}

/** SACAF peer benchmarks — Saudi Arabia and global private sector (Beta 0.6). */
export const PEER_BENCHMARKS: BenchmarkRow[] = [
  { measure: "Overall", saudi: 0.88, global: 0.74 },
  { measure: "Foundational", saudi: 1.06, global: 0.87 },
  { measure: "Operational", saudi: 1.0, global: 0.87 },
  { measure: "Advanced", saudi: 0.57, global: 0.49 },
];

export const BENCHMARK_SOURCE =
  "Saudi Arabia and global private sector peer benchmarks · Beta 0.6";

export function deltaLabel(yours: number | null, peer: number): string {
  if (yours === null) return "—";
  const delta = yours - peer;
  if (Math.abs(delta) < 0.005) return "in line";
  return delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2);
}
