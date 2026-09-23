import { Link } from "react-router-dom";
import Logo from "../components/PardnaLogo";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: INK, color: "#fff", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, padding: "0 clamp(1.1rem, 4vw, 2.5rem)",
        background: "rgba(11,11,11,0.86)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid " + LINE,
      }}>
        <Logo to="/" />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/login" style={{ color: MUTED, textDecoration: "none", fontWeight: 600 }}>Log in</Link>
          <Link to="/signup" style={{ background: TEAL, color: INK, textDecoration: "none", padding: "8px 14px", borderRadius: 999, fontWeight: 800 }}>Get started</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "72px 24px 80px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>Pooled savings</div>
        <h1 style={{ margin: "0 0 16px", fontSize: "clamp(40px, 7vw, 64px)", letterSpacing: "-0.05em", lineHeight: 1.05 }}>
          Treat savings like a <span style={{ color: TEAL }}>bill</span>
        </h1>
        <p style={{ color: MUTED, fontSize: 18, lineHeight: 1.6, maxWidth: 520, margin: "0 0 28px" }}>
          Start a personal hold or a circle with people you already know. Mark the due date. Build a streak. Money does not move through Pardna yet.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/signup" style={{ background: TEAL, color: INK, textDecoration: "none", padding: "12px 18px", borderRadius: 999, fontWeight: 800 }}>Create account</Link>
          <Link to="/login" style={{ color: "#fff", textDecoration: "none", padding: "12px 18px", borderRadius: 999, fontWeight: 700, border: "1px solid " + LINE }}>Log in</Link>
        </div>
      </main>
    </div>
  );
}