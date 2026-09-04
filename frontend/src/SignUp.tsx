import { useState } from 'react'

type SignUpProps = {
  onBackToLogin: () => void
  onBackToHome: () => void
}

function SignUp({
  onBackToLogin,
  onBackToHome,
}: SignUpProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordRequirements = [
    {
      label: 'At least 8 characters',
      valid: password.length >= 8,
    },
    {
      label: 'One uppercase letter',
      valid: /[A-Z]/.test(password),
    },
    {
      label: 'One lowercase letter',
      valid: /[a-z]/.test(password),
    },
    {
      label: 'One number',
      valid: /[0-9]/.test(password),
    },
    {
      label: 'One special character',
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ]

  const passwordIsValid = passwordRequirements.every(
    (requirement) => requirement.valid
  )

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setError('')

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError('Please fill in all fields.')
      return
    }

    if (!passwordIsValid) {
      setError('Please meet all password requirements.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/auth/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ||
            'Unable to create your account.'
        )
        return
      }

      // Account created successfully.
      // Return to login so the user can authenticate
      // and receive a JWT access token.
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      setError('')

      onBackToLogin()
    } catch (err) {
      console.error(
        'Signup request failed:',
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

            <h2>Create your account</h2>

            <p>
              Set up your account to access the transaction risk dashboard.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >
            <div className="login-field">
              <label htmlFor="signup-name">
                Name
              </label>

              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div className="login-field">
              <label htmlFor="signup-email">
                Email
              </label>

              <input
                id="signup-email"
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
              <label htmlFor="signup-password">
                Password
              </label>

              <div className="password-input">
                <input
                  id="signup-password"
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
                  placeholder="Create a strong password"
                  autoComplete="new-password"
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

              <div className="password-requirements">
                <span className="password-requirements-title">
                  Password requirements
                </span>

                {passwordRequirements.map(
                  (requirement) => (
                    <div
                      key={requirement.label}
                      className={`password-requirement ${
                        requirement.valid
                          ? 'valid'
                          : ''
                      }`}
                    >
                      <span className="password-requirement-icon">
                        {requirement.valid
                          ? '✓'
                          : '○'}
                      </span>

                      <span>
                        {requirement.label}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="signup-confirm-password">
                Confirm password
              </label>

              <div className="password-input">
                <input
                  id="signup-confirm-password"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword
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

                  Creating account...
                </>
              ) : (
                'Create Account'
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
            onClick={onBackToLogin}
          >
            Already have an account?{' '}
            <strong>Sign In</strong>
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

export default SignUp