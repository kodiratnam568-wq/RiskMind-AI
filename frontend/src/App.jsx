import { useState } from "react";
import "./App.css";

const API_URL = "";


/* =========================================================
   LOGO
========================================================= */

function RiskMindLogo() {
  return (
    <div className="logo-mark">
      <svg
        width="30"
        height="30"
        viewBox="0 0 40 40"
        fill="none"
      >
        <path
          d="M20 3L34 8V18C34 27 28.5 34 20 37C11.5 34 6 27 6 18V8L20 3Z"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M12 20L17 25L29 13"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}


/* =========================================================
   MAIN APP
========================================================= */

function App() {

  const [activePage, setActivePage] = useState("Dashboard");


  /* =======================================================
     TRANSACTION FORM
  ======================================================= */

  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("India");
  const [deviceId, setDeviceId] = useState("");
  const [transactions, setTransactions] = useState("");
  const [newDevice, setNewDevice] = useState(false);
  const [newLocation, setNewLocation] = useState(false);


  /* =======================================================
     ANALYSIS RESULT
  ======================================================= */

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  /* =======================================================
     TRANSACTION HISTORY
  ======================================================= */

  const [history, setHistory] = useState([]);


  /* =======================================================
     COPILOT
  ======================================================= */

  const [chatInput, setChatInput] = useState("");

  const [messages, setMessages] = useState([
    {
      type: "bot",
      text:
        "Hello! I am RiskMind AI. Analyze a transaction and I can explain the risk, detected factors, probability, and recommended action."
    }
  ]);


  /* =======================================================
     SETTINGS
  ======================================================= */

  const [notifications, setNotifications] = useState(true);
  const [autoBlock, setAutoBlock] = useState(true);


  /* =======================================================
     ANALYZE TRANSACTION
  ======================================================= */

  const analyzeTransaction = async (e) => {

    e.preventDefault();

    setError("");
    setResult(null);
    setLoading(true);

    try {

      const payload = {
        amount: Number(amount),

        location:
          location.trim() || "India",

        device_id:
          deviceId.trim() || "unknown-device",

        transactions_last_hour:
          Number(transactions),

        is_new_device:
          newDevice,

        is_new_location:
          newLocation
      };


      const response = await fetch(
        `${API_URL}/analyze`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(payload)
        }
      );


      if (!response.ok) {

        const errorData =
          await response.text();

        throw new Error(
          errorData ||
          "Backend analysis failed"
        );
      }


      const data =
        await response.json();


      setResult(data);


      /* Add transaction to history */

      const historyItem = {

        id:
          `TXN-${Date.now()
            .toString()
            .slice(-6)}`,

        amount:
          Number(amount),

        location:
          location.trim() || "India",

        deviceId:
          deviceId.trim() ||
          "unknown-device",

        score:
          data.risk_score,

        probability:
          data.fraud_probability,

        level:
          data.risk_level,

        action:
          data.recommended_action,

        reasons:
          data.reasons,

        time:
          new Date().toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit"
            }
          )
      };


      setHistory((prev) => [
        historyItem,
        ...prev
      ]);

    }

    catch (err) {

      console.error(err);

      setError(
        "Unable to connect to RiskMind AI backend. Please make sure FastAPI is running on port 8000."
      );

    }

    finally {

      setLoading(false);

    }
  };


  /* =======================================================
     AI COPILOT
  ======================================================= */

  const sendMessage = () => {

    const text =
      chatInput.trim();

    if (!text) return;


    /* User message */

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text
      }
    ]);


    const lower =
      text.toLowerCase();


    let reply =
      "I can help with transaction risk, fraud probability, risk factors, model results, and recommended actions.";


    /* Greeting */

    if (
      lower === "hi" ||
      lower === "hello" ||
      lower === "hey" ||
      lower.includes("hlo")
    ) {

      reply =
        "Hello! I'm RiskMind AI. Ask me things like 'Why is this risky?', 'What are the risk factors?', 'What should I do?', or 'What is the fraud probability?'.";

    }


    /* No transaction */

    else if (!result) {

      reply =
        "Please analyze a transaction first. Once the AI generates a risk assessment, I can explain the result.";

    }


    /* Why */

    else if (
      lower.includes("why") ||
      lower.includes("reason") ||
      lower.includes("explain")
    ) {

      reply =
        `This transaction is classified as ${result.risk_level} risk with a ${result.risk_score}% risk score. The main detected signals are: ${result.reasons.join(", ")}.`;

    }


    /* Factors */

    else if (
      lower.includes("factor") ||
      lower.includes("factors") ||
      lower.includes("signal") ||
      lower.includes("signals")
    ) {

      reply =
        `Risk factors detected: ${result.reasons.join(", ")}.`;

    }


    /* Probability */

    else if (
      lower.includes("probability") ||
      lower.includes("chance") ||
      lower.includes("confidence")
    ) {

      reply =
        `The model estimates ${(result.fraud_probability * 100).toFixed(1)}% fraud probability for this transaction.`;

    }


    /* Score */

    else if (
      lower.includes("score") ||
      lower.includes("risk level") ||
      lower.includes("how risky")
    ) {

      reply =
        `The current risk score is ${result.risk_score}%, which is classified as ${result.risk_level} risk.`;

    }


    /* Action */

    else if (
      lower.includes("action") ||
      lower.includes("what should") ||
      lower.includes("what do") ||
      lower.includes("should i")
    ) {

      if (result.risk_level === "HIGH") {

        reply =
          "RiskMind recommends blocking this transaction because multiple elevated-risk signals were detected.";

      }

      else if (
        result.risk_level === "MEDIUM"
      ) {

        reply =
          "RiskMind recommends reviewing this transaction before completing it because some elevated-risk signals were detected.";

      }

      else {

        reply =
          "RiskMind considers this transaction low risk. The current recommendation is to allow the transaction.";

      }

    }


    /* Safe / wrong */

    else if (
      lower.includes("safe") ||
      lower.includes("wrong") ||
      lower.includes("problem") ||
      lower.includes("anything")
    ) {

      reply =
        `The transaction is currently classified as ${result.risk_level} risk. RiskMind detected ${result.reasons.length} risk indicator(s): ${result.reasons.join(", ")}.`;

    }


    /* General */

    else {

      reply =
        `The transaction is ${result.risk_level} risk with a ${result.risk_score}% score. Ask me "why", "risk factors", "probability", or "what should I do?" for more details.`;

    }


    /* Bot response */

    setTimeout(() => {

      setMessages((prev) => [
        ...prev,

        {
          type: "bot",
          text: reply
        }
      ]);

    }, 300);


    setChatInput("");

  };


  /* =======================================================
     PAGE DESCRIPTIONS
  ======================================================= */

  const pageDescription = {

    Dashboard:
      "Monitor transaction risk, AI decisions, and system intelligence.",

    Transactions:
      "Review every transaction analyzed by RiskMind AI.",

    "Risk Intelligence":
      "Understand risk levels, detection signals, and AI decisions.",

    "Model Evaluation":
      "Inspect Random Forest performance on the test dataset.",

    Settings:
      "Manage RiskMind AI system and analyst preferences."

  };


  /* =======================================================
     SIDEBAR
  ======================================================= */

  const navItems = [

    {
      name: "Dashboard",
      icon: "◈"
    },

    {
      name: "Transactions",
      icon: "◉"
    },

    {
      name: "Risk Intelligence",
      icon: "⌁"
    },

    {
      name: "Model Evaluation",
      icon: "▣"
    }

  ];


  return (

    <div className="app-shell">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">


        <div className="brand">

          <RiskMindLogo />

          <div>

            <div className="brand-name">
              RiskMind
            </div>

            <div className="brand-ai">
              AI RISK INTELLIGENCE
            </div>

          </div>

        </div>


        <div className="sidebar-label">
          MAIN
        </div>


        <nav>

          {navItems.map((item) => (

            <button
              key={item.name}
              className={
                `nav-item ${
                  activePage === item.name
                    ? "active"
                    : ""
                }`
              }
              onClick={() =>
                setActivePage(item.name)
              }
            >

              <span>
                {item.icon}
              </span>

              {item.name}

            </button>

          ))}

        </nav>


        <div className="sidebar-bottom">

          <div className="sidebar-label">
            SYSTEM
          </div>


          <button
            className={
              `nav-item ${
                activePage === "Settings"
                  ? "active"
                  : ""
              }`
            }
            onClick={() =>
              setActivePage("Settings")
            }
          >

            <span>⚙</span>

            Settings

          </button>


          <div className="sidebar-system">

            <div className="status-dot"></div>

            <div>

              <div className="system-title">
                AI Engine Online
              </div>

              <div className="system-subtitle">
                Random Forest v1.0
              </div>

            </div>

          </div>


          <div className="sidebar-footer">
            RiskMind AI © 2026
          </div>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main-area">


        {/* TOPBAR */}

        <header className="topbar">

          <div className="breadcrumb">
            Risk Intelligence / {activePage}
          </div>


          <div className="top-actions">

            <div className="system-status">

              <span className="status-dot"></span>

              SYSTEM OPERATIONAL

            </div>


            <div className="profile">

              <div className="profile-avatar">
                R
              </div>

              <div>

                <div className="profile-name">
                  Risk Analyst
                </div>

                <div className="profile-role">
                  Administrator
                </div>

              </div>

            </div>

          </div>

        </header>


        {/* CONTENT */}

        <section className="content">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="page-heading">

            <div>

              <div className="eyebrow">
                AI-POWERED FRAUD INTELLIGENCE
              </div>

              <h1>
                {activePage}
              </h1>

              <p>
                {pageDescription[activePage]}
              </p>

            </div>


            <div className="hero-badge">
              ● AI ENGINE ACTIVE
            </div>

          </section>


          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activePage === "Dashboard" && (

            <>


              {/* KPI CARDS */}

              <section className="stats-grid">


                <div className="stat-card">

                  <div className="stat-label">
                    TRANSACTIONS ANALYZED
                  </div>

                  <div className="stat-value">
                    {5000 + history.length}
                  </div>

                  <div className="stat-change positive">
                    Dataset + live analysis
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-label">
                    FRAUD DETECTIONS
                  </div>

                  <div className="stat-value">
                    {2188 +
                      history.filter(
                        (item) =>
                          item.level === "HIGH"
                      ).length}
                  </div>

                  <div className="stat-change">
                    High-risk detections
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-label">
                    MODEL ACCURACY
                  </div>

                  <div className="stat-value">
                    100%
                  </div>

                  <div className="stat-change positive">
                    Held-out test set
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-label">
                    AI STATUS
                  </div>

                  <div className="stat-value status-online">
                    ONLINE
                  </div>

                  <div className="stat-change positive">
                    FastAPI connected
                  </div>

                </div>

              </section>


              {/* MAIN DASHBOARD */}

              <section className="dashboard-grid">


                {/* TRANSACTION FORM */}

                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <div className="section-kicker">
                        TRANSACTION INTELLIGENCE
                      </div>

                      <h2>
                        Analyze Transaction
                      </h2>

                    </div>

                    <div className="panel-symbol">
                      ⚡
                    </div>

                  </div>


                  <form
                    className="transaction-form"
                    onSubmit={analyzeTransaction}
                  >


                    <div className="field">

                      <label>
                        Transaction Amount
                      </label>

                      <div className="input-wrap">

                        <span className="currency">
                          ₹
                        </span>

                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) =>
                            setAmount(
                              e.target.value
                            )
                          }
                          required
                        />

                      </div>

                    </div>


                    <div className="field">

                      <label>
                        Location
                      </label>

                      <input
                        type="text"
                        placeholder="Example: India"
                        value={location}
                        onChange={(e) =>
                          setLocation(
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>


                    <div className="field">

                      <label>
                        Device ID
                      </label>

                      <input
                        type="text"
                        placeholder="Example: DEV-1001"
                        value={deviceId}
                        onChange={(e) =>
                          setDeviceId(
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="field">

                      <label>
                        Transactions in Last Hour
                      </label>

                      <input
                        type="number"
                        min="0"
                        placeholder="Example: 3"
                        value={transactions}
                        onChange={(e) =>
                          setTransactions(
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>


                    <div className="switch-row">


                      <label className="toggle-box">

                        <input
                          type="checkbox"
                          checked={newDevice}
                          onChange={(e) =>
                            setNewDevice(
                              e.target.checked
                            )
                          }
                        />

                        <span className="custom-check"></span>

                        New Device

                      </label>


                      <label className="toggle-box">

                        <input
                          type="checkbox"
                          checked={newLocation}
                          onChange={(e) =>
                            setNewLocation(
                              e.target.checked
                            )
                          }
                        />

                        <span className="custom-check"></span>

                        New Location

                      </label>

                    </div>


                    {error && (

                      <div className="error-box">
                        {error}
                      </div>

                    )}


                    <button
                      className="analyze-button"
                      type="submit"
                      disabled={loading}
                    >

                      {loading
                        ? "ANALYZING..."
                        : "ANALYZE TRANSACTION →"}

                    </button>

                  </form>

                </div>


                {/* RISK ASSESSMENT */}

                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <div className="section-kicker">
                        AI ASSESSMENT
                      </div>

                      <h2>
                        Risk Assessment
                      </h2>

                    </div>

                    <div className="ai-chip">
                      AI
                    </div>

                  </div>


                  {!result ? (

                    <div className="empty-result">

                      <div className="empty-icon">
                        ◉
                      </div>

                      <h3>
                        Awaiting transaction
                      </h3>

                      <p>
                        Submit transaction data
                        to generate an AI risk
                        assessment.
                      </p>

                    </div>

                  ) : (

                    <div className="result-content">


                      <div
                        className={
                          `risk-circle ${
                            result.risk_level.toLowerCase()
                          }`
                        }
                      >

                        <div className="risk-inner">

                          <div className="risk-score">
                            {result.risk_score}%
                          </div>

                          <div className="risk-caption">
                            RISK SCORE
                          </div>

                        </div>

                      </div>


                      <div className="risk-title-row">

                        <span
                          className={
                            `risk-level ${
                              result.risk_level.toLowerCase()
                            }`
                          }
                        >
                          {result.risk_level}
                        </span>

                        <span className="probability">

                          {(
                            result.fraud_probability *
                            100
                          ).toFixed(1)}%

                          {" "}fraud probability

                        </span>

                      </div>


                      <div className="progress">

                        <div
                          className={
                            `progress-fill ${
                              result.risk_level.toLowerCase()
                            }`
                          }
                          style={{
                            width:
                              `${result.risk_score}%`
                          }}
                        ></div>

                      </div>


                      <div className="action-box">

                        <div className="action-label">
                          RECOMMENDED ACTION
                        </div>

                        <div className="action-value">
                          {result.recommended_action.replaceAll(
                            "_",
                            " "
                          )}
                        </div>

                      </div>

                    </div>

                  )}

                </div>


                {/* AI ANALYST */}

                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <div className="section-kicker">
                        INTELLIGENCE ENGINE
                      </div>

                      <h2>
                        AI Risk Analyst
                      </h2>

                    </div>

                    <div className="ai-avatar">
                      AI
                    </div>

                  </div>


                  {!result ? (

                    <div className="analyst-empty">

                      <div className="analyst-icon">
                        ✦
                      </div>

                      <p>
                        RiskMind AI will explain
                        the detected risk signals
                        after analysis.
                      </p>

                    </div>

                  ) : (

                    <>

                      <div className="analyst-heading">
                        Risk interpretation
                      </div>


                      <div className="analyst-text">

                        This transaction is{" "}

                        <strong>
                          {result.risk_level}
                        </strong>

                        {" "}risk with a{" "}

                        <strong>
                          {result.risk_score}%
                        </strong>

                        {" "}risk score.

                      </div>


                      <div className="analyst-text">

                        Detected{" "}

                        <strong>
                          {result.reasons.length}
                        </strong>

                        {" "}risk signal(s):

                        {" "}
                        {result.reasons.join(
                          ", "
                        )}

                      </div>


                      <div className="recommendation">

                        <span>
                          Recommendation
                        </span>

                        <strong>
                          {result.recommended_action.replaceAll(
                            "_",
                            " "
                          )}
                        </strong>

                      </div>

                    </>

                  )}

                </div>

              </section>


              {/* RISK FACTORS + MODEL */}

              <section className="bottom-grid">


                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <div className="section-kicker">
                        EXPLAINABLE AI
                      </div>

                      <h2>
                        Risk Factors
                      </h2>

                    </div>

                  </div>


                  {!result ? (

                    <div className="no-factors">
                      Analyze a transaction to
                      display detected factors.
                    </div>

                  ) : (

                    <div className="factors">

                      {result.reasons.map(
                        (reason, index) => (

                          <div
                            className="factor"
                            key={index}
                          >

                            <div className="factor-number">
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </div>

                            <div className="factor-text">
                              {reason}
                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>


                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <div className="section-kicker">
                        MACHINE LEARNING
                      </div>

                      <h2>
                        Model Evaluation
                      </h2>

                    </div>

                    <div className="model-badge">
                      RF
                    </div>

                  </div>


                  <div className="metric-grid">

                    <div className="metric">

                      <span>
                        Accuracy
                      </span>

                      <strong>
                        100%
                      </strong>

                    </div>


                    <div className="metric">

                      <span>
                        Precision
                      </span>

                      <strong>
                        100%
                      </strong>

                    </div>


                    <div className="metric">

                      <span>
                        Recall
                      </span>

                      <strong>
                        100%
                      </strong>

                    </div>


                    <div className="metric">

                      <span>
                        F1 Score
                      </span>

                      <strong>
                        100%
                      </strong>

                    </div>

                  </div>

                </div>

              </section>


              {/* COPILOT */}

              <section className="panel copilot-panel">

                <div className="copilot-header">

                  <div className="copilot-avatar">
                    ✦
                  </div>

                  <div>

                    <div className="section-kicker">
                      RISK INTELLIGENCE COPILOT
                    </div>

                    <h2>
                      Ask RiskMind AI
                    </h2>

                  </div>

                </div>


                <div className="chat">

                  {messages.map(
                    (message, index) => (

                      <div
                        key={index}
                        className={
                          message.type ===
                          "user"
                            ? "chat-message chat-user"
                            : "chat-message"
                        }
                      >

                        {message.type ===
                          "bot" && (

                          <div className="bot-icon">
                            AI
                          </div>

                        )}

                        <div className="chat-bubble">
                          {message.text}
                        </div>

                      </div>

                    )
                  )}

                </div>


                <div className="chat-input">

                  <input
                    type="text"
                    placeholder="Ask: Why is this risky?"
                    value={chatInput}
                    onChange={(e) =>
                      setChatInput(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {

                      if (
                        e.key === "Enter"
                      ) {
                        sendMessage();
                      }

                    }}
                  />

                  <button
                    onClick={
                      sendMessage
                    }
                  >
                    →
                  </button>

                </div>

              </section>

            </>
          )}


          {/* =================================================
              TRANSACTIONS
          ================================================= */}

          {activePage === "Transactions" && (

            <section className="panel page-panel">

              <div className="panel-header">

                <div>

                  <div className="section-kicker">
                    TRANSACTION MONITOR
                  </div>

                  <h2>
                    Transaction History
                  </h2>

                </div>

                <div className="model-badge">
                  LIVE
                </div>

              </div>


              {history.length === 0 ? (

                <div className="empty-page">

                  <div className="empty-icon">
                    ◉
                  </div>

                  <h3>
                    No live transactions yet
                  </h3>

                  <p>
                    Analyze transactions from the
                    Dashboard and they will appear
                    here automatically.
                  </p>


                  <button
                    className="secondary-button"
                    onClick={() =>
                      setActivePage(
                        "Dashboard"
                      )
                    }
                  >
                    GO TO DASHBOARD →
                  </button>

                </div>

              ) : (

                <div className="table-wrap">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          TRANSACTION
                        </th>

                        <th>
                          AMOUNT
                        </th>

                        <th>
                          LOCATION
                        </th>

                        <th>
                          RISK
                        </th>

                        <th>
                          SCORE
                        </th>

                        <th>
                          ACTION
                        </th>

                        <th>
                          TIME
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {history.map(
                        (item) => (

                          <tr
                            key={item.id}
                          >

                            <td>

                              <strong>
                                {item.id}
                              </strong>

                              <span className="table-sub">
                                {item.deviceId}
                              </span>

                            </td>


                            <td>

                              ₹
                              {item.amount.toLocaleString()}

                            </td>


                            <td>
                              {item.location}
                            </td>


                            <td>

                              <span
                                className={
                                  `risk-tag ${
                                    item.level.toLowerCase()
                                  }`
                                }
                              >
                                {item.level}
                              </span>

                            </td>


                            <td>

                              <strong>
                                {item.score}%
                              </strong>

                            </td>


                            <td>
                              {item.action.replaceAll(
                                "_",
                                " "
                              )}
                            </td>


                            <td>
                              {item.time}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          )}


          {/* =================================================
              RISK INTELLIGENCE
          ================================================= */}

          {activePage ===
            "Risk Intelligence" && (

            <>

              <section className="intel-grid">


                <div className="intel-card">

                  <div className="intel-icon">
                    ◈
                  </div>

                  <span>
                    HIGH RISK DETECTIONS
                  </span>

                  <strong>
                    2,188
                  </strong>

                  <p>
                    Transactions classified with
                    elevated fraud indicators in
                    the current dataset.
                  </p>

                </div>


                <div className="intel-card">

                  <div className="intel-icon">
                    ⚡
                  </div>

                  <span>
                    DEVICE SIGNAL
                  </span>

                  <strong>
                    New Device
                  </strong>

                  <p>
                    An unfamiliar device can be
                    an important fraud-risk signal.
                  </p>

                </div>


                <div className="intel-card">

                  <div className="intel-icon">
                    ⌁
                  </div>

                  <span>
                    BEHAVIOR SIGNAL
                  </span>

                  <strong>
                    High Frequency
                  </strong>

                  <p>
                    Rapid repeated activity can
                    increase transaction risk.
                  </p>

                </div>

              </section>


              <section className="panel">

                <div className="panel-header">

                  <div>

                    <div className="section-kicker">
                      RISK DECISION ENGINE
                    </div>

                    <h2>
                      Risk Decision Framework
                    </h2>

                  </div>

                </div>


                <div className="decision-grid">


                  <div className="decision-card low">

                    <span>
                      SCORE 0 — 39
                    </span>

                    <strong>
                      LOW RISK
                    </strong>

                    <p>
                      Allow transaction
                    </p>

                  </div>


                  <div className="decision-card medium">

                    <span>
                      SCORE 40 — 69
                    </span>

                    <strong>
                      MEDIUM RISK
                    </strong>

                    <p>
                      Review transaction
                    </p>

                  </div>


                  <div className="decision-card high">

                    <span>
                      SCORE 70 — 100
                    </span>

                    <strong>
                      HIGH RISK
                    </strong>

                    <p>
                      Block transaction
                    </p>

                  </div>

                </div>

              </section>


              <section className="panel">

                <div className="panel-header">

                  <div>

                    <div className="section-kicker">
                      EXPLAINABLE AI
                    </div>

                    <h2>
                      Detection Signals
                    </h2>

                  </div>

                </div>


                <div className="signal-list">


                  <div className="signal-row">

                    <div>

                      <strong>
                        High transaction amount
                      </strong>

                      <span>
                        Amount threshold ≥ ₹10,000
                      </span>

                    </div>

                    <b>
                      +30
                    </b>

                  </div>


                  <div className="signal-row">

                    <div>

                      <strong>
                        High transaction frequency
                      </strong>

                      <span>
                        5 or more transactions
                        per hour
                      </span>

                    </div>

                    <b>
                      +25
                    </b>

                  </div>


                  <div className="signal-row">

                    <div>

                      <strong>
                        New device
                      </strong>

                      <span>
                        Unrecognized device
                      </span>

                    </div>

                    <b>
                      +20
                    </b>

                  </div>


                  <div className="signal-row">

                    <div>

                      <strong>
                        New location
                      </strong>

                      <span>
                        Unrecognized location
                      </span>

                    </div>

                    <b>
                      +15
                    </b>

                  </div>


                </div>

              </section>

            </>

          )}


          {/* =================================================
              MODEL EVALUATION
          ================================================= */}

          {activePage ===
            "Model Evaluation" && (

            <>

              <section className="stats-grid">


                <div className="stat-card">

                  <div className="stat-label">
                    ACCURACY
                  </div>

                  <div className="stat-value">
                    100%
                  </div>

                  <div className="stat-change positive">
                    Test dataset
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-label">
                    PRECISION
                  </div>

                  <div className="stat-value">
                    100%
                  </div>

                  <div className="stat-change positive">
                    Test dataset
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-label">
                    RECALL
                  </div>

                  <div className="stat-value">
                    100%
                  </div>

                  <div className="stat-change positive">
                    Test dataset
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-label">
                    F1 SCORE
                  </div>

                  <div className="stat-value">
                    100%
                  </div>

                  <div className="stat-change positive">
                    Test dataset
                  </div>

                </div>

              </section>


              <section className="model-evaluation-grid">


                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <div className="section-kicker">
                        CONFUSION MATRIX
                      </div>

                      <h2>
                        Test Set Results
                      </h2>

                    </div>

                    <div className="model-badge">
                      RF
                    </div>

                  </div>


                  <div className="matrix">

                    <div className="matrix-head">

                      <span></span>

                      <span>
                        Predicted 0
                      </span>

                      <span>
                        Predicted 1
                      </span>

                    </div>


                    <div className="matrix-row">

                      <strong>
                        Actual 0
                      </strong>

                      <div className="matrix-box good">

                        562

                        <span>
                          True Negative
                        </span>

                      </div>


                      <div className="matrix-box">

                        0

                        <span>
                          False Positive
                        </span>

                      </div>

                    </div>


                    <div className="matrix-row">

                      <strong>
                        Actual 1
                      </strong>


                      <div className="matrix-box">

                        0

                        <span>
                          False Negative
                        </span>

                      </div>


                      <div className="matrix-box good">

                        438

                        <span>
                          True Positive
                        </span>

                      </div>

                    </div>

                  </div>

                </div>


                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <div className="section-kicker">
                        MODEL INFORMATION
                      </div>

                      <h2>
                        Random Forest
                      </h2>

                    </div>

                  </div>


                  <div className="info-list">


                    <div>

                      <span>
                        Algorithm
                      </span>

                      <strong>
                        Random Forest Classifier
                      </strong>

                    </div>


                    <div>

                      <span>
                        Training Samples
                      </span>

                      <strong>
                        4,000
                      </strong>

                    </div>


                    <div>

                      <span>
                        Test Samples
                      </span>

                      <strong>
                        1,000
                      </strong>

                    </div>


                    <div>

                      <span>
                        False Positives
                      </span>

                      <strong>
                        0
                      </strong>

                    </div>


                    <div>

                      <span>
                        False Negatives
                      </span>

                      <strong>
                        0
                      </strong>

                    </div>


                  </div>

                </div>

              </section>

            </>

          )}


          {/* =================================================
              SETTINGS
          ================================================= */}

          {activePage === "Settings" && (

            <section className="settings-grid">


              <div className="panel">

                <div className="panel-header">

                  <div>

                    <div className="section-kicker">
                      SYSTEM CONFIGURATION
                    </div>

                    <h2>
                      RiskMind Settings
                    </h2>

                  </div>

                </div>


                <div className="settings-list">


                  <div className="setting-row">

                    <div>

                      <strong>
                        AI Risk Engine
                      </strong>

                      <span>
                        Random Forest transaction
                        risk detection engine
                      </span>

                    </div>

                    <span className="setting-status">
                      ONLINE
                    </span>

                  </div>


                  <div className="setting-row">

                    <div>

                      <strong>
                        API Endpoint
                      </strong>

                      <span>
                        {API_URL}
                      </span>

                    </div>

                    <span className="setting-status">
                      CONNECTED
                    </span>

                  </div>


                  <div className="setting-row">

                    <div>

                      <strong>
                        Automatic Blocking
                      </strong>

                      <span>
                        Enable automatic blocking
                        recommendations for high risk
                      </span>

                    </div>


                    <label className="switch">

                      <input
                        type="checkbox"
                        checked={autoBlock}
                        onChange={(e) =>
                          setAutoBlock(
                            e.target.checked
                          )
                        }
                      />

                      <span></span>

                    </label>

                  </div>


                  <div className="setting-row">

                    <div>

                      <strong>
                        Risk Notifications
                      </strong>

                      <span>
                        Show alerts for elevated-risk
                        transactions
                      </span>

                    </div>


                    <label className="switch">

                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) =>
                          setNotifications(
                            e.target.checked
                          )
                        }
                      />

                      <span></span>

                    </label>

                  </div>


                </div>

              </div>


              <div className="panel">

                <div className="panel-header">

                  <div>

                    <div className="section-kicker">
                      ACCOUNT
                    </div>

                    <h2>
                      Analyst Profile
                    </h2>

                  </div>

                </div>


                <div className="profile-large">

                  <div className="profile-avatar-large">
                    R
                  </div>

                  <div>

                    <strong>
                      Risk Analyst
                    </strong>

                    <span>
                      Administrator
                    </span>

                  </div>

                </div>


                <div className="account-item">

                  <span>
                    Role
                  </span>

                  <strong>
                    Fraud Risk Analyst
                  </strong>

                </div>


                <div className="account-item">

                  <span>
                    Model
                  </span>

                  <strong>
                    Random Forest v1.0
                  </strong>

                </div>


                <div className="account-item">

                  <span>
                    System
                  </span>

                  <strong className="online-text">
                    Operational
                  </strong>

                </div>

              </div>

            </section>

          )}


          <footer>
            RiskMind AI · AI-powered transaction risk intelligence
          </footer>

        </section>

      </main>

    </div>
  );
}


export default App;
