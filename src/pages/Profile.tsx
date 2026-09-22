import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const WHITE = "#FFFFFF";
const MUTED = "#6F6F6F";
const LINE = "rgba(11,11,11,0.08)";
const PAPER = "#F3F3F1";

export default function Profile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingPw, setUpdatingPw] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return;
      setEmail(user.email || "");
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!data) return;
      setFirstName(data.first_name || data.full_name?.split(" ")[0] || "");
      setLastName(data.last_name || data.full_name?.split(" ").slice(1).join(" ") || "");
    })();
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      })
      .eq("id", auth.user.id);
    setSaving(false);
    if (error) setErr(error.message);
    else setMsg("Name saved.");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setUpdatingPw(true);
    const { error } = await supabase.auth.updateUser({ password });
    setUpdatingPw(false);
    if (error) setErr(error.message);
    else {
      setMsg("Password updated.");
      setPassword("");
      setConfirm("");
    }
  }

  const input = {
    width: "100%",
    background: PAPER,
    border: `1.5px solid ${LINE}`,
    borderRadius: 12,
    padding: "12px 14px",
    fontFamily: "inherit",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const card = {
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 20,
    padding: "22px 24px",
    marginBottom: 12,
  };

  const btn = {
    background: INK,
    color: "#fff",
    border: 0,
    borderRadius: 999,
    padding: "10px 16px",
    fontWeight: 800,
    fontFamily: "inherit",
    cursor: "pointer",
    marginTop: 12,
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 6 }}>
          Account
        </div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.035em" }}>
          Your Profile
        </h1>
      </div>

      {msg && (
        <div style={{ background: "#E6FAF7", color: INK, borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
          {msg}
        </div>
      )}
      {err && (
        <div style={{ background: "#FEECEC", color: "#B42318", borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 14 }}>
          {err}
        </div>
      )}

      <form onSubmit={saveName} style={card}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Display name</div>
        <div style={{ color: MUTED, fontSize: 14, marginBottom: 16 }}>Shown in your circles.</div>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>First name</label>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ ...input, marginBottom: 12 }} />
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>Last name</label>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ ...input, marginBottom: 12 }} />
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>Email</label>
        <input value={email} readOnly style={{ ...input, color: MUTED }} />
        <button type="submit" style={btn} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
      </form>

      <form onSubmit={savePassword} style={card}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Password</div>
        <div style={{ color: MUTED, fontSize: 14, marginBottom: 16 }}>At least 8 characters.</div>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>New password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...input, marginBottom: 12 }} />
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>Confirm password</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={input} />
        <button type="submit" style={btn} disabled={updatingPw}>{updatingPw ? "Updating…" : "Update password"}</button>
      </form>

      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Payout account</div>
        <div style={{ color: MUTED, fontSize: 14, marginBottom: 14 }}>
          Connected. Circle payouts can land here.
        </div>
        <button
          type="button"
          style={{ ...btn, background: "transparent", color: INK, border: `1.5px solid ${LINE}` }}
        >
          Update payout account
        </button>
      </div>
    </div>
  );
}