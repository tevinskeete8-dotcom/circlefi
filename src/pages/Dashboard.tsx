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
    <div
      style={{
        minHeight: "100vh",
        background: "#0D1B2A",
        display: "flex",
        justifyContent: "center",
        paddingTop: 60,
        paddingBottom: 60,
        fontFamily: "system-ui"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 24,
          color: "white"
        }}
      >
        <h2 style={{ marginBottom: 6 }}>CircleFi</h2>
        <div style={{ opacity: 0.6, marginBottom: 30 }}>
          Community Savings · Portable Reputation
        </div>

        <div
          style={{
            background: "#1B263B",
            padding: 12,
            borderRadius: 10,
            marginBottom: 20,
            fontSize: 14
          }}
        >
          🔒 Funds are held in protected escrow. No organizer controls the pool.
        </div>

        <div
          style={{
            background: "#132232",
            padding: 20,
            borderRadius: 16,
            marginBottom: 20
          }}
        >
          <div style={{ opacity: 0.7 }}>Total Circle Pool</div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>${pool}</div>
          <div style={{ opacity: 0.6 }}>
            ${contribution} per member · {members} members
          </div>
        </div>

        <div
          style={{
            background: "#132232",
            padding: 20,
            borderRadius: 16,
            marginBottom: 20
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Next Payout
          </div>
          <div>Rosa receives ${pool} in 12 days</div>
          <div style={{ opacity: 0.6, marginTop: 6 }}>
            You receive in 2 rounds
          </div>
        </div>

        <div
          style={{
            background: "#132232",
            padding: 20,
            borderRadius: 16,
            marginBottom: 24
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Portable Reputation
          </div>

          <div style={{ fontSize: 26, fontWeight: 700 }}>
            {reputationScore} · {reputationTier}
          </div>

          <div style={{ opacity: 0.7, marginTop: 8 }}>
            {paid
              ? "3 on-time contributions · 0 missed payments"
              : "Make your contribution to improve your standing"}
          </div>

          <div style={{ opacity: 0.5, marginTop: 10, fontSize: 13 }}>
            This score can unlock future financial services.
          </div>
        </div>

        <button
          onClick={() => setPaid(true)}
          style={{
            width: "100%",
            padding: 16,
            background: "#02C39A",
            border: "none",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer"
          }}
        >
          Mark My Contribution as Paid
        </button>
      </div>
    </div>
  );
}