import { useState } from "react";
import type { Answers, SacafData, Tier } from "../types";
import {
  TIERS,
  categoriesInOrder,
  categoryAverage,
  formatScore,
  matureItems,
  maturityFor,
  overallAverage,
  recommendationsNeedingAttention,
  tierAverage,
  tierDescription,
} from "../lib/scoring";
import { BenchmarkTable } from "./BenchmarkTable";

interface ReportProps {
  data: SacafData;
  answers: Answers;
  onEditAnswers: () => void;
  onReset: () => void;
}

export function Report({ data, answers, onEditAnswers, onReset }: ReportProps) {
  const overall = overallAverage(data.questions, answers);
  const maturity = maturityFor(overall, data);
  const gaps = recommendationsNeedingAttention(data.questions, answers);
  const mature = matureItems(data.questions, answers);
  const categories = categoriesInOrder(data.questions);
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    setBusy(true);
    try {
      const { downloadSacafReport } = await import("../lib/pdfReport");
      downloadSacafReport(data, answers);
    } finally {
      window.setTimeout(() => setBusy(false), 400);
    }
  }

  return (
    <div className="report">
      <header className="report-header">
        <p className="pill">SACAF Report · Beta {data.version}</p>
        <h1>Executive summary</h1>
        <p>
          Review your overall maturity, then use the detailed recommendations to
          build an action plan for every item scored below 3.
        </p>
        <div className="hero-actions no-print">
          <button
            type="button"
            className="primary-btn"
            onClick={handleDownload}
            disabled={busy}
          >
            {busy ? "Preparing PDF…" : "Download PDF"}
          </button>
          <button type="button" className="secondary-btn" onClick={onEditAnswers}>
            Edit answers
          </button>
          <button type="button" className="ghost-btn" onClick={onReset}>
            Start over
          </button>
        </div>
      </header>

      <div className="scoreboard">
        <section className="score-card overall" aria-labelledby="overall-score">
          <p className="score-eyebrow" id="overall-score">
            Overall maturity score
          </p>
          <p className="score-value">{formatScore(overall)}</p>
          {maturity && (
            <>
              <p className="maturity-label">{maturity.label} stage</p>
              <p className="maturity-copy">{maturity.description}</p>
            </>
          )}
        </section>

        <section className="score-card" aria-labelledby="tier-breakdown">
          <h2 id="tier-breakdown" className="card-title">
            Tier breakdown
          </h2>
          <ul className="tier-list">
            {TIERS.map((tier) => {
              const score = tierAverage(tier, data.questions, answers);
              const desc = tierDescription(tier, score, data);
              return (
                <li key={tier} className="tier-item">
                  <header>
                    <strong>{tier}</strong>
                    <span className="tier-score">{formatScore(score)} / 3</span>
                  </header>
                  <div className="bar" aria-hidden="true">
                    <span style={{ width: `${((score ?? 0) / 3) * 100}%` }} />
                  </div>
                  {desc && <p className="tier-copy">{desc}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <BenchmarkTable data={data} answers={answers} />

      <section className="section-block" aria-labelledby="category-scores">
        <h2 id="category-scores">Category averages</h2>
        <p className="intro">Grouped for targeted follow-up inside each tier.</p>
        <ul className="category-list">
          {categories.map((category) => {
            const score = categoryAverage(category, data.questions, answers);
            const tier = data.questions.find((q) => q.category === category)?.tier as Tier;
            return (
              <li key={category} className="category-item">
                <header>
                  <span>
                    <strong>{category}</strong>
                    <span className="muted"> · {tier}</span>
                  </span>
                  <span className="tier-score">{formatScore(score)}</span>
                </header>
                <div className="bar" aria-hidden="true">
                  <span style={{ width: `${((score ?? 0) / 3) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section-block" aria-labelledby="recommendations">
        <h2 id="recommendations">Detailed recommendations</h2>
        <p className="intro">
          {gaps.length === 0
            ? "Every control scored a 3. Nice work — keep verifying these stay org-wide."
            : `The following ${gaps.length} item${gaps.length === 1 ? "" : "s"} scored less than 3 and need attention.`}
        </p>
        <div className="rec-list">
          {gaps.map(({ question, score, notes }) => (
            <article key={question.id} className="rec-item">
              <h3>
                Q{question.id}. {question.question}
              </h3>
              <div className="rec-meta">
                <span className="pill">{question.tier}</span>
                <span>{question.category}</span>
                <span className="score-badge">Score {score}</span>
              </div>
              <div className="rec-grid">
                <div>
                  <h4>Recommendation</h4>
                  <p className="rec-body">{question.recommendation}</p>
                </div>
                <div>
                  <h4>Impact if not done</h4>
                  <p className="rec-body">{question.impact}</p>
                  {notes.trim() && (
                    <>
                      <h4 className="notes-heading">Your notes</h4>
                      <p className="rec-body">{notes}</p>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {mature.length > 0 && (
        <section className="section-block" aria-labelledby="mature">
          <h2 id="mature">Reported as mature (score 3)</h2>
          <p className="intro">These controls are marked fully implemented and verified org-wide.</p>
          <ul className="mature-list">
            {mature.map((q) => (
              <li key={q.id}>
                Q{q.id}. {q.question}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="disclaimer">
        This tool provides a high-level self-assessment and is not a substitute for
        professional audits, penetration tests, or expert advice. Results depend on
        honest answers and may not catch all risks. Use it as a starting point, not a
        full security guarantee. SACAF is for informational purposes only.
      </p>
    </div>
  );
}
