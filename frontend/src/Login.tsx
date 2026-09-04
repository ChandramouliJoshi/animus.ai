import { useState } from 'react'

type LoginProps = {
  onLogin: () => void
  onSignUp: () => void
  onForgotPassword: () => void
  onBackToHome: () => void
}

function Login({
  onLogin,
  onSignUp,
  onForgotPassword,
  onBackToHome,
}: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError(
        'Please enter your email and password.'
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ||
            'Invalid email or password.'
        )
        return
      }

      localStorage.setItem(
        'animus_token',
        data.access_token
      )

      localStorage.setItem(
        'animus_user',
        JSON.stringify({
          user_id: data.user_id,
          name: data.name,
          email: data.email,
        })
      )

      onLogin()
    } catch (err) {
      console.error(
        'Login request failed:',
        err
      )

      setError(
        'Unable to connect to Animus AI. Please make sure the backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <main className="login-container">
        <div className="login-brand">
          <div className="login-logo">A</div>

          <div>
            <h1>Animus AI</h1>
            <p>Risk Management Platform</p>
          </div>
        </div>

        <section className="login-card">
          <div className="login-header">
            <p className="eyebrow">SECURE ACCESS</p>

            <h2>Welcome back</h2>

            <p>
              Sign in to access your transaction risk dashboard.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >
            <div className="login-field">
              <label htmlFor="login-email">
                Email
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="login-password">
                  Password
                </label>

                <button
                  type="button"
                  className="login-forgot-button"
                  onClick={onForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              <div className="password-input">
                <input
                  id="login-password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword
                    ? 'Hide'
                    : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="login-spinner"
                    aria-hidden="true"
                  />

                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <span className="login-status-dot" />
            <span>
              Animus AI security environment
            </span>
          </div>

          <button
            type="button"
            className="login-switch-button"
            onClick={onSignUp}
          >
            Don't have an account?{' '}
            <strong>Sign Up</strong>
          </button>

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

export default Login