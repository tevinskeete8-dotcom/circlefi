export default function Reputation() {
  const score = 72;
  const progress = (score / 100) * 100;

  return (
    <>
      <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
        Portable Reputation
      </h1>

      <p style={{ marginBottom: "40px", maxWidth: "750px", color: "#475569" }}>
        Your reputation grows with every verified contribution.
      </p>

      <div className="card">
        <h3>Reputation Score</h3>
        <p style={{ fontSize: "32px", fontWeight: "700" }}>{score}</p>

        <div style={{
          marginTop: "20px",
          height: "12px",
          background: "#e2e8f0",
          borderRadius: "6px",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${progress}%`,
            background: "#14b8a6",
            height: "100%"
          }} />
        </div>

        <p style={{ marginTop: "15px" }}>
          8 points away from Growth Tier
        </p>
      </div>
    </>
  );
}