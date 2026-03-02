import { useState } from "react";

type Member = {
  id: string;
  name: string;
  paid: boolean;
};

export default function App() {
  const [paid, setPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const contribution = 300;
  const members: Member[] = [
    { id: "1", name: "You", paid },
    { id: "2", name: "Rosa", paid: true },
    { id: "3", name: "Luis", paid: false },
    { id: "4", name: "Ana", paid: true }
  ];

  const totalPool = contribution * members.length;
  const paidCount = members.filter(m => m.paid).length;
  const progress = (paidCount / members.length) * 100;

  const trustScore = paid ? 85 : 70;

  const trustLabel =
    trustScore >= 85
      ? "Excellent Standing"
      : trustScore >= 75
      ? "Good Standing"
      : "Needs Attention";

  return (
    <div style={styles.app}>
      <div style={styles.phone}>
        <h2 style={styles.greeting}>Good Evening 👋</h2>

        <div style={styles.poolCard}>
          <div style={styles.poolLabel}>Total Escrow Pool</div>
          <div style={styles.poolAmount}>${totalPool}</div>
          <div style={styles.poolSub}>
            ${contribution} per member · 4 members
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>This Round</div>
          <div style={styles.progressBarBackground}>
            <div
              style={{
                ...styles.progressBarFill,
                width: `${progress}%`
              }}
            />
          </div>
          <div style={styles.progressText}>
            {paidCount} of {members.length} members have contributed
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Your Trust Score</div>
          <div style={styles.trustBadge}>
            {trustScore} · {trustLabel}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Members</div>
          {members.map(member => (
            <div key={member.id} style={styles.memberRow}>
              <span>{member.name}</span>
              <span
                style={{
                  color: member.paid ? "#02C39A" : "#E76F51",
                  fontWeight: 600
                }}
              >
                {member.paid ? "Paid ✓" : "Waiting"}
              </span>
            </div>
          ))}
        </div>

        <button
          style={styles.payButton}
          onClick={() => setShowModal(true)}
        >
          Mark My Contribution as Paid
        </button>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Confirm Payment</h3>
            <p>You are contributing ${contribution} to this round.</p>
            <button
              style={styles.confirmButton}
              onClick={() => {
                setPaid(true);
                setShowModal(false);
              }}
            >
              Confirm Payment
            </button>
            <button
              style={styles.cancelButton}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  app: {
    background: "#0D1B2A",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "system-ui"
  },
  phone: {
    width: 390,
    maxWidth: "100%",
    padding: 20,
    color: "white"
  },
  greeting: {
    marginBottom: 20
  },
  poolCard: {
    background: "#132232",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20
  },
  poolLabel: {
    opacity: 0.7,
    fontSize: 14
  },
  poolAmount: {
    fontSize: 36,
    fontWeight: 800,
    margin: "8px 0"
  },
  poolSub: {
    opacity: 0.6
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 600
  },
  progressBarBackground: {
    height: 8,
    background: "#1A2E42",
    borderRadius: 4
  },
  progressBarFill: {
    height: 8,
    background: "#02C39A",
    borderRadius: 4
  },
  progressText: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.7
  },
  trustBadge: {
    background: "#028090",
    padding: "8px 12px",
    borderRadius: 20,
    display: "inline-block",
    fontWeight: 600
  },
  memberRow: {
    display: "flex",
    justifyContent: "space-between",
    background: "#1A2E42",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8
  },
  payButton: {
    width: "100%",
    padding: 14,
    background: "#02C39A",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    marginTop: 10,
    cursor: "pointer"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  modal: {
    background: "#132232",
    padding: 20,
    borderRadius: 16,
    width: 300,
    textAlign: "center"
  },
  confirmButton: {
    background: "#02C39A",
    border: "none",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    marginTop: 10
  },
  cancelButton: {
    background: "transparent",
    border: "1px solid #02C39A",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    marginTop: 8,
    color: "#02C39A"
  }
};