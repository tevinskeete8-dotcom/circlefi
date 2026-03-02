import { useState } from "react";

export default function Dashboard() {
  const [paid, setPaid] = useState(false);

  const contribution = 300;
  const members = 4;
  const pool = contribution * members;

  const reputationScore = paid ? 85 : 72;
  const reputationTier =
    reputationScore >= 85 ? "Silver Tier" : "Building Tier";

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui" }}>
      
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          background: "#111827",
          color: "white",
          padding: 24
        }}
      >
        <h2 style={{ marginBottom: 30 }}>CircleFi</h2>
        <div style={{ marginBottom: 12, opacity: 0.7 }}>Dashboard</div>
        <div style={{ marginBottom: 12, opacity: 0.7 }}>Reputation</div>
        <div style={{ marginBottom: 12, opacity: 0.7 }}>Circles</div>
        <div style={{ marginBottom: 12, opacity: 0.7 }}>Trust & Security</div>
        <div style={{ marginBottom: 12, opacity: 0.7 }}>Settings</div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          background: "#0D1B2A",
          padding: 40,
          color: "white"
        }}
      >
        <h1 style={{ marginBottom: 30 }}>Dashboard Overview</h1>

        {/* Top Row */}
        <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
          
          <div
            style={{
              flex: 1,
              background: "#132232",
              padding: 24,
              borderRadius: 16
            }}
          >
            <div style={{ opacity: 0.6 }}>Total Circle Pool</div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>${pool}</div>
          </div>

          <div
            style={{
              flex: 1,
              background: "#132232",
              padding: 24,
              borderRadius: 16
            }}
          >
            <div style={{ opacity: 0.6 }}>Next Payout</div>
            <div style={{ fontSize: 18 }}>
              Rosa receives ${pool}
            </div>
            <div style={{ opacity: 0.5 }}>In 12 days</div>
          </div>

          <div
            style={{
              flex: 1,
              background: "#132232",
              padding: 24,
              borderRadius: 16
            }}
          >
            <div style={{ opacity: 0.6 }}>Portable Reputation</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>
              {reputationScore}
            </div>
            <div style={{ opacity: 0.5 }}>{reputationTier}</div>
          </div>
        </div>

        {/* Escrow Section */}
        <div
          style={{
            background: "#1B263B",
            padding: 20,
            borderRadius: 12,
            marginBottom: 30
          }}
        >
          🔒 Funds are held in protected escrow.
          No organizer can access pooled funds.
        </div>

        {/* Contribution Section */}
        <div
          style={{
            background: "#132232",
            padding: 24,
            borderRadius: 16
          }}
        >
          <h3 style={{ marginBottom: 12 }}>Your Contribution</h3>
          <p style={{ opacity: 0.7 }}>
            ${contribution} due this round
          </p>

          <button
            onClick={() => setPaid(true)}
            style={{
              padding: "12px 20px",
              background: "#02C39A",
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Mark Contribution as Paid
          </button>
        </div>
      </div>
    </div>
  );
}