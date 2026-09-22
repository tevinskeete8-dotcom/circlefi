import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
  organizer_id?: string;
  created_by?: string;
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
      const byId = byCode.data
        ? byCode
        : await supabase.from("circles").select("*").eq("id", token).maybeSingle();

      const found = (byId.data || byCode.data) as Circle | null;
      if (!found) {
        setStatus("error");
        setError("This invite is invalid or the circle was removed.");
        return;
      }
      setCircle(found);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setStatus("need-login");
        return;
      }
      setStatus("ready");
    })();
  }, [token]);

  async function join() {
    if (!circle) return;
    setStatus("joining");
    setError("");

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      setStatus("need-login");
      return;
    }

    const { error: insertError } = await supabase.from("circle_members").insert({
      circle_id: circle.id,
      user_id: user.id,
      role: "member",
      status: "active",
    });

    if (insertError && !String(insertError.message).toLowerCase().includes("duplicate")) {
      setStatus("ready");
      setError(insertError.message);
      return;
    }

    navigate(`/app/circles/${circle.id}`);
  }

  const amt = Number(circle?.contribution_amount ?? circle?.amount ?? 0);

  return (
    <div style={{ minHeight: "100vh", background: INK, color: "#F5F5F5", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440, background: CARD, border: `1px solid ${LINE}`, borderRadius: 24, padding: 28 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: TEAL, marginBottom: 18 }}>Pardna</div>

        {status === "loading" && <div style={{ color: MUTED }}>Opening invite…</div>}

        {status === "error" && (
          <>
            <h1 style={{ fontSize: 28, letterSpacing: "-0.03em", margin: "0 0 10px" }}>Invite not found</h1>
            <p style={{ color: MUTED }}>{error}</p>
            <Link to="/" style={{ color: TEAL }}>Go home</Link>
          </>
        )}

        {(status === "need-login" || status === "ready" || status === "joining") && circle && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>
              You’re invited
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 10px" }}>
              {circle.name || "A circle"}
            </h1>
            <p style={{ color: MUTED, lineHeight: 1.6, margin: "0 0 22px" }}>
              Planned amount {amt ? `$${amt.toLocaleString()} per person` : "set by the organizer"}.
              No money moves in this test. Joining puts your name on the roster.
            </p>

            {error && <div style={{ color: "#FF8A80", fontSize: 14, marginBottom: 14 }}>{error}</div>}

            {status === "need-login" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <Link to={`/login?next=/invite/${token}`} style={{ flex: 1, textAlign: "center", background: TEAL, color: INK, textDecoration: "none", padding: "12px 16px", borderRadius: 999, fontWeight: 800 }}>
                  Log in to join
                </Link>
                <Link to={`/signup?next=/invite/${token}`} style={{ flex: 1, textAlign: "center", color: "#fff", textDecoration: "none", padding: "12px 16px", borderRadius: 999, fontWeight: 700, border: `1px solid ${LINE}` }}>
                  Create account
                </Link>
              </div>
            ) : (
              <button
                onClick={join}
                disabled={status === "joining"}
                style={{ width: "100%", background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "12px 16px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}
              >
                {status === "joining" ? "Joining…" : "Join this circle"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}