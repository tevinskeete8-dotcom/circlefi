import { useState, useEffect } from "react";
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

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setEmail(session.user.email ?? "");
      setUserId(session.user.id);

      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setFirstName(data.first_name ?? "");
        setLastName(data.last_name ?? "");
      }
    }
    load();
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
      // Update localStorage key so dashboard picks up new name
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
    </div>
  );
}
