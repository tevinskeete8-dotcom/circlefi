import { useState } from "react";

type Member = {
  id: string;
  name: string;
  paid: boolean;
  reliability: number;
};

type Circle = {
  id: string;
  name: string;
  amount: number;
  members: Member[];
  currentRound: number;
};

export default function App() {
  const [screen, setScreen] = useState<"dashboard" | "circle">("dashboard");
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

  const [circles, setCircles] = useState<Circle[]>([
    {
      id: "1",
      name: "Familia Unida",
      amount: 300,
      currentRound: 1,
      members: [
        { id: "1", name: "You", paid: false, reliability: 80 },
        { id: "2", name: "Rosa", paid: true, reliability: 92 },
        { id: "3", name: "Luis", paid: false, reliability: 60 },
        { id: "4", name: "Ana", paid: true, reliability: 88 }
      ]
    }
  ]);

  const togglePaid = () => {
    if (!selectedCircle) return;

    const updatedCircles = circles.map(circle => {
      if (circle.id !== selectedCircle.id) return circle;

      const updatedMembers = circle.members.map(member => {
        if (member.name === "You") {
          const newPaid = !member.paid;
          return {
            ...member,
            paid: newPaid,
            reliability: newPaid
              ? Math.min(member.reliability + 5, 100)
              : Math.max(member.reliability - 10, 0)
          };
        }
        return member;
      });

      return { ...circle, members: updatedMembers };
    });

    setCircles(updatedCircles);
    setSelectedCircle(updatedCircles.find(c => c.id === selectedCircle.id) || null);
  };

  const totalPool = selectedCircle
    ? selectedCircle.amount * selectedCircle.members.length
    : 0;

  return (
    <div style={styles.app}>
      {screen === "dashboard" && (
        <div style={styles.container}>
          <h1 style={styles.title}>CircleFi</h1>
          <p style={styles.subtitle}>Escrow-protected savings circles</p>

          {circles.map(circle => (
            <div
              key={circle.id}
              style={styles.card}
              onClick={() => {
                setSelectedCircle(circle);
                setScreen("circle");
              }}
            >
              <h3>{circle.name}</h3>
              <p>${circle.amount} per member</p>
              <p>
                Pool: $
                {circle.amount * circle.members.length}
              </p>
            </div>
          ))}
        </div>
      )}

      {screen === "circle" && selectedCircle && (
        <div style={styles.container}>
          <button style={styles.back} onClick={() => setScreen("dashboard")}>
            ← Back
          </button>

          <h2>{selectedCircle.name}</h2>
          <p style={styles.pool}>
            Total Escrow Pool: ${totalPool}
          </p>

          <div style={styles.memberList}>
            {selectedCircle.members.map(member => (
              <div key={member.id} style={styles.member}>
                <div>
                  <strong>{member.name}</strong>
                  <div style={styles.reliability}>
                    Reliability: {member.reliability}%
                  </div>
                </div>

                <div>
                  {member.paid ? (
                    <span style={styles.paid}>Paid ✓</span>
                  ) : (
                    <span style={styles.unpaid}>Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button style={styles.payButton} onClick={togglePaid}>
            Toggle My Payment
          </button>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  app: {
    fontFamily: "system-ui, sans-serif",
    background: "#0D1B2A",
    minHeight: "100vh",
    color: "white"
  },
  container: {
    maxWidth: 420,
    margin: "0 auto",
    padding: 24
  },
  title: {
    fontSize: 32,
    fontWeight: 800
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 24
  },
  card: {
    background: "#132232",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    cursor: "pointer"
  },
  back: {
    background: "none",
    border: "none",
    color: "#02C39A",
    marginBottom: 12,
    cursor: "pointer"
  },
  pool: {
    fontSize: 20,
    marginBottom: 16
  },
  memberList: {
    marginBottom: 24
  },
  member: {
    display: "flex",
    justifyContent: "space-between",
    background: "#1A2E42",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },
  paid: {
    color: "#02C39A"
  },
  unpaid: {
    color: "#E76F51"
  },
  reliability: {
    fontSize: 12,
    opacity: 0.7
  },
  payButton: {
    width: "100%",
    padding: 14,
    background: "#028090",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer"
  }
};