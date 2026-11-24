import { useEffect, useId, useMemo, useState } from "react";
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
  const [navOpen, setNavOpen] = useState(false);
  const drawerTitleId = useId();

  const navGroups = useMemo(() => {
    return TIERS.map((tier) => ({
      tier,
      items: questions.filter((q) => q.tier === tier),
    }));
  }, [questions]);

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [navOpen]);

  function goTo(i: number) {
    onIndexChange(i);
    setNavOpen(false);
  }

  return (
    <div className="assessment-layout">
      <div className="assessment-main">
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
          <button
            type="button"
            className="jump-btn no-print"
            aria-expanded={navOpen}
            aria-controls="question-drawer"
            onClick={() => setNavOpen(true)}
          >
            Jump to question
          </button>
        </div>

        <article className="question-panel" key={question.id}>
          <div className="question-kicker">
            <span className="pill">{question.tier}</span>
            <span className="category-label">{question.category}</span>
            <span className="q-id">Q{question.id}</span>
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
                <span className="num" aria-hidden="true">
                  {score}
                </span>
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
            <div className="nav-row-end">
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

      <aside className="side-nav desktop-nav no-print" aria-label="Question navigation">
        <QuestionNav
          groups={navGroups}
          questions={questions}
          answers={answers}
          index={index}
          onSelect={goTo}
        />
      </aside>

      {navOpen && (
        <div className="drawer-root no-print" role="presentation">
          <button
            type="button"
            className="drawer-backdrop"
            aria-label="Close question list"
            onClick={() => setNavOpen(false)}
          />
          <div
            id="question-drawer"
            className="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={drawerTitleId}
          >
            <div className="drawer-header">
              <h2 id={drawerTitleId}>All questions</h2>
              <button
                type="button"
                className="ghost-btn drawer-close"
                onClick={() => setNavOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="drawer-body">
              <QuestionNav
                groups={navGroups}
                questions={questions}
                answers={answers}
                index={index}
                onSelect={goTo}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface QuestionNavProps {
  groups: { tier: string; items: Question[] }[];
  questions: Question[];
  answers: Answers;
  index: number;
  onSelect: (index: number) => void;
}

function QuestionNav({
  groups,
  questions,
  answers,
  index,
  onSelect,
}: QuestionNavProps) {
  return (
    <nav className="question-nav">
      {groups.map((group) => (
        <div key={group.tier} className="nav-group">
          <div className="tier-label">{group.tier}</div>
          {group.items.map((q) => {
            const i = questions.findIndex((item) => item.id === q.id);
            const scored =
              answers[q.id]?.score !== null && answers[q.id]?.score !== undefined;
            return (
              <button
                key={q.id}
                type="button"
                className="nav-item"
                aria-current={i === index ? "true" : undefined}
                onClick={() => onSelect(i)}
              >
                <span className="nav-num">{q.id}</span>
                <span className="nav-label">{q.category}</span>
                {scored ? (
                  <span className="nav-check" aria-label="Answered">
                    ✓
                  </span>
                ) : (
                  <span className="nav-check placeholder" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
