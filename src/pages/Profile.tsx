import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/security.css";

export default function Profile() {
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [email, setEmail]           = useState("");
  const [userId, setUserId]         = useState("");

  const [nameLoading, setNameLoading]   = useState(false);
  const [nameSuccess, setNameSuccess]   = useState(false);
  const [nameError, setNameError]       = useState("");

  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [pwLoading, setPwLoading]   = useState(false);
  const [pwSuccess, setPwSuccess]   = useState(false);
  const [pwError, setPwError]       = useState("");

  const [stripeConnected, setStripeConnected]   = useState(false);
  const [stripeLoading, setStripeLoading]       = useState(false);
  const [stripeError, setStripeError]           = useState("");
  const [stripeSuccess, setStripeSuccess]       = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setEmail(session.user.email ?? "");
      setUserId(session.user.id);

      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, stripe_account_id")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setFirstName(data.first_name ?? "");
        setLastName(data.last_name ?? "");
        setStripeConnected(!!data.stripe_account_id);
      }
    }
    load();

    // Handle return from Stripe onboarding
    const stripeParam = searchParams.get("stripe");
    if (stripeParam === "success") {
      setStripeSuccess(true);
      setStripeConnected(true);
      setSearchParams({});
    } else if (stripeParam === "refresh") {
      setStripeError("Onboarding expired. Please try again.");
      setSearchParams({});
    }
  }, []);

  const handleSaveName = async () => {
    setNameError(""); setNameSuccess(false);
    if (!firstName.trim()) { setNameError("First name is required."); return; }
    setNameLoading(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, first_name: firstName.trim(), last_name: lastName.trim() });

    if (error) { setNameError(error.message); }
    else {
      setNameSuccess(true);
      localStorage.setItem(`pardna_onboarded_${userId}`, "true");
    }
    setNameLoading(false);
  };

  const handleChangePassword = async () => {
    setPwError(""); setPwSuccess(false);
    if (!newPw || !confirmPw)   { setPwError("Please fill in both fields."); return; }
    if (newPw !== confirmPw)    { setPwError("Passwords do not match."); return; }
    if (newPw.length < 8)       { setPwError("Password must be at least 8 characters."); return; }
    setPwLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwError(error.message); }
    else       { setPwSuccess(true); setNewPw(""); setConfirmPw(""); }
    setPwLoading(false);
  };

  const handleStripeConnect = async () => {
    setStripeError(""); setStripeLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-onboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setStripeError(json.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStripeError("Something went wrong. Please try again.");
    }
    setStripeLoading(false);
  };

  return (
    <div className="sec-page">
      <div className="sec-header">
        <h1>Your Profile</h1>
        <p>Manage your display name, email, and password.</p>
      </div>

      {/* ── Display name ── */}
      <div className="sec-card">
        <div className="sec-card-head">
          <div className="sec-card-icon" style={{ color: "#1D4ED8" }}>◈</div>
          <div>
            <h3>Display Name</h3>
            <p>This is the name shown across your circles and to other members.</p>
          </div>
        </div>

        {nameError   && <div className="sec-alert sec-alert--error">⚠ {nameError}</div>}
        {nameSuccess && <div className="sec-alert sec-alert--success">✓ Name updated successfully.</div>}

        <div className="sec-fields">
          <div className="sec-row">
            <div className="sec-field">
              <label>First Name</label>
              <input
                className="sec-input"
                type="text"
                placeholder="e.g. Tevin"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="sec-field">
              <label>Last Name</label>
              <input
                className="sec-input"
                type="text"
                placeholder="e.g. Skeete"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="sec-field">
            <label>Email Address</label>
            <input
              className="sec-input"
              type="email"
              value={email}
              disabled
              style={{ opacity: 0.5, cursor: "not-allowed" }}
            />
          </div>
        </div>

        <button className="sec-btn" onClick={handleSaveName} disabled={nameLoading}>
          {nameLoading ? <span className="spinner" /> : "Save changes"}
        </button>
      </div>

      {/* ── Change password ── */}
      <div className="sec-card">
        <div className="sec-card-head">
          <div className="sec-card-icon" style={{ color: "#1D4ED8" }}>⟡</div>
          <div>
            <h3>Change Password</h3>
            <p>Update your account password. Use at least 8 characters.</p>
          </div>
        </div>

        {pwError   && <div className="sec-alert sec-alert--error">⚠ {pwError}</div>}
        {pwSuccess && <div className="sec-alert sec-alert--success">✓ Password updated successfully.</div>}

        <div className="sec-fields">
          <div className="sec-row">
            <div className="sec-field">
              <label>New Password</label>
              <input className="sec-input" type="password" placeholder="••••••••"
                value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            </div>
            <div className="sec-field">
              <label>Confirm New Password</label>
              <input className="sec-input" type="password" placeholder="••••••••"
                value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
            </div>
          </div>
        </div>

        <button className="sec-btn" onClick={handleChangePassword} disabled={pwLoading}>
          {pwLoading ? <span className="spinner" /> : "Update Password"}
        </button>
      </div>

      {/* ── Stripe Connect ── */}
      <div className="sec-card">
        <div className="sec-card-head">
          <div className="sec-card-icon" style={{ color: stripeConnected ? "#10B981" : "#1D4ED8" }}>
            {stripeConnected ? "✓" : "⬡"}
          </div>
          <div>
            <h3>Payout Account</h3>
            <p>
              {stripeConnected
                ? "Your payout account is connected. You can receive circle payouts."
                : "Connect a bank account to receive payouts when it's your turn in a circle."}
            </p>
          </div>
        </div>

        {stripeError   && <div className="sec-alert sec-alert--error">⚠ {stripeError}</div>}
        {stripeSuccess && <div className="sec-alert sec-alert--success">✓ Payout account connected successfully.</div>}

        {stripeConnected ? (
          <button
            className="sec-btn"
            onClick={handleStripeConnect}
            disabled={stripeLoading}
            style={{ background: "#F1F5F9", color: "#475569" }}
          >
            {stripeLoading ? <span className="spinner" /> : "Update payout account"}
          </button>
        ) : (
          <button className="sec-btn" onClick={handleStripeConnect} disabled={stripeLoading}>
            {stripeLoading ? <span className="spinner" /> : "Connect payout account"}
          </button>
        )}
      </div>
    </div>
  );
}
