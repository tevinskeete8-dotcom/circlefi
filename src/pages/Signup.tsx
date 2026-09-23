import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Logo from "../components/Logo";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const CARD = "#141414";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

export default function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/onboarding";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (err) setError(err.message);
    else navigate(next);
  }

  const field: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", background: "#1A1A1A",
    border: "1px solid " + LINE, borderRadius: 12, padding: "12px 14px",
    color: "#fff", fontFamily: "inherit", marginBottom: 12,
  };

  return (
    <div style={{ minHeight: "100vh", background: INK, color: "#fff", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 28 }}><Logo to="/" /></div>
        <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 24, padding: 24 }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>Create account</h1>
          <p style={{ color: MUTED, margin: "0 0 20px" }}>Start a circle or join one you were invited to.</p>
          <form onSubmit={submit}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required style={field} />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8+ characters)" type="password" minLength={8} required style={field} />
            {error && <div style={{ color: "#FF8A80", fontSize: 14, marginBottom: 12 }}>{error}</div>}
            <button type="submit" disabled={busy} style={{ width: "100%", background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "12px 16px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
        </div>
        <p style={{ color: MUTED, marginTop: 16, fontSize: 14 }}>
          Already have one? <Link to={"/login" + (params.get("next") ? "?next=" + encodeURIComponent(next) : "")} style={{ color: TEAL }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}