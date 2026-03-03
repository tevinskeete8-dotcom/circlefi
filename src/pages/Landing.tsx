export default function Landing() {
  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      padding: "120px 160px",
      background: "#f9fafb"
    }}>
      <h1 style={{
        fontSize: "64px",
        lineHeight: "1.1",
        marginBottom: "30px",
        maxWidth: "900px"
      }}>
        Digitize your savings circle.
        <br />
        Turn trust into portable reputation.
      </h1>

      <p style={{
        fontSize: "20px",
        maxWidth: "600px",
        marginBottom: "40px",
        color: "#475569"
      }}>
        CircleFi brings susu, tanda, and sou-sou communities online — securely.
        Every contribution builds financial credibility.
      </p>

      <a href="/login">
        <button className="primary-btn">
          Launch App
        </button>
      </a>
    </div>
  );
}