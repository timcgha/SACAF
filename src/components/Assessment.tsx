import { useEffect, useId, useMemo, useState } from "react";
import type { Answers, Question, SacafData, Score, Tier } from "../types";
import {
  SCORE_OPTIONS,
  TIERS,
  answeredCount,
  isComplete,
  scoredValues,
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

interface CategoryGroup {
  category: string;
  tier: Tier;
  items: Question[];
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
  const progress = Math.round((done / questions.length) * 100);
  const [navOpen, setNavOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(Boolean(answer.notes));
  const [openCategories, setOpenCategories] = useState<string[]>([
    question.category,
  ]);
  const drawerTitleId = useId();

  const categoryGroups = useMemo(() => {
    const groups: CategoryGroup[] = [];
    for (const q of questions) {
      const existing = groups.find((g) => g.category === q.category);
      if (existing) {
        existing.items.push(q);
      } else {
        groups.push({ category: q.category, tier: q.tier, items: [q] });
      }
    }
    return groups;
  }, [questions]);

  const tierProgress = useMemo(() => {
    return TIERS.map((tier) => {
      const items = questions.filter((q) => q.tier === tier);
      const answered = scoredValues(items, answers).length;
      return {
        tier,
        total: items.length,
        answered,
        percent: items.length ? Math.round((answered / items.length) * 100) : 0,
        current: question.tier === tier,
      };
    });
  }, [questions, answers, question.tier]);

  useEffect(() => {
    setNavOpen(false);
    setNotesOpen(Boolean(answers[questions[index]?.id]?.notes));
    setOpenCategories((prev) =>
      prev.includes(question.category) ? prev : [...prev, question.category],
    );
  }, [index, answers, questions, question.category]);

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

  function toggleCategory(category: string) {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  }

  return (
    <div className="assessment-shell">
      <aside className="tier-rail no-print" aria-label="Section progress">
        <div className="tier-rail-overall">
          <span className="tier-rail-percent">{progress}%</span>
          <span className="tier-rail-caption">done</span>
        </div>
        <div className="tier-rail-list">
          {tierProgress.map((item) => (
            <div
              key={item.tier}
              className={`tier-rail-item${item.current ? " is-current" : ""}`}
              aria-current={item.current ? "step" : undefined}
              title={`${item.tier}: ${item.answered}/${item.total}`}
            >
              <span className="tier-rail-name">{item.tier}</span>
              <div
                className="tier-rail-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={item.percent}
                aria-label={`${item.tier} progress`}
              >
                <span style={{ height: `${Math.max(item.percent, item.percent > 0 ? 8 : 0)}%` }} />
              </div>
              <span className="tier-rail-meta">{item.percent}%</span>
            </div>
          ))}
        </div>
      </aside>

      <div className="assessment-main">
        <div className="assess-toolbar">
          <div className="assess-toolbar-copy">
            <span>
              Q{index + 1}/{questions.length}
            </span>
            <span className="dot" aria-hidden="true">
              ·
            </span>
            <span>{done} answered</span>
          </div>
          <button
            type="button"
            className="jump-btn no-print"
            aria-expanded={navOpen}
            aria-controls="question-drawer"
            onClick={() => setNavOpen(true)}
          >
            Jump
          </button>
        </div>

        <article className="question-panel" key={question.id}>
          <div className="question-kicker">
            <span className="pill">{question.tier}</span>
            <span className="category-label">{question.category}</span>
            <span className="q-id">Q{question.id}</span>
          </div>
          <h2 className="question-text">{question.question}</h2>

          <div className="score-grid" role="group" aria-label="Score from 0 to 3">
            {SCORE_OPTIONS.map((score) => (
              <button
                key={score}
                type="button"
                className="score-option"
                aria-pressed={answer.score === score}
                aria-label={`${score}: ${data.scoreLabels[String(score)]}`}
                onClick={() => onScore(question.id, score)}
              >
                <span className="num" aria-hidden="true">
                  {score}
                </span>
                <span className="label" aria-hidden="true">
                  <span className="label-short">{SHORT_SCORE_LABELS[score]}</span>
                  <span className="label-full">{data.scoreLabels[String(score)]}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="notes-field">
            <button
              type="button"
              className="notes-toggle"
              aria-expanded={notesOpen}
              onClick={() => setNotesOpen((open) => !open)}
            >
              {notesOpen ? "Hide org notes" : answer.notes ? "Edit org notes" : "Add org notes"}
            </button>
            {notesOpen && (
              <textarea
                id={`notes-${question.id}`}
                value={answer.notes}
                placeholder="Briefly describe the control. Use role titles and leave out names, credentials, and confidential evidence."
                onChange={(e) => onNotes(question.id, e.target.value)}
              />
            )}
          </div>
        </article>

        <div className="assess-footer no-print">
          <button
            type="button"
            className="secondary-btn"
            disabled={index === 0}
            onClick={() => onIndexChange(index - 1)}
          >
            Previous
          </button>
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

      <aside className="side-nav desktop-nav no-print" aria-label="Question navigation">
        <QuestionNav
          groups={categoryGroups}
          questions={questions}
          answers={answers}
          index={index}
          openCategories={openCategories}
          onToggleCategory={toggleCategory}
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
                groups={categoryGroups}
                questions={questions}
                answers={answers}
                index={index}
                openCategories={openCategories}
                onToggleCategory={toggleCategory}
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
  groups: CategoryGroup[];
  questions: Question[];
  answers: Answers;
  index: number;
  openCategories: string[];
  onToggleCategory: (category: string) => void;
  onSelect: (index: number) => void;
}

function QuestionNav({
  groups,
  questions,
  answers,
  index,
  openCategories,
  onToggleCategory,
  onSelect,
}: QuestionNavProps) {
  let lastTier: Tier | null = null;

  return (
    <nav className="question-nav">
      {groups.map((group) => {
        const showTier = group.tier !== lastTier;
        lastTier = group.tier;
        const open = openCategories.includes(group.category);
        const answeredInGroup = group.items.filter(
          (q) => answers[q.id]?.score !== null && answers[q.id]?.score !== undefined,
        ).length;
        const panelId = `cat-${slugify(group.category)}`;

        return (
          <div key={group.category} className="nav-group">
            {showTier && <div className="tier-label">{group.tier}</div>}
            <button
              type="button"
              className={`category-toggle${open ? " is-open" : ""}`}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => onToggleCategory(group.category)}
            >
              <span className="category-toggle-copy">
                <span className="category-toggle-title">{group.category}</span>
                <span className="category-toggle-meta">
                  {answeredInGroup}/{group.items.length}
                </span>
              </span>
              <span className="category-toggle-chevron" aria-hidden="true">
                {open ? "▾" : "▸"}
              </span>
            </button>
            {open && (
              <div id={panelId} className="category-panel">
                {group.items.map((q) => {
                  const i = questions.findIndex((item) => item.id === q.id);
                  const scored =
                    answers[q.id]?.score !== null &&
                    answers[q.id]?.score !== undefined;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      className="nav-item"
                      aria-current={i === index ? "true" : undefined}
                      onClick={() => onSelect(i)}
                    >
                      <span className="nav-num">{q.id}</span>
                      <span className="nav-label">{shortQuestion(q.question)}</span>
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
            )}
          </div>
        );
      })}
    </nav>
  );
}

function shortQuestion(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 72) return cleaned;
  return `${cleaned.slice(0, 69).trimEnd()}…`;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const SHORT_SCORE_LABELS: Record<Score, string> = {
  0: "Not started",
  1: "Planned",
  2: "Partial",
  3: "Complete",
};
