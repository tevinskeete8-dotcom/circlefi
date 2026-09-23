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
  due_day?: number;
  kind?: string;
  status?: string;
};

function ordinal(n: number) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [status, setStatus] = useState<"loading" | "need-login" | "ready" | "joining" | "error">("loading");
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

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
      if ((found.status || "active").toLowerCase() === "closed") {
        setStatus("error");
        setError("This circle has ended.");
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
    if (!circle || !agreed) return;
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
      status: "active",
      agreed_at: new Date().toISOString(),
    });

    if (insertError && !String(insertError.message).toLowerCase().includes("duplicate")) {
      setStatus("ready");
      setError(insertError.message);
      return;
    }

    await supabase.from("circle_events").insert({
      circle_id: circle.id,
      user_id: user.id,
      kind: "joined",
    });

    navigate(`/app/circles/${circle.id}`);
  }

  const amt = Number(circle?.contribution_amount ?? circle?.amount ?? 0);
  const due = Number(circle?.due_day || 1);

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
            <p style={{ color: MUTED, lineHeight: 1.6, margin: "0 0 18px" }}>
              {amt ? `$${amt.toLocaleString()} due the ${ordinal(due)}.` : "Amount set by the organizer."}{" "}
              No money moves in this test. Joining puts your name on the roster.
            </p>

            <div style={{ background: "#1A1A1A", border: `1px solid ${LINE}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Before you join</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: MUTED, lineHeight: 1.6, fontSize: 14 }}>
                <li>Same amount, same day, until every seat has had a turn.</li>
                <li>If you get paid before the end, you still owe the remaining months.</li>
                <li>Leaving early does not wipe what you owe.</li>
              </ul>
            </div>

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
              <>
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14, fontSize: 14, lineHeight: 1.5, cursor: "pointer" }}>
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3 }} />
                  <span>I agree to stay on the bill until the circle ends, including after my payout.</span>
                </label>
                <button
                  onClick={join}
                  disabled={status === "joining" || !agreed}
                  style={{
                    width: "100%",
                    background: agreed ? TEAL : "#333",
                    color: agreed ? INK : MUTED,
                    border: 0,
                    borderRadius: 999,
                    padding: "12px 16px",
                    fontWeight: 800,
                    fontFamily: "inherit",
                    cursor: agreed ? "pointer" : "not-allowed",
                  }}
                >
                  {status === "joining" ? "Joining…" : "Join this circle"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}