import { useMemo } from "react";
import type { Answers, Question, SacafData, Score } from "../types";
import {
  SCORE_OPTIONS,
  TIERS,
  answeredCount,
  isComplete,
} from "../lib/scoring";

interface AssessmentProps {
  data: SacafData;
  answers: Answers;
  index: number;
  onIndexChange: (index: number) => void;
  onScore: (questionId: number, score: Score) => void;
  onNotes: (questionId: number, notes: string) => void;
  onOpenReport: () => void;
}

export function Assessment({
  data,
  answers,
  index,
  onIndexChange,
  onScore,
  onNotes,
  onOpenReport,
}: AssessmentProps) {
  const questions = data.questions;
  const question = questions[index];
  const answer = answers[question.id] ?? { score: null, notes: "" };
  const done = answeredCount(questions, answers);
  const complete = isComplete(questions, answers);
  const progress = (done / questions.length) * 100;

  const navGroups = useMemo(() => {
    return TIERS.map((tier) => ({
      tier,
      items: questions.filter((q) => q.tier === tier),
    }));
  }, [questions]);

  return (
    <div className="assessment-layout">
      <aside className="side-nav no-print" aria-label="Question navigation">
        {navGroups.map((group) => (
          <div key={group.tier}>
            <div className="tier-label">{group.tier}</div>
            {group.items.map((q) => {
              const i = questions.findIndex((item) => item.id === q.id);
              const scored = answers[q.id]?.score !== null && answers[q.id]?.score !== undefined;
              return (
                <button
                  key={q.id}
                  type="button"
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => onIndexChange(i)}
                >
                  <span className="nav-label">
                    {q.id}. {shortCategory(q)}
                  </span>
                  {scored ? <span className="nav-check" aria-label="Answered">✓</span> : null}
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      <div>
        <div className="progress-block">
          <div className="progress-row">
            <span>
              Question {index + 1} of {questions.length}
            </span>
            <span>
              {done} answered
              {complete ? " · ready for report" : ""}
            </span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Assessment progress"
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <article className="question-panel" key={question.id}>
          <div className="question-kicker">
            <span className="pill">{question.tier}</span>
            <span>{question.category}</span>
            <span>Q{question.id}</span>
          </div>
          <h2 className="question-text">{question.question}</h2>

          <div
            className="score-grid"
            role="group"
            aria-label="Score from 0 to 3"
          >
            {SCORE_OPTIONS.map((score) => (
              <button
                key={score}
                type="button"
                className="score-option"
                aria-pressed={answer.score === score}
                onClick={() => onScore(question.id, score)}
              >
                <span className="num">{score}</span>
                <span className="label">{data.scoreLabels[String(score)]}</span>
              </button>
            ))}
          </div>

          <div className="notes-field">
            <label htmlFor={`notes-${question.id}`}>Org notes (optional)</label>
            <textarea
              id={`notes-${question.id}`}
              value={answer.notes}
              placeholder="Capture context, owners, or evidence for this answer…"
              onChange={(e) => onNotes(question.id, e.target.value)}
            />
          </div>

          <div className="nav-row">
            <button
              type="button"
              className="secondary-btn"
              disabled={index === 0}
              onClick={() => onIndexChange(index - 1)}
            >
              Previous
            </button>
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              {index < questions.length - 1 ? (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => onIndexChange(index + 1)}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-btn"
                  disabled={!complete}
                  title={
                    complete
                      ? "Open your SACAF report"
                      : `Answer all ${questions.length} questions to generate the report (${done} done)`
                  }
                  onClick={onOpenReport}
                >
                  Generate report
                </button>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function shortCategory(q: Question): string {
  const words = q.category.split(" ");
  if (words.length <= 3) return q.category;
  return words.slice(0, 3).join(" ") + "…";
}
