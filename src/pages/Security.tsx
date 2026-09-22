const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const WHITE = "#FFFFFF";
const MUTED = "#6F6F6F";
const LINE = "rgba(11,11,11,0.08)";

const pillars = [
  {
    t: "FDIC-protected escrow",
    d: "Pooled circle funds sit in custodial escrow accounts — not with Pardna, and not with any one member. Coverage follows applicable FDIC limits at the partner bank.",
  },
  {
    t: "Stripe infrastructure",
    d: "Payments move through Stripe Treasury / Unit. Pardna is a payments and escrow platform, not a bank and not a deposit-taking institution.",
  },
  {
    t: "Identity checks",
    d: "Members are verified before they join a circle. We follow KYC and AML requirements for the product as it operates today.",
  },
  {
    t: "Scheduled payouts",
    d: "The pot releases on the calendar the group agreed to. An organizer cannot hold or redirect a scheduled payout.",
  },
];

export default function Security() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 6 }}>
          Account and platform
        </div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.035em" }}>
          Your Security
        </h1>
      </div>

      <div style={{ background: INK, color: "#fff", borderRadius: 24, padding: "28px 26px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEAL, marginBottom: 10 }}>
          Circle escrow
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: TEAL }}>
          How circle funds are held
        </h2>
        <p style={{ margin: "0 0 22px", color: "#A3A3A3", lineHeight: 1.6, maxWidth: 640 }}>
          Pardna runs payments and escrow. It is not a bank. Funds stay with regulated partners until a payout date hits.
        </p>

        <div style={{ display: "grid", gap: 10 }}>
          {pillars.map((p) => (
            <div key={p.t} style={{ background: "#1A1A1A", borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ fontWeight: 800, color: TEAL, marginBottom: 6 }}>{p.t}</div>
              <div style={{ color: "#C8C8C8", fontSize: 14, lineHeight: 1.6 }}>{p.d}</div>
            </div>
          ))}
        </div>

        <p style={{ margin: "18px 0 0", color: "#8A8A8A", fontSize: 13, lineHeight: 1.6 }}>
          Pardna holds no deposits. Float yield on held balances, if any, is disclosed in the fee schedule.
        </p>
      </div>

      <div style={{ marginTop: 14, background: WHITE, border: `1px solid ${LINE}`, borderRadius: 18, padding: 20, color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
        Bank connections run through Plaid. We do not see your banking password.
      </div>
    </div>
  );
}