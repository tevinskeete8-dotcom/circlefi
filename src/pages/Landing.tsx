export default function Landing() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 40 }}>
      <h1 style={{ fontSize: 42, fontWeight: 800 }}>
        Build trust in your savings circle.
      </h1>

      <p style={{ fontSize: 20, marginTop: 20, maxWidth: 600 }}>
        Digitize your susu, tanda, or sou-sou safely.
        Every contribution builds a portable reputation
        you can use to unlock future financial services.
      </p>

      <button
        style={{
          marginTop: 30,
          padding: "14px 24px",
          background: "#028090",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        Get Started
      </button>
    </div>
  );
}
