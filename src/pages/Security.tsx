import { Link } from "react-router-dom";

const TEAL = "#5EEAD4";
const CARD = "#141414";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

const rows = [
  {
    t: "Your login stays yours",
    d: "Only you can open this account. Use a password you do not reuse. Change it anytime on Profile.",
  },
  {
    t: "What other members see",
    d: "People in a circle see your name. They do not see your email, password, or anything from Profile.",
  },
  {
    t: "Circles are a promise, not a vault",
    d: "Marking paid keeps a date on your streak. Money does not leave your bank through Pardna today.",
  },
  {
    t: "When payouts go live",
    d: "Deposits will sit with a licensed partner, not in a personal account. We will name that partner here before the first dollar moves.",
  },
];

export default function Security() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>
        Account
      </div>
      <h1 style={{ margin: "0 0 8px", fontSize: "clamp(32px, 5vw, 44px)", letterSpacing: "-0.04em", color: "#fff" }}>
        Your <span style={{ color: TEAL }}>security</span>
      </h1>
      <p style={{ color: MUTED, lineHeight: 1.6, margin: "0 0 22px", maxWidth: 540 }}>
        Simple rules for this account. Short on purpose.
      </p>

      <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 24, padding: 22 }}>
        {rows.map((r) => (
          <div key={r.t} style={{ background: "#1A1A1A", borderRadius: 16, padding: "16px 18px", marginBottom: 10 }}>
            <div style={{ color: TEAL, fontWeight: 800, marginBottom: 6 }}>{r.t}</div>
            <div style={{ color: "#D0D0D0", lineHeight: 1.55 }}>{r.d}</div>
          </div>
        ))}
        <div style={{ color: MUTED, fontSize: 13, marginTop: 8 }}>
          Need to lock it down now? <Link to="/app/profile" style={{ color: TEAL }}>Update your password</Link>
        </div>
      </div>
    </div>
  );
}