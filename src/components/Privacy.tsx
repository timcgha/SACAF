interface PrivacyProps {
  onBack: () => void;
}

export function Privacy({ onBack }: PrivacyProps) {
  return (
    <section className="privacy-page" aria-labelledby="privacy-heading">
      <p className="pill">Privacy</p>
      <h1 id="privacy-heading">How SACAF handles your assessment</h1>
      <div className="privacy-copy">
        <p>
          Your scores and optional notes are saved in this browser so you can
          leave and continue later. They stay on this device in your browser’s
          local storage.
        </p>
        <p>
          The maturity report is generated here in your browser. Downloading a
          PDF creates a file on your device; you manage any PDFs you have already
          saved.
        </p>
        <p>
          Choosing <strong>Start over</strong> clears the answers and notes saved
          in this browser for this assessment.
        </p>
        <p>
          This app does not send your assessment answers or notes to a SACAF
          server. Peer benchmark numbers shown in the report are fixed reference
          values built into the app, not scores calculated from your responses.
        </p>
        <p className="privacy-note">
          The site may still be hosted on infrastructure that records ordinary
          website traffic (for example page visits). That is separate from your
          assessment answers. Ask the site operator if you need confirmation of
          their hosting analytics settings.
        </p>
      </div>
      <div className="hero-actions">
        <button type="button" className="primary-btn" onClick={onBack}>
          Back
        </button>
      </div>
    </section>
  );
}
