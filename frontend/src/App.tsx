import { useState } from 'react'
import './App.css'

type Prediction = {
  risk_score: number
  risk_score_percentage: number
  threshold: number
  threshold_percentage: number
  is_fraud: boolean
  risk_level: string
  decision: string
  explanations: {
    feature: string
    value: number
    impact: number
    direction: string
    description: string
  }[]
}

const FEATURE_LABELS: Record<string, string> = {
  CUSTOMER_AMOUNT_RATIO: 'Transaction amount vs customer history',
  CUSTOMER_PREV_AMOUNT: 'Previous customer transaction',
  CUSTOMER_AMOUNT_DEVIATION: 'Difference from customer average',
  CUSTOMER_AVG_AMOUNT_BEFORE: 'Customer historical average',
  CUSTOMER_TX_COUNT_BEFORE: 'Customer transaction history',
  CUSTOMER_TX_COUNT_5M: 'Customer activity · 5 min',
  CUSTOMER_TX_COUNT_1H: 'Customer activity · 1 hour',
  CUSTOMER_TX_COUNT_24H: 'Customer activity · 24 hours',
  TERMINAL_AMOUNT_RATIO: 'Transaction amount vs terminal history',
  TERMINAL_AMOUNT_DEVIATION: 'Difference from terminal average',
  TERMINAL_AVG_AMOUNT_BEFORE: 'Terminal historical average',
  TERMINAL_TX_COUNT_BEFORE: 'Terminal transaction history',
  TERMINAL_TX_COUNT_5M: 'Terminal activity · 5 min',
  TERMINAL_TX_COUNT_1H: 'Terminal activity · 1 hour',
  TERMINAL_TX_COUNT_24H: 'Terminal activity · 24 hours',
  SYSTEM_TX_COUNT_5M: 'System activity · 5 min',
  SYSTEM_TX_COUNT_1H: 'System activity · 1 hour',
  SYSTEM_TX_COUNT_24H: 'System activity · 24 hours',
}

function getFeatureLabel(feature: string) {
  return FEATURE_LABELS[feature] ?? feature.replaceAll('_', ' ').toLowerCase()
}

function getFeatureExplanation(item: Prediction['explanations'][number]) {
  const direction =
    item.direction === 'increases_risk'
      ? 'contributing to higher model risk.'
      : 'contributing to lower model risk.'

  switch (item.feature) {
    case 'CUSTOMER_AMOUNT_RATIO':
      return `The transaction amount is ${item.value.toFixed(2)}× the customer's historical average, ${direction}`
    case 'CUSTOMER_AMOUNT_DEVIATION':
      return `The transaction differs from the customer's historical average by ₹${Math.abs(item.value).toLocaleString('en-IN')}, ${direction}`
    case 'CUSTOMER_PREV_AMOUNT':
      return `The customer's previous transaction amount was ₹${item.value.toLocaleString('en-IN')}, ${direction}`
    case 'CUSTOMER_AVG_AMOUNT_BEFORE':
      return `The customer's historical average transaction amount is ₹${item.value.toLocaleString('en-IN')}, ${direction}`
    case 'CUSTOMER_TX_COUNT_BEFORE':
      return `The customer has ${item.value.toLocaleString('en-IN')} previous transactions in the available history, ${direction}`
    case 'CUSTOMER_TX_COUNT_5M':
      return `The customer made ${item.value.toLocaleString('en-IN')} transaction(s) in the last 5 minutes, ${direction}`
    case 'CUSTOMER_TX_COUNT_1H':
      return `The customer made ${item.value.toLocaleString('en-IN')} transaction(s) in the last hour, ${direction}`
    case 'CUSTOMER_TX_COUNT_24H':
      return `The customer made ${item.value.toLocaleString('en-IN')} transaction(s) in the last 24 hours, ${direction}`
    case 'TERMINAL_AMOUNT_RATIO':
      return `The transaction amount is ${item.value.toFixed(2)}× the terminal's historical average, ${direction}`
    case 'TERMINAL_AMOUNT_DEVIATION':
      return `The transaction differs from the terminal's historical average by ₹${Math.abs(item.value).toLocaleString('en-IN')}, ${direction}`
    case 'TERMINAL_AVG_AMOUNT_BEFORE':
      return `The terminal's historical average transaction amount is ₹${item.value.toLocaleString('en-IN')}, ${direction}`
    case 'TERMINAL_PREV_AMOUNT':
      return `The terminal's previous transaction amount was ₹${item.value.toLocaleString('en-IN')}, ${direction}`
    case 'TERMINAL_TX_COUNT_BEFORE':
      return `The terminal has ${item.value.toLocaleString('en-IN')} previous transactions in the available history, ${direction}`
    case 'TERMINAL_TX_COUNT_5M':
      return `The terminal processed ${item.value.toLocaleString('en-IN')} transaction(s) in the last 5 minutes, ${direction}`
    case 'TERMINAL_TX_COUNT_1H':
      return `The terminal processed ${item.value.toLocaleString('en-IN')} transaction(s) in the last hour, ${direction}`
    case 'TERMINAL_TX_COUNT_24H':
      return `The terminal processed ${item.value.toLocaleString('en-IN')} transaction(s) in the last 24 hours, ${direction}`
    case 'SYSTEM_TX_COUNT_5M':
      return `The system processed ${item.value.toLocaleString('en-IN')} transaction(s) in the last 5 minutes, ${direction}`
    case 'SYSTEM_TX_COUNT_1H':
      return `The system processed ${item.value.toLocaleString('en-IN')} transaction(s) in the last hour, ${direction}`
    case 'SYSTEM_TX_COUNT_24H':
      return `The system processed ${item.value.toLocaleString('en-IN')} transaction(s) in the last 24 hours, ${direction}`
    default:
      return `${item.description} This factor is ${direction}`
  }
}

function App() {
  const [amount, setAmount] = useState('100')
  const [hour, setHour] = useState('12')
  const [day, setDay] = useState('2')

  // Customer features
  const [customerTimeSincePrev, setCustomerTimeSincePrev] = useState('0')
  const [customerPrevAmount, setCustomerPrevAmount] = useState('0')
  const [customerTxBefore, setCustomerTxBefore] = useState('0')
  const [customerTx5m, setCustomerTx5m] = useState('0')
  const [customerTx1h, setCustomerTx1h] = useState('0')
  const [customerTx24h, setCustomerTx24h] = useState('0')
  const [customerAvgAmount, setCustomerAvgAmount] = useState('0')
  const [customerHasHistory, setCustomerHasHistory] = useState('0')

  // Terminal features
  const [terminalTimeSincePrev, setTerminalTimeSincePrev] = useState('0')
  const [terminalPrevAmount, setTerminalPrevAmount] = useState('0')
  const [terminalTxBefore, setTerminalTxBefore] = useState('0')
  const [terminalTx5m, setTerminalTx5m] = useState('0')
  const [terminalTx1h, setTerminalTx1h] = useState('0')
  const [terminalTx24h, setTerminalTx24h] = useState('0')
  const [terminalAvgAmount, setTerminalAvgAmount] = useState('0')
  const [terminalHasHistory, setTerminalHasHistory] = useState('0')

  // System features
  const [systemTx5m, setSystemTx5m] = useState('0')
  const [systemTx1h, setSystemTx1h] = useState('0')
  const [systemTx24h, setSystemTx24h] = useState('0')

  // Advanced sections
  const [customerAdvancedOpen, setCustomerAdvancedOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [systemOpen, setSystemOpen] = useState(false)

  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // =========================
  // DEMO SCENARIOS
  // =========================

  function applyScenario(
    scenario: 'normal' | 'suspicious' | 'high-activity'
  ) {
    if (scenario === 'normal') {
      setAmount('250')
      setHour('14')
      setDay('2')

      setCustomerTimeSincePrev('3600')
      setCustomerPrevAmount('220')
      setCustomerTxBefore('18')
      setCustomerTx5m('0')
      setCustomerTx1h('1')
      setCustomerTx24h('4')
      setCustomerAvgAmount('240')
      setCustomerHasHistory('1')

      setTerminalTimeSincePrev('1800')
      setTerminalPrevAmount('260')
      setTerminalTxBefore('150')
      setTerminalTx5m('1')
      setTerminalTx1h('3')
      setTerminalTx24h('12')
      setTerminalAvgAmount('250')
      setTerminalHasHistory('1')

      setSystemTx5m('120')
      setSystemTx1h('850')
      setSystemTx24h('7200')
    }

    if (scenario === 'suspicious') {
      setAmount('5000')
      setHour('3')
      setDay('6')

      setCustomerTimeSincePrev('120')
      setCustomerPrevAmount('80')
      setCustomerTxBefore('20')
      setCustomerTx5m('1')
      setCustomerTx1h('2')
      setCustomerTx24h('5')
      setCustomerAvgAmount('120')
      setCustomerHasHistory('1')

      setTerminalTimeSincePrev('300')
      setTerminalPrevAmount('90')
      setTerminalTxBefore('85')
      setTerminalTx5m('1')
      setTerminalTx1h('4')
      setTerminalTx24h('18')
      setTerminalAvgAmount('150')
      setTerminalHasHistory('1')

      setSystemTx5m('180')
      setSystemTx1h('1200')
      setSystemTx24h('9800')
    }

    if (scenario === 'high-activity') {
      setAmount('1800')
      setHour('1')
      setDay('5')

      setCustomerTimeSincePrev('30')
      setCustomerPrevAmount('1500')
      setCustomerTxBefore('65')
      setCustomerTx5m('4')
      setCustomerTx1h('14')
      setCustomerTx24h('38')
      setCustomerAvgAmount('700')
      setCustomerHasHistory('1')

      setTerminalTimeSincePrev('20')
      setTerminalPrevAmount('1200')
      setTerminalTxBefore('320')
      setTerminalTx5m('6')
      setTerminalTx1h('24')
      setTerminalTx24h('95')
      setTerminalAvgAmount('650')
      setTerminalHasHistory('1')

      setSystemTx5m('450')
      setSystemTx1h('3200')
      setSystemTx24h('25000')
    }

    // Scenario changed, so clear previous result.
    setPrediction(null)
    setError('')
  }

  // =========================
  // ANALYZE TRANSACTION
  // =========================

  async function analyzeTransaction() {
    setLoading(true)
    setError('')

    const transactionAmount = Number(amount)
    const customerAverage = Number(customerAvgAmount)
    const terminalAverage = Number(terminalAvgAmount)

    const customerDeviation =
      transactionAmount - customerAverage

    const customerRatio =
      customerAverage > 0
        ? transactionAmount / customerAverage
        : 0

    const terminalDeviation =
      transactionAmount - terminalAverage

    const terminalRatio =
      terminalAverage > 0
        ? transactionAmount / terminalAverage
        : 0

    const transaction = {
      TX_AMOUNT: transactionAmount,
      TX_HOUR: Number(hour),
      TX_DAY_OF_WEEK: Number(day),

      CUSTOMER_TIME_SINCE_PREV: Number(customerTimeSincePrev),
      CUSTOMER_PREV_AMOUNT: Number(customerPrevAmount),
      CUSTOMER_TX_COUNT_BEFORE: Number(customerTxBefore),
      CUSTOMER_TX_COUNT_5M: Number(customerTx5m),
      CUSTOMER_TX_COUNT_1H: Number(customerTx1h),
      CUSTOMER_TX_COUNT_24H: Number(customerTx24h),
      CUSTOMER_AVG_AMOUNT_BEFORE: customerAverage,
      CUSTOMER_AMOUNT_DEVIATION: customerDeviation,
      CUSTOMER_AMOUNT_RATIO: customerRatio,
      CUSTOMER_HAS_HISTORY: Number(customerHasHistory),

      TERMINAL_TIME_SINCE_PREV: Number(terminalTimeSincePrev),
      TERMINAL_PREV_AMOUNT: Number(terminalPrevAmount),
      TERMINAL_TX_COUNT_BEFORE: Number(terminalTxBefore),
      TERMINAL_TX_COUNT_5M: Number(terminalTx5m),
      TERMINAL_TX_COUNT_1H: Number(terminalTx1h),
      TERMINAL_TX_COUNT_24H: Number(terminalTx24h),
      TERMINAL_AVG_AMOUNT_BEFORE: terminalAverage,
      TERMINAL_AMOUNT_DEVIATION: terminalDeviation,
      TERMINAL_AMOUNT_RATIO: terminalRatio,
      TERMINAL_HAS_HISTORY: Number(terminalHasHistory),

      SYSTEM_TX_COUNT_5M: Number(systemTx5m),
      SYSTEM_TX_COUNT_1H: Number(systemTx1h),
      SYSTEM_TX_COUNT_24H: Number(systemTx24h),
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/predict',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to analyze transaction')
      }

      const data: Prediction = await response.json()

      setPrediction(data)
    } catch (err) {
      setError('Could not connect to Animus API.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formattedAmount = Number(amount || 0).toLocaleString('en-IN')

  return (
    <div className="app">

      {/* =========================
          TOP BAR
      ========================= */}

      <header className="topbar">
        <div className="brand">
          <h1>Animus AI</h1>
          <p>AI-powered fraud detection &amp; risk management</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          API Online
        </div>
      </header>


      {/* =========================
          MAIN DASHBOARD
      ========================= */}

      <main className="dashboard">

        <section className="welcome">
          <p className="eyebrow">RISK MANAGEMENT</p>

          <h2>Transaction Risk Dashboard</h2>

          <p>
            Analyze a transaction, evaluate its fraud risk, and understand
            what signals influenced the model's decision.
          </p>
        </section>


        {/* =========================
            RESULT SUMMARY
        ========================= */}

        <section className="cards">

          <div className="card risk-score-card">
            <div className="card-top">
              <span className="card-label">Risk Score</span>

              {prediction && (
                <span className="card-meta">
                  Threshold {prediction.threshold_percentage}%
                </span>
              )}
            </div>

            <strong>
              {prediction
                ? `${prediction.risk_score_percentage}%`
                : '—'}
            </strong>

            <div className="risk-bar">
              <div
                className="risk-bar-fill"
                style={{
                  width: prediction
                    ? `${Math.min(
                        prediction.risk_score_percentage,
                        100
                      )}%`
                    : '0%',
                }}
              />
            </div>

            <small>
              {prediction
                ? 'Model confidence for this transaction'
                : 'Awaiting transaction'}
            </small>
          </div>


          <div className="card">
            <div className="card-top">
              <span className="card-label">Decision</span>
            </div>

            <strong
              className={
                prediction
                  ? `decision-${prediction.decision.toLowerCase()}`
                  : ''
              }
            >
              {prediction ? prediction.decision : '—'}
            </strong>

            <small>
              {prediction
                ? 'Recommended action'
                : 'Awaiting analysis'}
            </small>
          </div>


          <div className="card">
            <div className="card-top">
              <span className="card-label">Risk Level</span>
            </div>

            <strong
              className={
                prediction
                  ? `risk-${prediction.risk_level
                      .toLowerCase()
                      .replace('-', '')}`
                  : ''
              }
            >
              {prediction ? prediction.risk_level : '—'}
            </strong>

            <small>
              {prediction
                ? 'Current assessment'
                : 'Awaiting analysis'}
            </small>
          </div>

        </section>


        {/* =========================
            MAIN WORKSPACE
        ========================= */}

        <section className="analysis-grid">

          {/* =========================
              TRANSACTION ANALYSIS
          ========================= */}

          <div className="panel analysis-panel">

            <div className="panel-header">
              <div>
                <p className="eyebrow">TRANSACTION ANALYSIS</p>
                <h3>Score a Transaction</h3>
              </div>

              <span className="panel-badge">
                26 signals
              </span>
            </div>


            <div className="transaction-form">

              {/* =========================
                  DEMO SCENARIOS
              ========================= */}

              <div className="demo-scenarios">
                <div className="demo-header">
                  <div>
                    <span>QUICK DEMO</span>
                    <p>Load a transaction scenario</p>
                  </div>
                </div>

                <div className="scenario-buttons">

                  <button
                    type="button"
                    onClick={() =>
                      applyScenario('normal')
                    }
                  >
                    <span className="scenario-dot normal-dot" />
                    Normal
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyScenario('suspicious')
                    }
                  >
                    <span className="scenario-dot suspicious-dot" />
                    Suspicious
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyScenario('high-activity')
                    }
                  >
                    <span className="scenario-dot activity-dot" />
                    High Activity
                  </button>

                </div>
              </div>


              {/* =========================
                  PRIMARY TRANSACTION
              ========================= */}

              <div className="form-section-heading">
                <div>
                  <span className="section-number">01</span>

                  <div>
                    <h4>Transaction</h4>
                    <p>Basic transaction context</p>
                  </div>
                </div>
              </div>


              <div className="amount-field">
                <label htmlFor="amount">
                  Transaction Amount
                </label>

                <div className="amount-input">
                  <span>₹</span>

                  <input
                    id="amount"
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="100.00"
                  />
                </div>
              </div>


              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="hour">
                    Transaction Hour
                  </label>

                  <input
                    id="hour"
                    type="number"
                    min="0"
                    max="23"
                    value={hour}
                    onChange={(event) =>
                      setHour(event.target.value)
                    }
                  />
                </div>


                <div className="form-group">
                  <label htmlFor="day">
                    Day of Week
                  </label>

                  <select
                    id="day"
                    value={day}
                    onChange={(event) =>
                      setDay(event.target.value)
                    }
                  >
                    <option value="0">Monday</option>
                    <option value="1">Tuesday</option>
                    <option value="2">Wednesday</option>
                    <option value="3">Thursday</option>
                    <option value="4">Friday</option>
                    <option value="5">Saturday</option>
                    <option value="6">Sunday</option>
                  </select>
                </div>

              </div>


              {/* =========================
                  CUSTOMER BEHAVIOR
              ========================= */}

              <div className="form-section-heading customer-heading">
                <div>
                  <span className="section-number">02</span>

                  <div>
                    <h4>Customer Behavior</h4>
                    <p>
                      Compare this transaction with customer history
                    </p>
                  </div>
                </div>
              </div>


              <div className="signal-grid">

                <div className="form-group">
                  <label htmlFor="customer-prev">
                    Previous Amount
                  </label>

                  <div className="input-wrapper">
                    <span>₹</span>

                    <input
                      id="customer-prev"
                      type="number"
                      min="0"
                      value={customerPrevAmount}
                      onChange={(event) =>
                        setCustomerPrevAmount(
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>


                <div className="form-group">
                  <label htmlFor="customer-avg">
                    Historical Average
                  </label>

                  <div className="input-wrapper">
                    <span>₹</span>

                    <input
                      id="customer-avg"
                      type="number"
                      min="0"
                      value={customerAvgAmount}
                      onChange={(event) =>
                        setCustomerAvgAmount(
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>


                <div className="form-group">
                  <label htmlFor="customer-before">
                    Transactions Before
                  </label>

                  <input
                    id="customer-before"
                    type="number"
                    min="0"
                    value={customerTxBefore}
                    onChange={(event) =>
                      setCustomerTxBefore(
                        event.target.value
                      )
                    }
                  />
                </div>


                <div className="form-group">
                  <label htmlFor="customer-history">
                    Customer History
                  </label>

                  <select
                    id="customer-history"
                    value={customerHasHistory}
                    onChange={(event) =>
                      setCustomerHasHistory(
                        event.target.value
                      )
                    }
                  >
                    <option value="0">No History</option>
                    <option value="1">Has History</option>
                  </select>
                </div>

              </div>


              {/* AUTO-DERIVED SIGNALS */}

              <div className="derived-signals">

                <div className="derived-signal">
                  <span>Amount deviation</span>

                  <strong>
                    ₹{(
                      Number(amount || 0) -
                      Number(customerAvgAmount || 0)
                    ).toLocaleString('en-IN')}
                  </strong>
                </div>


                <div className="derived-signal">
                  <span>Amount ratio</span>

                  <strong>
                    {Number(customerAvgAmount) > 0
                      ? (
                          Number(amount) /
                          Number(customerAvgAmount)
                        ).toFixed(2)
                      : '0.00'}
                    ×
                  </strong>
                </div>

              </div>


              {/* ADVANCED CUSTOMER */}

              <button
                type="button"
                className="form-section-toggle"
                onClick={() =>
                  setCustomerAdvancedOpen(
                    !customerAdvancedOpen
                  )
                }
              >
                <span>
                  Advanced customer signals
                </span>

                <span className="toggle-right">
                  {customerAdvancedOpen
                    ? 'Hide'
                    : 'Show'}

                  <b>
                    {customerAdvancedOpen
                      ? '−'
                      : '+'}
                  </b>
                </span>
              </button>


              {customerAdvancedOpen && (
                <div className="collapsible-section">

                  <div className="form-row">

                    <div className="form-group">
                      <label htmlFor="customer-time">
                        Time Since Previous
                      </label>

                      <input
                        id="customer-time"
                        type="number"
                        min="0"
                        value={customerTimeSincePrev}
                        onChange={(event) =>
                          setCustomerTimeSincePrev(
                            event.target.value
                          )
                        }
                      />
                    </div>


                    <div className="form-group">
                      <label htmlFor="customer-5m">
                        Transactions — 5 min
                      </label>

                      <input
                        id="customer-5m"
                        type="number"
                        min="0"
                        value={customerTx5m}
                        onChange={(event) =>
                          setCustomerTx5m(
                            event.target.value
                          )
                        }
                      />
                    </div>

                  </div>


                  <div className="form-row">

                    <div className="form-group">
                      <label htmlFor="customer-1h">
                        Transactions — 1 hour
                      </label>

                      <input
                        id="customer-1h"
                        type="number"
                        min="0"
                        value={customerTx1h}
                        onChange={(event) =>
                          setCustomerTx1h(
                            event.target.value
                          )
                        }
                      />
                    </div>


                    <div className="form-group">
                      <label htmlFor="customer-24h">
                        Transactions — 24 hours
                      </label>

                      <input
                        id="customer-24h"
                        type="number"
                        min="0"
                        value={customerTx24h}
                        onChange={(event) =>
                          setCustomerTx24h(
                            event.target.value
                          )
                        }
                      />
                    </div>

                  </div>

                </div>
              )}


              {/* =========================
                  TERMINAL
              ========================= */}

              <button
                type="button"
                className="form-section-toggle"
                onClick={() =>
                  setTerminalOpen(!terminalOpen)
                }
              >
                <span>
                  <span className="advanced-label">
                    03
                  </span>

                  Terminal Behavior
                </span>

                <span className="toggle-right">
                  {terminalOpen
                    ? 'Hide'
                    : 'Advanced'}

                  <b>
                    {terminalOpen
                      ? '−'
                      : '+'}
                  </b>
                </span>
              </button>


              {terminalOpen && (
                <div className="collapsible-section">

                  <div className="form-row">

                    <div className="form-group">
                      <label htmlFor="terminal-time">
                        Time Since Previous
                      </label>

                      <input
                        id="terminal-time"
                        type="number"
                        min="0"
                        value={terminalTimeSincePrev}
                        onChange={(event) =>
                          setTerminalTimeSincePrev(
                            event.target.value
                          )
                        }
                      />
                    </div>


                    <div className="form-group">
                      <label htmlFor="terminal-prev">
                        Previous Amount
                      </label>

                      <div className="input-wrapper">
                        <span>₹</span>

                        <input
                          id="terminal-prev"
                          type="number"
                          min="0"
                          value={terminalPrevAmount}
                          onChange={(event) =>
                            setTerminalPrevAmount(
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                  </div>


                  <div className="form-row">

                    <div className="form-group">
                      <label htmlFor="terminal-before">
                        Transactions Before
                      </label>

                      <input
                        id="terminal-before"
                        type="number"
                        min="0"
                        value={terminalTxBefore}
                        onChange={(event) =>
                          setTerminalTxBefore(
                            event.target.value
                          )
                        }
                      />
                    </div>


                    <div className="form-group">
                      <label htmlFor="terminal-history">
                        Terminal History
                      </label>

                      <select
                        id="terminal-history"
                        value={terminalHasHistory}
                        onChange={(event) =>
                          setTerminalHasHistory(
                            event.target.value
                          )
                        }
                      >
                        <option value="0">
                          No History
                        </option>

                        <option value="1">
                          Has History
                        </option>
                      </select>
                    </div>

                  </div>


                  <div className="form-row">

                    <div className="form-group">
                      <label htmlFor="terminal-5m">
                        Transactions — 5 min
                      </label>

                      <input
                        id="terminal-5m"
                        type="number"
                        min="0"
                        value={terminalTx5m}
                        onChange={(event) =>
                          setTerminalTx5m(
                            event.target.value
                          )
                        }
                      />
                    </div>


                    <div className="form-group">
                      <label htmlFor="terminal-1h">
                        Transactions — 1 hour
                      </label>

                      <input
                        id="terminal-1h"
                        type="number"
                        min="0"
                        value={terminalTx1h}
                        onChange={(event) =>
                          setTerminalTx1h(
                            event.target.value
                          )
                        }
                      />
                    </div>

                  </div>


                  <div className="form-row">

                    <div className="form-group">
                      <label htmlFor="terminal-24h">
                        Transactions — 24 hours
                      </label>

                      <input
                        id="terminal-24h"
                        type="number"
                        min="0"
                        value={terminalTx24h}
                        onChange={(event) =>
                          setTerminalTx24h(
                            event.target.value
                          )
                        }
                      />
                    </div>


                    <div className="form-group">
                      <label htmlFor="terminal-avg">
                        Historical Average
                      </label>

                      <div className="input-wrapper">
                        <span>₹</span>

                        <input
                          id="terminal-avg"
                          type="number"
                          min="0"
                          value={terminalAvgAmount}
                          onChange={(event) =>
                            setTerminalAvgAmount(
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                  </div>


                  <div className="derived-info">
                    Terminal deviation and ratio are calculated
                    automatically from the transaction amount and
                    terminal average.
                  </div>

                </div>
              )}


              {/* =========================
                  SYSTEM
              ========================= */}

              <button
                type="button"
                className="form-section-toggle"
                onClick={() =>
                  setSystemOpen(!systemOpen)
                }
              >
                <span>
                  <span className="advanced-label">
                    04
                  </span>

                  System Activity
                </span>

                <span className="toggle-right">
                  {systemOpen
                    ? 'Hide'
                    : 'Advanced'}

                  <b>
                    {systemOpen
                      ? '−'
                      : '+'}
                  </b>
                </span>
              </button>


              {systemOpen && (
                <div className="collapsible-section">

                  <div className="form-row">

                    <div className="form-group">
                      <label htmlFor="system-5m">
                        Transactions — 5 min
                      </label>

                      <input
                        id="system-5m"
                        type="number"
                        min="0"
                        value={systemTx5m}
                        onChange={(event) =>
                          setSystemTx5m(
                            event.target.value
                          )
                        }
                      />
                    </div>


                    <div className="form-group">
                      <label htmlFor="system-1h">
                        Transactions — 1 hour
                      </label>

                      <input
                        id="system-1h"
                        type="number"
                        min="0"
                        value={systemTx1h}
                        onChange={(event) =>
                          setSystemTx1h(
                            event.target.value
                          )
                        }
                      />
                    </div>

                  </div>


                  <div className="form-group">
                    <label htmlFor="system-24h">
                      Transactions — 24 hours
                    </label>

                    <input
                      id="system-24h"
                      type="number"
                      min="0"
                      value={systemTx24h}
                      onChange={(event) =>
                        setSystemTx24h(
                          event.target.value
                        )
                      }
                    />
                  </div>

                </div>
              )}


              {/* =========================
                  ACTION
              ========================= */}

              <div className="analyze-area">

                <div className="analyze-context">
                  <span>
                    Transaction
                  </span>

                  <strong>
                    ₹{formattedAmount}
                  </strong>
                </div>


                <button
                  type="button"
                  className="analyze-button"
                  onClick={analyzeTransaction}
                  disabled={loading}
                >
                  {loading
                    ? 'Analyzing transaction...'
                    : 'Analyze Transaction'}
                </button>

              </div>


              {error && (
                <p className="error-message">
                  {error}
                </p>
              )}

            </div>
          </div>


          {/* =========================
              EXPLAINABILITY
          ========================= */}

          <div className="panel explainability-panel">

            <div className="panel-header">

              <div>
                <p className="eyebrow">
                  EXPLAINABILITY
                </p>

                <h3>
                  Risk Factors
                </h3>
              </div>

              <span className="panel-badge">
                SHAP
              </span>

            </div>


            {prediction ? (
              <div className="explanations">

                <div className="explanation-intro">
                  <span>
                    MODEL SIGNALS
                  </span>

                  <p>
                    The strongest factors influencing this
                    transaction's risk score.
                  </p>
                </div>


                {prediction.explanations.map(
                  (item, index) => (
                    <div
                      className="explanation"
                      key={item.feature}
                    >

                      <div className="explanation-index">
                        0{index + 1}
                      </div>


                      <div className="explanation-content">

                        <div className="explanation-top">

                          <strong>
                            {getFeatureLabel(item.feature)}
                          </strong>

                          <span
                            className={
                              item.direction ===
                              'increases_risk'
                                ? 'impact positive'
                                : 'impact negative'
                            }
                          >
                            {item.impact > 0
                              ? '+'
                              : ''}

                            {item.impact.toFixed(3)}
                          </span>

                        </div>


                        <div className="impact-track">

                          <div
                            className={
                              item.direction ===
                              'increases_risk'
                                ? 'impact-fill positive-fill'
                                : 'impact-fill negative-fill'
                            }
                            style={{
                              width: `${Math.min(
                                Math.abs(
                                  item.impact
                                ) * 12,
                                100
                              )}%`,
                            }}
                          />

                        </div>


                        <p>
                          {getFeatureExplanation(item)}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            ) : (

              <div className="empty-state">

                <div className="empty-icon">
                  +
                </div>

                <span>
                  SHAP EXPLANATION
                </span>

                <p>
                  Run a transaction analysis to see which
                  behavioral signals are driving the model's
                  decision.
                </p>

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  )
}

export default App