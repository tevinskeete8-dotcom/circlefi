import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PardnaLogo from "../components/PardnaLogo";
import PlaidLinkButton from "../components/PlaidLink";
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
  const [bankConnected, setBankConnected] = useState(false);
  const [checkingBank, setCheckingBank] = useState(false);

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

      // Check if user already has a bank connected
      if (s?.user) {
        setCheckingBank(true);
        const { data: conn } = await supabase
          .from("plaid_connections")
          .select("id")
          .eq("user_id", s.user.id)
          .single();
        setBankConnected(!!conn);
        setCheckingBank(false);
      }

      setLoading(false);
    }
    load();
  }, [token]);

  const handleAccept = async () => {
    if (!invite || !session) return;
    setAccepting(true);
    setError("");

    const { error: memberErr } = await supabase
      .from("circle_members")
      .insert({ circle_id: invite.circle_id, user_id: session.user.id });

    if (memberErr && !memberErr.message.includes("duplicate")) {
      setError(memberErr.message);
      setAccepting(false);
      return;
    }

    await supabase
      .from("circle_invitations")
      .update({ status: "accepted", accepted_by: session.user.id })
      .eq("id", invite.id);

    setDone(true);
    setTimeout(() => navigate(`/app/circles/${invite.circle_id}`), 2000);
  };

  const C = {
    primary: "#006FFF", gold: "#F59E0B", bg: "#F8FAFC",
    dark: "#0F172A", mid: "#475569",
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Noto Sans, sans-serif" }}>
      <div style={{ color: C.mid }}>Loading invite...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans', sans-serif", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 24, padding: "2.5rem", boxShadow: "0 8px 40px rgba(15,23,42,0.12)", border: "1px solid rgba(15,23,42,0.1)" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          <PardnaLogo size="md" />
        </div>

        {error && !invite && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
            <h2 style={{ color: C.dark, marginBottom: "0.5rem" }}>Invalid Invite</h2>
            <p style={{ color: C.mid, marginBottom: "1.5rem" }}>{error}</p>
            <Link to="/" style={{ color: C.primary, fontWeight: 600 }}>Go home →</Link>
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
            {/* Circle info */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", margin: "0 auto 1rem", color: "#fff", fontWeight: 800 }}>
                {invite.circles.name.slice(0, 2).toUpperCase()}
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark, marginBottom: "0.4rem" }}>
                You've been invited
              </h2>
              <p style={{ color: C.mid, fontSize: "0.95rem" }}>
                to join <strong style={{ color: C.primary }}>{invite.circles.name}</strong>
              </p>
            </div>

            {/* Circle stats */}
            <div style={{ background: "#F8FAFC", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", textAlign: "center" }}>
              <div>
                <div style={{ fontWeight: 800, color: C.primary, fontSize: "1.1rem" }}>${invite.circles.contribution_amount.toLocaleString()}</div>
                <div style={{ fontSize: "0.72rem", color: C.mid }}>per member</div>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: C.primary, fontSize: "1.1rem" }}>{invite.circles.total_members}</div>
                <div style={{ fontSize: "0.72rem", color: C.mid }}>members</div>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: C.primary, fontSize: "1.1rem" }}>${(invite.circles.contribution_amount * invite.circles.total_members).toLocaleString()}</div>
                <div style={{ fontSize: "0.72rem", color: C.mid }}>pool / mo</div>
              </div>
            </div>

            {!session ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: C.mid, fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                  You need a Pardna account to accept this invite.
                </p>
                <Link
                  to={`/signup?invite=${token}`}
                  style={{ display: "block", width: "100%", padding: "0.875rem", background: C.primary, color: "#fff", borderRadius: 100, fontWeight: 700, textDecoration: "none", textAlign: "center", marginBottom: "0.75rem" }}
                >
                  Create account & join →
                </Link>
                <Link
                  to={`/login?invite=${token}`}
                  style={{ display: "block", width: "100%", padding: "0.875rem", background: "#E6F0FF", color: C.primary, borderRadius: 100, fontWeight: 600, textDecoration: "none", textAlign: "center" }}
                >
                  Log in to accept
                </Link>
              </div>
            ) : checkingBank ? (
              <div style={{ textAlign: "center", color: C.mid, fontSize: "0.875rem", padding: "1rem 0" }}>
                Checking your account...
              </div>
            ) : !bankConnected ? (
              /* Step 1 — Connect bank */
              <div>
                <div style={{ background: "#E6F0FF", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🏦</span>
                  <div>
                    <p style={{ fontWeight: 700, color: C.dark, fontSize: "0.875rem", marginBottom: "0.2rem" }}>Bank account required</p>
                    <p style={{ color: C.mid, fontSize: "0.8rem", lineHeight: 1.5 }}>
                      Connect your bank so contributions can be pulled automatically on schedule. Your credentials are never stored by Pardna.
                    </p>
                  </div>
                </div>
                <PlaidLinkButton
                  label="Connect bank to continue"
                  onSuccess={() => setBankConnected(true)}
                  onError={(e) => setError(e)}
                  style={{
                    width: "100%", padding: "0.9rem", background: C.primary,
                    color: "#fff", border: "none", borderRadius: 100,
                    fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                  }}
                />
              </div>
            ) : (
              /* Step 2 — Join circle */
              <div>
                <div style={{ background: "#ECFDF5", borderRadius: 12, padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <span style={{ color: "#059669", fontSize: "1rem" }}>✓</span>
                  <p style={{ color: "#059669", fontSize: "0.82rem", fontWeight: 600, margin: 0 }}>Bank account connected</p>
                </div>
                {error && <div style={{ color: "#EF4444", fontSize: "0.85rem", marginBottom: "1rem" }}>⚠ {error}</div>}
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  style={{ width: "100%", padding: "0.9rem", background: C.primary, color: "#fff", border: "none", borderRadius: 100, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
                >
                  {accepting ? "Joining..." : "Accept & join circle →"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
