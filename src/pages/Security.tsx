import { useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/security.css";

// ── Change Password ───────────────────────────────────────────────────
function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = async () => {
    setError(""); setSuccess(false);
    if (!next || !confirm) { setError("Please fill in all fields."); return; }
    if (next !== confirm)  { setError("New passwords do not match."); return; }
    if (next.length < 8)   { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: next });
    if (err) { setError(err.message); }
    else     { setSuccess(true); setCurrent(""); setNext(""); setConfirm(""); }
    setLoading(false);
  };

  return (
    <div className="sec-card">
      <div className="sec-card-head">
        <div className="sec-card-icon" style={{ color: "#1D4ED8" }}>⟡</div>
        <div>
          <h3>Change Password</h3>
          <p>Update your account password. Use at least 8 characters.</p>
        </div>
      </div>
      {error   && <div className="sec-alert sec-alert--error">⚠ {error}</div>}
      {success && <div className="sec-alert sec-alert--success">✓ Password updated successfully.</div>}
      <div className="sec-fields">
        <div className="sec-field">
          <label>Current Password</label>
          <input className="sec-input" type="password" placeholder="••••••••"
            value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="sec-row">
          <div className="sec-field">
            <label>New Password</label>
            <input className="sec-input" type="password" placeholder="••••••••"
              value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div className="sec-field">
            <label>Confirm New Password</label>
            <input className="sec-input" type="password" placeholder="••••••••"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
      </div>
      <button className="sec-btn" onClick={handleChange} disabled={loading}>
        {loading ? <span className="spinner" /> : "Update Password"}
      </button>
    </div>
  );
}

// ── KYC ──────────────────────────────────────────────────────────────
function KYCSection() {
  return (
    <div className="sec-card">
      <div className="sec-card-head">
        <div className="sec-card-icon" style={{ color: "#D97706" }}>◈</div>
        <div>
          <h3>Identity Verification (KYC)</h3>
          <p>Verify your identity to unlock full circle features and credit reporting.</p>
        </div>
      </div>
      <div className="kyc-status">
        <div className="kyc-dot" />
        <div>
          <p className="kyc-status-label">Verification Pending</p>
          <p className="kyc-status-sub">Required to participate in circles above $500/month.</p>
        </div>
        <span className="kyc-badge">Not Started</span>
      </div>
      <div className="kyc-steps">
        {[
          { n: "01", title: "Government ID",       desc: "Passport, driver's license, or state ID." },
          { n: "02", title: "Selfie Check",         desc: "A quick photo to match your ID." },
          { n: "03", title: "Address Confirmation", desc: "A recent utility bill or bank statement." },
        ].map((s) => (
          <div className="kyc-step" key={s.n}>
            <div className="kyc-step-num">{s.n}</div>
            <div>
              <p className="kyc-step-title">{s.title}</p>
              <p className="kyc-step-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="kyc-notice">
        🔐 Pardna follows all KYC/AML requirements. Your data is encrypted and never sold.
      </div>
      <button className="sec-btn sec-btn--gold" disabled>
        Start Verification — Coming Soon
      </button>
    </div>
  );
}

// ── Sessions ─────────────────────────────────────────────────────────
function SessionsSection() {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const handleSignOutAll = async () => {
    setLoading(true);
    await supabase.auth.signOut({ scope: "global" });
    setDone(true);
    setLoading(false);
  };

  return (
    <div className="sec-card">
      <div className="sec-card-head">
        <div className="sec-card-icon" style={{ color: "#7B5EA7" }}>◉</div>
        <div>
          <h3>Connected Sessions</h3>
          <p>Manage where you're logged in. Sign out all devices if you suspect unauthorized access.</p>
        </div>
      </div>
      {done && <div className="sec-alert sec-alert--success">✓ All other sessions have been signed out.</div>}
      <div className="session-list">
        <div className="session-row">
          <div className="session-device">💻</div>
          <div className="session-info">
            <p className="session-name">Current session</p>
            <p className="session-meta">Active now · This device</p>
          </div>
          <span className="session-badge">Active</span>
        </div>
      </div>
      <button className="sec-btn sec-btn--danger" onClick={handleSignOutAll} disabled={loading || done}>
        {loading ? <span className="spinner" /> : "Sign Out All Devices"}
      </button>
    </div>
  );
}

// ── Privacy ───────────────────────────────────────────────────────────
function PrivacySection() {
  const [prefs, setPrefs] = useState({
    creditReporting: true,
    activityVisible: true,
    marketingEmails: false,
  });
  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const items: { key: keyof typeof prefs; title: string; desc: string; color: string }[] = [
    { key: "creditReporting", color: "#1D4ED8", title: "Credit Reporting",        desc: "Share your contribution history with credit bureaus to build your financial profile." },
    { key: "activityVisible", color: "#D97706", title: "Circle Activity Visible", desc: "Allow other circle members to see your payment status in shared circles." },
    { key: "marketingEmails", color: "#7B5EA7", title: "Product Updates",         desc: "Receive emails about new Pardna features and community finance insights." },
  ];

  return (
    <div className="sec-card">
      <div className="sec-card-head">
        <div className="sec-card-icon" style={{ color: "#3D7EAA" }}>⬡</div>
        <div>
          <h3>Privacy & Data</h3>
          <p>Control how your data is used across the Pardna platform.</p>
        </div>
      </div>
      <div className="privacy-list">
        {items.map((item) => (
          <div className="privacy-row" key={item.key}>
            <div className="privacy-info">
              <p className="privacy-title">{item.title}</p>
              <p className="privacy-desc">{item.desc}</p>
            </div>
            <button
              className={`toggle ${prefs[item.key] ? "toggle--on" : ""}`}
              onClick={() => toggle(item.key)}
              style={{ "--toggle-color": item.color } as React.CSSProperties}
              aria-label={`Toggle ${item.title}`}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Escrow Protection Banner ──────────────────────────────────────────
function EscrowBanner() {
  const pillars = [
    {
      icon: "🏦", color: "#1D4ED8",
      title: "FDIC-Protected Escrow",
      desc:  "All pooled circle funds are held in custodial escrow accounts — not by Pardna or any individual member. Your money is FDIC-insured up to applicable limits.",
    },
    {
      icon: "⚡", color: "#D97706",
      title: "Stripe Treasury Infrastructure",
      desc:  "Payments are processed through Stripe Treasury and Unit — regulated payments infrastructure. Pardna operates as a payments + escrow platform, not a deposit-taking institution.",
    },
    {
      icon: "🔐", color: "#7B5EA7",
      title: "KYC / AML Compliant",
      desc:  "Every member is verified before joining a circle. We follow all Know Your Customer and Anti-Money Laundering requirements without exception.",
    },
    {
      icon: "🔄", color: "#3D7EAA",
      title: "Automated Payout Rotation",
      desc:  "Payouts are released automatically by the escrow engine on schedule — no organizer can access or withhold the pool. The rotation is enforced by the platform, not by trust alone.",
    },
  ];

  return (
    <div className="escrow-banner">
      <div className="escrow-banner-head">
        <div className="escrow-head-icon">⬡</div>
        <div>
          <p className="escrow-eyebrow">Circle Escrow Protection</p>
          <h2>How we protect your circle funds</h2>
          <p className="escrow-sub">
            Pardna is structured as payments + escrow infrastructure — not a bank.
            This gives us a defensible regulatory position and means your funds are
            protected at every step of the rotation cycle.
          </p>
        </div>
      </div>
      <div className="escrow-pillars">
        {pillars.map((p) => (
          <div className="escrow-pillar" key={p.title}>
            <div className="escrow-pillar-icon">{p.icon}</div>
            <h4 style={{ color: p.color }}>{p.title}</h4>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
      <div className="escrow-footnote">
        <span>🛡</span>
        <span>
          Pardna holds no deposits and is not a bank. Funds are held in escrow by our
          regulated infrastructure partners until scheduled disbursement. Float yield
          earned on held balances is disclosed in our fee schedule.
        </span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function Security() {
  return (
    <div className="sec-page">
      <div className="sec-header">
        <p className="sec-eyebrow">Account & platform</p>
        <h1 className="sec-title">Security</h1>
      </div>
      <EscrowBanner />
      <ChangePassword />
      <KYCSection />
      <SessionsSection />
      <PrivacySection />
    </div>
  );
}