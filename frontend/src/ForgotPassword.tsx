import { useState } from 'react'

type ForgotPasswordProps = {
  onBackToLogin: () => void
  onBackToHome: () => void
}

function ForgotPassword({
  onBackToLogin,
  onBackToHome,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setSubmitted(true)
  }

  return (
    <div className="login-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <main className="login-container">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">A</div>

          <div>
            <h1>Animus AI</h1>
            <p>Risk Management Platform</p>
          </div>
        </div>

        {/* Card */}
        <section className="login-card">
          {!submitted ? (
            <>
              <div className="login-header">
                <p className="eyebrow">ACCOUNT RECOVERY</p>

                <h2>Forgot your password?</h2>

                <p>
                  Enter the email address associated with your Animus AI
                  account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-field">
                  <label htmlFor="forgot-email">Email</label>

                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                {error && <p className="login-error">{error}</p>}

                <button type="submit" className="login-button">
                  Continue
                </button>
              </form>
            </>
          ) : (
            <div className="forgot-success">
              <div className="forgot-success-icon">✓</div>

              <div className="login-header">
                <p className="eyebrow">RECOVERY REQUESTED</p>

                <h2>Check your email</h2>

                <p>
                  If an Animus AI account exists for{' '}
                  <strong>{email.trim()}</strong>, you’ll receive password
                  recovery instructions.
                </p>
              </div>

              <p className="forgot-note">
                Password recovery will be connected to the backend reset-token
                flow next.
              </p>
            </div>
          )}

          {/* Back to login */}
          <button
            type="button"
            className="login-switch-button"
            onClick={onBackToLogin}
          >
            Remember your password? <strong>Sign in</strong>
          </button>

          {/* Back to landing page */}
          <button
            type="button"
            className="auth-home-button"
            onClick={onBackToHome}
          >
            ← Back to home
          </button>
        </section>

        <p className="login-copyright">
          Fraud detection &amp; risk management
        </p>
      </main>
    </div>
  )
}

export default ForgotPassword