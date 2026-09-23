import { Link } from "react-router-dom";

const TEAL = "#5EEAD4";
const CARD = "#141414";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

const rows = [
  {
    t: "Your session",
    d: "You sign in with Supabase Auth. Pages after login require a live session.",
  },
  {
    t: "Names on the roster",
    d: "Circles show first and last name from your profile. Email is not shown to other members.",
  },
  {
    t: "No bank password here",
    d: "Nothing on this build asks for a bank login. There is no Plaid connection live.",
  },
  {
    t: "No money held yet",
    d: "Mark paid only writes a row. Funds are not collected, escrowed, or FDIC-insured in this test.",
  },
];

export default function Security() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>Account</div>
      <h1 style={{ margin: "0 0 8px", fontSize: "clamp(32px, 5vw, 44px)", letterSpacing: "-0.04em", color: "#fff" }}>
        Your <span style={{ color: TEAL }}>security</span>
      </h1>
      <p style={{ color: MUTED, lineHeight: 1.6, margin: "0 0 22px", maxWidth: 560 }}>
        What is true in this build. When payments exist, this page will name the partner and the license. Not before.
      </p>

      <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 24, padding: 22 }}>
        {rows.map((r) => (
          <div key={r.t} style={{ background: "#1A1A1A", borderRadius: 16, padding: "16px 18px", marginBottom: 10 }}>
            <div style={{ color: TEAL, fontWeight: 800, marginBottom: 6 }}>{r.t}</div>
            <div style={{ color: "#D0D0D0", lineHeight: 1.55 }}>{r.d}</div>
          </div>
        ))}
        <div style={{ color: MUTED, fontSize: 13, marginTop: 8 }}>
          Change your password on <Link to="/app/profile" style={{ color: TEAL }}>Profile</Link>.
        </div>
      </div>
    </div>
  );
}