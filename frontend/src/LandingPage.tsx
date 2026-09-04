import type { ReactNode } from 'react'

type LandingPageProps = {
  onGetStarted: () => void
  onSignIn: () => void
}

function RiskLine() {
  return (
    <svg
      className="landing-risk-line"
      viewBox="0 0 760 190"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="riskFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" />
          <stop offset="52%" />
          <stop offset="100%" />
        </linearGradient>
      </defs>

      <path
        d="M0 142 C58 141 76 134 112 137 C150 140 165 116 201 119 C235 122 248 102 283 108 C320 114 329 92 366 98 C407 105 416 74 451 81 C490 88 503 65 536 72 C574 80 584 52 620 59 C658 67 674 36 708 45 C729 51 744 34 760 29"
        fill="none"
        stroke="url(#riskFade)"
        strokeWidth="2"
      />
      <path
        d="M0 166 C74 166 93 161 132 162 C178 163 197 148 229 151 C265 154 286 134 319 139 C359 145 373 121 405 128 C447 137 462 108 494 115 C533 124 553 96 585 104 C623 114 648 83 678 92 C714 103 732 75 760 79"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".22"
        strokeWidth="1"
      />
    </svg>
  )
}

function SignalCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string
  value: string
  detail: string
  icon: ReactNode
}) {
  return (
    <div className="landing-signal-card">
      <div className="landing-signal-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </div>
  )
}

function LandingPage({
  onGetStarted,
  onSignIn,
}: LandingPageProps) {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div
            className="landing-brand"
            aria-label="Animus AI"
        >
            <span className="landing-brand-mark">A</span>
            <span>ANIMUS AI</span>
        </div>

        <nav className="landing-nav-links" aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#explainability">Explainability</a>
          <a href="#decisioning">Decisioning</a>
        </nav>
        
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="landing-kicker">
              <span className="landing-kicker-dot" />
              AI RISK MANAGEMENT
            </div>

            <h1>
              Know the risk
              <br />
              <span>before you approve.</span>
            </h1>

            <p className="landing-hero-description">
              Animus AI evaluates transaction behaviour, surfaces the signals
              behind the score, and turns model predictions into clear
              operational decisions.
            </p>

            <div className="landing-hero-actions">
              <button
                type="button"
                className="landing-primary-button"
                onClick={onGetStarted}
              >
                Get started
                <span aria-hidden="true">→</span>
              </button>

              <button
                type="button"
                className="landing-secondary-button"
                onClick={onSignIn}
              >
                Sign in to dashboard
              </button>
            </div>

            <div className="landing-trust-row">
              <span>MODEL-DRIVEN</span>
              <i />
              <span>EXPLAINABLE</span>
              <i />
              <span>DECISION-READY</span>
            </div>
          </div>

          <div className="landing-hero-visual" aria-label="Animus risk scoring preview">
            <div className="landing-orbit orbit-one" />
            <div className="landing-orbit orbit-two" />

            <div className="landing-score-card">
              <div className="landing-score-top">
                <span>LIVE RISK ASSESSMENT</span>
                <b>TX-01842</b>
              </div>

              <div className="landing-score-main">
                <div>
                  <small>RISK SCORE</small>
                  <strong>0.87</strong>
                </div>
                <div className="landing-score-ring">
                  <span>87%</span>
                </div>
              </div>

              <div className="landing-score-status">
                <span className="landing-status-dot" />
                MEDIUM-HIGH RISK
                <b>REVIEW</b>
              </div>

              <div className="landing-score-chart">
                <div className="landing-chart-label">
                  <span>BEHAVIOURAL SIGNAL</span>
                  <span>CONFIDENCE</span>
                </div>
                <RiskLine />
              </div>

              <div className="landing-score-reasons">
                <div>
                  <span>01</span>
                  <p>Transaction velocity increased</p>
                  <b>+0.21</b>
                </div>
                <div>
                  <span>02</span>
                  <p>Amount deviates from customer baseline</p>
                  <b>+0.16</b>
                </div>
                <div>
                  <span>03</span>
                  <p>Terminal activity is elevated</p>
                  <b>+0.11</b>
                </div>
              </div>
            </div>

            <div className="landing-floating-label landing-floating-label-one">
              <span>01</span>
              BEHAVIOUR
            </div>

            <div className="landing-floating-label landing-floating-label-two">
              <span>02</span>
              DECISION
            </div>
          </div>
        </section>

        <section className="landing-signals" aria-label="Platform capabilities">
          <SignalCard
            label="Risk scoring"
            value="Real-time"
            detail="Assess every transaction against learned behavioural patterns."
            icon="◌"
          />
          <SignalCard
            label="Explainability"
            value="SHAP-backed"
            detail="See which signals pushed a transaction toward risk."
            icon="✦"
          />
          <SignalCard
            label="Operational output"
            value="Allow / Review / Block"
            detail="Convert model output into an action your team can use."
            icon="↗"
          />
        </section>

        <section className="landing-section" id="how-it-works">
          <div className="landing-section-heading">
            <div>
              <span className="landing-section-index">01</span>
              <span className="landing-section-label">THE PIPELINE</span>
            </div>
            <h2>From transaction to decision.</h2>
            <p>
              Animus keeps the workflow simple: evaluate the transaction,
              understand the risk, then decide what happens next.
            </p>
          </div>

          <div className="landing-process">
            <div className="landing-process-line" />
            <div className="landing-process-step">
              <span>01</span>
              <strong>TRANSACTION</strong>
              <p>Payment amount and behavioural context enter the model.</p>
            </div>
            <div className="landing-process-step">
              <span>02</span>
              <strong>RISK MODEL</strong>
              <p>Learned patterns produce a calibrated risk score.</p>
            </div>
            <div className="landing-process-step">
              <span>03</span>
              <strong>EXPLANATION</strong>
              <p>Key contributing signals make the prediction inspectable.</p>
            </div>
            <div className="landing-process-step">
              <span>04</span>
              <strong>DECISION</strong>
              <p>Thresholds turn risk into an operational action.</p>
            </div>
          </div>
        </section>

        <section className="landing-explain" id="explainability">
          <div className="landing-explain-visual">
            <div className="landing-explain-card">
              <div className="landing-explain-card-top">
                <span>WHY THIS TRANSACTION?</span>
                <b>EXPLAINED</b>
              </div>

              <div className="landing-explain-score">
                <span>RISK CONTRIBUTION</span>
                <strong>+0.21</strong>
              </div>

              <div className="landing-feature">
                <div>
                  <span>TRANSACTION VELOCITY</span>
                  <small>HIGHER THAN BASELINE</small>
                </div>
                <b>↑</b>
              </div>

              <div className="landing-feature">
                <div>
                  <span>AMOUNT DEVIATION</span>
                  <small>UNUSUAL FOR CUSTOMER</small>
                </div>
                <b>↑</b>
              </div>

              <div className="landing-feature">
                <div>
                  <span>TERMINAL ACTIVITY</span>
                  <small>ELEVATED BEFORE TX</small>
                </div>
                <b>↑</b>
              </div>
            </div>
          </div>

          <div className="landing-section-heading landing-section-heading-right">
            <div>
              <span className="landing-section-index">02</span>
              <span className="landing-section-label">EXPLAINABILITY</span>
            </div>
            <h2>A score is useful. A reason is better.</h2>
            <p>
              Animus does not stop at “fraud” or “not fraud”. The dashboard
              exposes the behavioural signals that influenced the prediction,
              giving reviewers context instead of another black box.
            </p>

            <div className="landing-bullets">
              <div>
                <span>+</span>
                <p>Prioritise the signals that matter most.</p>
              </div>
              <div>
                <span>+</span>
                <p>Give analysts a human-readable assessment.</p>
              </div>
              <div>
                <span>+</span>
                <p>Keep technical model details available when needed.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-decision-section" id="decisioning">
          <div className="landing-section-heading">
            <div>
              <span className="landing-section-index">03</span>
              <span className="landing-section-label">DECISIONING</span>
            </div>
            <h2>Risk becomes action.</h2>
            <p>
              Different risk levels map to different operational responses,
              helping teams balance fraud exposure against unnecessary
              friction.
            </p>
          </div>

          <div className="landing-decision-grid">
            <div className="landing-decision-card">
              <span className="landing-decision-code">LOW</span>
              <strong>ALLOW</strong>
              <p>Low-risk activity can continue without manual intervention.</p>
            </div>
            <div className="landing-decision-card">
              <span className="landing-decision-code">MEDIUM</span>
              <strong>REVIEW</strong>
              <p>Borderline activity gets additional human attention.</p>
            </div>
            <div className="landing-decision-card">
              <span className="landing-decision-code">HIGH</span>
              <strong>BLOCK</strong>
              <p>High-risk activity can be stopped before loss occurs.</p>
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div>
            <span className="landing-section-label">ANIMUS AI</span>
            <h2>Make the next transaction a decision, not a guess.</h2>
          </div>
          <button
            type="button"
            className="landing-primary-button"
            onClick={onGetStarted}
          >
            Enter Animus
            <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>

      <footer className="landing-footer">
        <span>ANIMUS AI</span>
        <span>AI RISK MANAGEMENT</span>
        <span>BUILT FOR DECISION-MAKING</span>
      </footer>
    </div>
  )
}

export default LandingPage
