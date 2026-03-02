import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ fontFamily: "system-ui", background: "#F9FAFB", color: "#111827" }}>

      {/* NAVBAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 60px",
          borderBottom: "1px solid #E5E7EB",
          background: "white"
        }}
      >
        <h2 style={{ margin: 0 }}>CircleFi</h2>

        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <span style={{ cursor: "pointer", opacity: 0.7 }}>How It Works</span>
          <span style={{ cursor: "pointer", opacity: 0.7 }}>Portable Reputation</span>
          <span style={{ cursor: "pointer", opacity: 0.7 }}>Security</span>

          <Link to="/app">
            <button
              style={{
                padding: "10px 18px",
                background: "#111827",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Launch App
            </button>
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: "100px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, maxWidth: 800 }}>
          Digitize your savings circle.
          <br />
          Turn trust into portable reputation.
        </h1>

        <p style={{ fontSize: 20, marginTop: 24, maxWidth: 650, opacity: 0.8 }}>
          CircleFi brings susu, tanda, and sou-sou communities online —
          securely. Every contribution builds a reputation you can use to
          unlock future financial services.
        </p>

        <div style={{ marginTop: 40 }}>
          <Link to="/app">
            <button
              style={{
                padding: "14px 28px",
                background: "#028090",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Get Started
            </button>
          </Link>
        </div>
      </div>

      {/* PROBLEM + SOLUTION */}
      <div style={{ padding: "80px 60px", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, marginBottom: 40 }}>
            Savings circles deserve financial infrastructure.
          </h2>

          <div style={{ display: "flex", gap: 60 }}>
            <div style={{ flex: 1 }}>
              <h4>Traditional ROSCAs rely on trust alone</h4>
              <p style={{ opacity: 0.7 }}>
                Cash-based savings groups are powerful — but vulnerable.
                Organizers can disappear. Records are informal.
                Reputation cannot be verified outside the circle.
              </p>
            </div>

            <div style={{ flex: 1 }}>
              <h4>CircleFi adds structure without removing community</h4>
              <p style={{ opacity: 0.7 }}>
                Escrow protection. Transparent rotation.
                Behavioral reputation tracking.
                A digital bridge to formal finance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PORTABLE REPUTATION */}
      <div style={{ padding: "80px 60px", background: "#F3F4F6" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>
            Portable Reputation
          </h2>

          <p style={{ maxWidth: 700, opacity: 0.8 }}>
            Every on-time contribution strengthens your financial standing.
            Your CircleFi reputation can unlock access to:
          </p>

          <ul style={{ marginTop: 30, lineHeight: 2 }}>
            <li>• Emergency cash advances</li>
            <li>• Business micro-loans</li>
            <li>• Rental verification letters</li>
            <li>• Future credit reporting partnerships</li>
          </ul>
        </div>
      </div>

      {/* SECURITY */}
      <div style={{ padding: "80px 60px", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>
            Built with security at the core
          </h2>

          <p style={{ opacity: 0.8, maxWidth: 700 }}>
            Funds are held in protected escrow accounts.
            No organizer can access pooled money.
            Every transaction is recorded and visible to members.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "100px 60px", background: "#111827", color: "white" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 36 }}>
            Start building reputation inside your circle.
          </h2>

          <div style={{ marginTop: 30 }}>
            <Link to="/app">
              <button
                style={{
                  padding: "14px 28px",
                  background: "#02C39A",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Launch CircleFi
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          padding: "30px 60px",
          borderTop: "1px solid #E5E7EB",
          fontSize: 14,
          opacity: 0.6
        }}
      >
        © 2026 CircleFi. Community-first financial infrastructure.
      </div>
    </div>
  );
}