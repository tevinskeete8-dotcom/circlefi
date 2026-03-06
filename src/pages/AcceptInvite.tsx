import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

type InviteData = {
  id: string;
  circle_id: string;
  invited_email: string;
  status: string;
  circles: {
    name: string;
    contribution_amount: number;
    total_members: number;
  };
};

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<any>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);

      const { data, error: err } = await supabase
        .from("circle_invitations")
        .select("*, circles(name, contribution_amount, total_members)")
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (err || !data) {
        setError("This invite link is invalid or has already been used.");
      } else {
        setInvite(data as InviteData);
      }
      setLoading(false);
    }
    load();
  }, [token]);

  const handleAccept = async () => {
    if (!invite || !session) return;
    setAccepting(true);
    setError("");

    // Add to circle_members
    const { error: memberErr } = await supabase
      .from("circle_members")
      .insert({ circle_id: invite.circle_id, user_id: session.user.id });

    if (memberErr && !memberErr.message.includes("duplicate")) {
      setError(memberErr.message);
      setAccepting(false);
      return;
    }

    // Mark invite as accepted
    await supabase
      .from("circle_invitations")
      .update({ status: "accepted", accepted_by: session.user.id })
      .eq("id", invite.id);

    setDone(true);
    setTimeout(() => navigate(`/app/circles/${invite.circle_id}`), 2000);
  };

  const C = {
    purple: "#6B3FA0", gold: "#C9963A", bg: "#F7F5FC",
    dark: "#1C1033", mid: "#5E4A7A",
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      <div style={{ color: C.mid }}>Loading invite...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 24, padding: "2.5rem", boxShadow: "0 8px 40px rgba(107,63,160,0.12)", border: "1px solid rgba(107,63,160,0.1)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          <svg width="32" height="32" viewBox="0 0 40 40">
            <defs>
              <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6B3FA0" />
                <stop offset="100%" stopColor="#C9963A" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="11" fill="url(#wg)" />
            <text x="19" y="28" textAnchor="middle" fill="#fff" fontSize="23" fontWeight="900" fontFamily="Georgia, serif">J</text>
            <circle cx="29" cy="11" r="5" fill="#00BFA5" />
            <circle cx="29" cy="11" r="2.5" fill="rgba(255,255,255,0.85)" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: C.dark }}>jouvay</span>
        </div>

        {error && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
            <h2 style={{ color: C.dark, marginBottom: "0.5rem" }}>Invalid Invite</h2>
            <p style={{ color: C.mid, marginBottom: "1.5rem" }}>{error}</p>
            <Link to="/" style={{ color: C.purple, fontWeight: 600 }}>Go home →</Link>
          </div>
        )}

        {done && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ color: C.dark, marginBottom: "0.5rem" }}>You're in!</h2>
            <p style={{ color: C.mid }}>Taking you to the circle now...</p>
          </div>
        )}

        {!error && !done && invite && (
          <>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${C.purple}, #8B4FC8)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", margin: "0 auto 1rem", color: "#fff", fontWeight: 800 }}>
                {invite.circles.name.slice(0, 2).toUpperCase()}
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark, marginBottom: "0.4rem" }}>
                You've been invited
              </h2>
              <p style={{ color: C.mid, fontSize: "0.95rem" }}>
                to join <strong style={{ color: C.purple }}>{invite.circles.name}</strong>
              </p>
            </div>

            <div style={{ background: "#F7F5FC", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", textAlign: "center" }}>
              <div>
                <div style={{ fontWeight: 800, color: C.purple, fontSize: "1.1rem" }}>${invite.circles.contribution_amount.toLocaleString()}</div>
                <div style={{ fontSize: "0.72rem", color: C.mid }}>per member</div>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: C.purple, fontSize: "1.1rem" }}>{invite.circles.total_members}</div>
                <div style={{ fontSize: "0.72rem", color: C.mid }}>members</div>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: C.purple, fontSize: "1.1rem" }}>${(invite.circles.contribution_amount * invite.circles.total_members).toLocaleString()}</div>
                <div style={{ fontSize: "0.72rem", color: C.mid }}>pool / mo</div>
              </div>
            </div>

            {!session ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: C.mid, fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                  You need a Jouvay account to accept this invite.
                </p>
                <Link
                  to={`/signup?invite=${token}`}
                  style={{ display: "block", width: "100%", padding: "0.875rem", background: `linear-gradient(135deg, ${C.purple}, #8B4FC8)`, color: "#fff", borderRadius: 100, fontWeight: 700, textDecoration: "none", textAlign: "center", marginBottom: "0.75rem" }}
                >
                  Create account & join →
                </Link>
                <Link
                  to={`/login?invite=${token}`}
                  style={{ display: "block", width: "100%", padding: "0.875rem", background: "#F0EAFA", color: C.purple, borderRadius: 100, fontWeight: 600, textDecoration: "none", textAlign: "center" }}
                >
                  Log in to accept
                </Link>
              </div>
            ) : (
              <>
                {error && <div style={{ color: "#EF4444", fontSize: "0.85rem", marginBottom: "1rem" }}>⚠ {error}</div>}
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  style={{ width: "100%", padding: "0.9rem", background: `linear-gradient(135deg, ${C.purple}, #8B4FC8)`, color: "#fff", border: "none", borderRadius: 100, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
                >
                  {accepting ? "Joining..." : "Accept & join circle →"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}