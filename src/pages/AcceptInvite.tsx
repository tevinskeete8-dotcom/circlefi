import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Logo from "../components/Logo";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const CARD = "#141414";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

type Circle = {
  id: string;
  name?: string;
  contribution_amount?: number;
  amount?: number;
  invite_code?: string;
};

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [status, setStatus] = useState<"loading" | "need-login" | "ready" | "joining" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("This invite link is missing a code.");
      return;
    }
    (async () => {
      const byCode = await supabase.from("circles").select("*").eq("invite_code", token).maybeSingle();
      const byId = byCode.data ? byCode : await supabase.from("circles").select("*").eq("id", token).maybeSingle();
      const found = (byId.data || byCode.data) as Circle | null;
      if (!found) {
        setStatus("error");
        setError("This invite is invalid or the circle was removed.");
        return;
      }
      setCircle(found);
      const { data: auth } = await supabase.auth.getUser();
      setStatus(auth.user ? "ready" : "need-login");
    })();
  }, [token]);

  async function join() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user || !circle) return;
    setStatus("joining");
    const { error: err } = await supabase.from("circle_members").upsert({
      circle_id: circle.id,
      user_id: auth.user.id,
      status: "active",
      agreed_at: new Date().toISOString(),
    });
    if (err) {
      setError(err.message);
      setStatus("ready");
      return;
    }
    navigate("/app/circles/" + circle.id);
  }

  const amt = Number(circle?.contribution_amount ?? circle?.amount ?? 0);

  return (
    <div style={{ minHeight: "100vh", background: INK, color: "#fff", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ marginBottom: 24 }}><Logo to="/" /></div>
        <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 24, padding: 24 }}>
          {status === "loading" && <div style={{ color: MUTED }}>Loading invite…</div>}
          {status === "error" && <div style={{ color: "#FF8A80" }}>{error}</div>}
          {circle && status !== "loading" && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>Invite</div>
              <h1 style={{ margin: "0 0 10px", fontSize: 28 }}>{circle.name}</h1>
              <p style={{ color: MUTED, lineHeight: 1.6, margin: "0 0 22px" }}>
                Planned amount {amt ? "$" + amt.toLocaleString() + " per person" : "set by the organizer"}.
                No money moves in this build. Joining puts your name on the roster.
              </p>
              {error && <div style={{ color: "#FF8A80", fontSize: 14, marginBottom: 14 }}>{error}</div>}
              {status === "need-login" ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to={"/login?next=/invite/" + token} style={{ flex: 1, textAlign: "center", background: TEAL, color: INK, textDecoration: "none", padding: "12px 16px", borderRadius: 999, fontWeight: 800 }}>Log in to join</Link>
                  <Link to={"/signup?next=/invite/" + token} style={{ flex: 1, textAlign: "center", color: "#fff", textDecoration: "none", padding: "12px 16px", borderRadius: 999, fontWeight: 700, border: "1px solid " + LINE }}>Create account</Link>
                </div>
              ) : (
                <button onClick={join} disabled={status === "joining"} style={{ width: "100%", background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "12px 16px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>
                  {status === "joining" ? "Joining…" : "Join this circle"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}