interface LandingProps {
  version: string;
  hasProgress: boolean;
  onStart: () => void;
  onContinue: () => void;
  onViewReport: () => void;
  canViewReport: boolean;
}

export function Landing({
  version,
  hasProgress,
  onStart,
  onContinue,
  onViewReport,
  canViewReport,
}: LandingProps) {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-visual" aria-hidden="true" />
      <p className="brand hero-brand">SACAF</p>
      <h1 id="hero-heading">Check your AI cybersecurity maturity in about 30 minutes.</h1>
      <p className="lede">
        Answer 30 plain-language questions on a 0–3 scale. SACAF scores your
        Foundational, Operational, and Advanced controls, then builds a report
        with targeted recommendations.
      </p>
      <div className="hero-actions">
        {hasProgress ? (
          <>
            <button type="button" className="primary-btn" onClick={onContinue}>
              Continue assessment
            </button>
            <button type="button" className="secondary-btn" onClick={onStart}>
              Start over
            </button>
          </>
        ) : (
          <button type="button" className="primary-btn" onClick={onStart}>
            Start assessment
          </button>
        )}
        {canViewReport && (
          <button type="button" className="ghost-btn" onClick={onViewReport}>
            View report
          </button>
        )}
      </div>
      <div className="hero-meta">
        <span>Beta {version}</span>
        <span>30 questions · 0–3 scoring</span>
        <span>Free self-assessment</span>
      </div>
    </section>
  );
}
