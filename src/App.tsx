import { useEffect, useMemo, useState } from "react";
import sacaf from "./sacaf.json";
import type { Answers, SacafData, Score, View } from "./types";
import { Landing } from "./components/Landing";
import { Assessment } from "./components/Assessment";
import { Report } from "./components/Report";
import { answeredCount, isComplete } from "./lib/scoring";
import { clearAnswers, loadAnswers, saveAnswers } from "./lib/storage";

const data = sacaf as SacafData;

function emptyAnswers(): Answers {
  const next: Answers = {};
  for (const q of data.questions) {
    next[q.id] = { score: null, notes: "" };
  }
  return next;
}

function mergeLoaded(loaded: Answers): Answers {
  const base = emptyAnswers();
  for (const q of data.questions) {
    const existing = loaded[q.id];
    if (!existing) continue;
    base[q.id] = {
      score:
        existing.score === 0 ||
        existing.score === 1 ||
        existing.score === 2 ||
        existing.score === 3
          ? existing.score
          : null,
      notes: typeof existing.notes === "string" ? existing.notes : "",
    };
  }
  return base;
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [answers, setAnswers] = useState<Answers>(() => mergeLoaded(loadAnswers()));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    saveAnswers(answers);
  }, [answers]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const progressCount = useMemo(
    () => answeredCount(data.questions, answers),
    [answers],
  );
  const complete = useMemo(
    () => isComplete(data.questions, answers),
    [answers],
  );

  function setScore(questionId: number, score: Score) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        score,
        notes: prev[questionId]?.notes ?? "",
      },
    }));
  }

  function setNotes(questionId: number, notes: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        score: prev[questionId]?.score ?? null,
        notes,
      },
    }));
  }

  function startFresh() {
    clearAnswers();
    setAnswers(emptyAnswers());
    setIndex(0);
    setView("assessment");
  }

  function continueAssessment() {
    const firstUnanswered = data.questions.findIndex(
      (q) => answers[q.id]?.score === null || answers[q.id]?.score === undefined,
    );
    setIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
    setView("assessment");
  }

  return (
    <div className={`app-shell${view === "assessment" ? " is-assessment" : ""}`}>
      <header className="topbar">
        <button
          type="button"
          className="brand-mark"
          onClick={() => setView("home")}
          aria-label="SACAF home"
        >
          <span className="brand-row">
            <span className="brand">SACAF</span>
            <span className="version">Beta {data.version}</span>
          </span>
          <span className="brand-full">
            Simple AI Cybersecurity Assessment Framework
          </span>
        </button>
        <div className="no-print topbar-actions">
          {view !== "assessment" && (
            <button
              type="button"
              className="ghost-btn"
              onClick={progressCount > 0 ? continueAssessment : startFresh}
            >
              {progressCount > 0 ? "Assessment" : "Start"}
            </button>
          )}
          {complete && view !== "report" && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setView("report")}
            >
              Report
            </button>
          )}
        </div>
      </header>

      {view === "home" && (
        <Landing
          version={data.version}
          hasProgress={progressCount > 0}
          canViewReport={complete}
          onStart={startFresh}
          onContinue={continueAssessment}
          onViewReport={() => setView("report")}
        />
      )}

      {view === "assessment" && (
        <Assessment
          data={data}
          answers={answers}
          index={index}
          onIndexChange={setIndex}
          onScore={setScore}
          onNotes={setNotes}
          onOpenReport={() => setView("report")}
        />
      )}

      {view === "report" && (
        <Report
          data={data}
          answers={answers}
          onEditAnswers={() => setView("assessment")}
          onReset={startFresh}
        />
      )}

      {view !== "assessment" && (
        <footer className="footer-note">
          Based on the Simple AI Cybersecurity Assessment Framework spreadsheet
          (Beta {data.version}). Created for informational self-assessment use.
        </footer>
      )}
    </div>
  );
}
