import type { Answers, SacafData } from "../types";
import {
  BENCHMARK_SOURCE,
  PEER_BENCHMARKS,
  deltaLabel,
} from "../lib/benchmarks";
import { formatScore, overallAverage, tierAverage } from "../lib/scoring";

interface BenchmarkTableProps {
  data: SacafData;
  answers: Answers;
}

export function BenchmarkTable({ data, answers }: BenchmarkTableProps) {
  const overall = overallAverage(data.questions, answers);

  return (
    <section className="section-block benchmark-block" aria-labelledby="benchmarks">
      <h2 id="benchmarks">Peer benchmarks</h2>
      <p className="intro">{BENCHMARK_SOURCE}</p>
      <div className="benchmark-scroll">
        <table className="benchmark-table">
          <thead>
            <tr>
              <th scope="col">Measure</th>
              <th scope="col">Your score</th>
              <th scope="col">Saudi mean</th>
              <th scope="col">Global mean</th>
              <th scope="col">vs Saudi</th>
              <th scope="col">vs Global</th>
            </tr>
          </thead>
          <tbody>
            {PEER_BENCHMARKS.map((row) => {
              const yours =
                row.measure === "Overall"
                  ? overall
                  : tierAverage(row.measure, data.questions, answers);
              const vsSaudi = deltaLabel(yours, row.saudi);
              const vsGlobal = deltaLabel(yours, row.global);
              return (
                <tr
                  key={row.measure}
                  className={row.measure === "Overall" ? "is-overall" : undefined}
                >
                  <th scope="row">{row.measure}</th>
                  <td className="col-yours">{formatScore(yours)}</td>
                  <td className="col-saudi">{row.saudi.toFixed(2)}</td>
                  <td className="col-global">{row.global.toFixed(2)}</td>
                  <td className={deltaClass(vsSaudi)}>{vsSaudi}</td>
                  <td className={deltaClass(vsGlobal)}>{vsGlobal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function deltaClass(label: string): string {
  if (label === "—" || label === "in line") return "col-delta is-flat";
  if (label.startsWith("+")) return "col-delta is-up";
  return "col-delta is-down";
}
