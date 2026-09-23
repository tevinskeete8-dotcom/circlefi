import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const CARD = "#141414";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

export default function Profile() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email || "");
      const { data } = await supabase.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle();
      setFirst(data?.first_name || "");
      setLast(data?.last_name || "");
    })();
  }, []);

  const field: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "#1A1A1A",
    border: "1px solid " + LINE,
    borderRadius: 12,
    padding: "12px 14px",
    color: "#fff",
    fontFamily: "inherit",
    marginBottom: 12,
  };

  async function saveName() {
    if (!userId) return;
    const { error } = await supabase.from("profiles").update({ first_name: first, last_name: last }).eq("id", userId);
    setMsg(error ? error.message : "Name saved.");
  }

  async function savePw() {
    if (pw.length < 8) { setMsg("Use 8 or more characters."); return; }
    if (pw !== pw2) { setMsg("Passwords do not match."); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    setMsg(error ? error.message : "Password updated.");
    setPw("");
    setPw2("");
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5", maxWidth: 640, margin: "0 auto" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>Account</div>
      <h1 style={{ margin: "0 0 22px", fontSize: "clamp(32px, 5vw, 44px)", letterSpacing: "-0.04em", color: "#fff" }}>
        Your <span style={{ color: TEAL }}>profile</span>
      </h1>

      {msg && (
        <div style={{ background: "#12352F", color: TEAL, borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>{msg}</div>
      )}

      <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 24, padding: 22, marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 4 }}>Display name</div>
        <div style={{ color: MUTED, fontSize: 13, marginBottom: 14 }}>Shown in your circles.</div>
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>First name</label>
        <input value={first} onChange={(e) => setFirst(e.target.value)} style={field} />
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Last name</label>
        <input value={last} onChange={(e) => setLast(e.target.value)} style={field} />
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Email</label>
        <input value={email} disabled style={{ ...field, opacity: 0.6 }} />
        <button onClick={saveName} style={{ background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "10px 16px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>
          Save changes
        </button>
      </div>

      <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 24, padding: 22 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 4 }}>Password</div>
        <div style={{ color: MUTED, fontSize: 13, marginBottom: 14 }}>At least 8 characters.</div>
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>New password</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} style={field} />
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Confirm password</label>
        <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} style={field} />
        <button onClick={savePw} style={{ background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "10px 16px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>
          Update password
        </button>
      </div>
    </div>
  );
}