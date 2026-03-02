import { useState } from "react";
import MainLayout from "../layout/MainLayout";

export default function Dashboard() {
  const [paid, setPaid] = useState(false);

  const contribution = 300;
  const members = 4;
  const pool = contribution * members;

  return (
    <MainLayout>
      <h1 style={{ marginBottom: 30 }}>Dashboard Overview</h1>

      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <div style={{ flex: 1, background: "#132232", padding: 24, borderRadius: 16 }}>
          <div style={{ opacity: 0.6 }}>Total Circle Pool</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>${pool}</div>
        </div>

        <div style={{ flex: 1, background: "#132232", padding: 24, borderRadius: 16 }}>
          <div style={{ opacity: 0.6 }}>Contribution</div>
          <div>${contribution} this round</div>
        </div>
      </div>

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
        {paid ? "Paid ✓" : "Mark Contribution as Paid"}
      </button>
    </MainLayout>
  );
}