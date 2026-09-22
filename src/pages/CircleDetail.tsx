import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const CARD = "#141414";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

type Circle = {
  id: string;
  name?: string;
  status?: string;
  contribution_amount?: number;
  amount?: number;
  member_count?: number;
  pool?: number;
  progress?: number;
  invite_code?: string;
};

type Member = {
  id?: string;
  user_id?: string;
  name?: string;
  full_name?: string;
  role?: string;
  status?: string;
};

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function CircleDetail() {
  const { id } = useParams();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("circles").select("*").eq("id", id).maybeSingle();
      setCircle((data as Circle) || null);

      const { data: memberRows } = await supabase
        .from("circle_members")
        .select("*")
        .eq("circle_id", id);
      setMembers((memberRows as Member[]) || []);
      setLoading(false);
    })();
  }, [id]);

  const amt = Number(circle?.contribution_amount ?? circle?.amount ?? 0);
  const count = Number(circle?.member_count ?? members.length ?? 0);
  const pool = Number(circle?.pool ?? amt * count);
  const progress = Math.min(100, Math.max(0, Number(circle?.progress ?? 0)));
  const invite = `${window.location.origin}/invite/${circle?.invite_code || circle?.id || ""}`;

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(invite);
      setMsg("Invite link copied.");
    } catch {
      setMsg(invite);
    }
  }

  if (loading) {
    return <div style={{ color: MUTED }}>Loading circle…</div>;
  }

  if (!circle) {
    return (
      <div>
        <Link to="/app/circles" style={{ color: MUTED, textDecoration: "none" }}>← Back to circles</Link>
        <h1 style={{ color: "#fff", marginTop: 16 }}>Circle not found</h1>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5" }}>
      <Link to="/app/circles" style={{ color: MUTED, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
        ← Back to circles
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", margin: "18px 0 28px" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>
            {circle.status || "Active"}
          </div>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>
            {circle.name || "Circle"}
          </h1>
        </div>
        <button
          onClick={copyInvite}
          style={{ background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "10px 18px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}
        >
          Copy invite link
        </button>
      </div>

      {msg && (
        <div style={{ background: "#12352F", color: TEAL, borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 14 }}>
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { v: money(amt), l: "Per member" },
          { v: String(count), l: "Members" },
          { v: money(pool), l: "Pool / mo" },
          { v: `${progress}%`, l: "Cycle progress" },
        ].map((s) => (
          <div key={s.l} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 18, padding: "18px 16px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{s.v}</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
          <span style={{ color: MUTED }}>This cycle</span>
          <span style={{ color: TEAL, fontWeight: 700 }}>{progress}%</span>
        </div>
        <div style={{ height: 8, background: "#222", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: TEAL }} />
        </div>
      </div>

      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 14, color: "#fff" }}>People in this circle</div>
        {members.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 14 }}>
            No member list yet. Share the invite link so people can join.
          </div>
        ) : (
          members.map((m, i) => (
            <div key={m.id || m.user_id || i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${LINE}`,
            }}>
              <span style={{ color: "#fff", fontWeight: 600 }}>{m.full_name || m.name || "Member"}</span>
              <span style={{ color: TEAL, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                {m.role || m.status || "Member"}
              </span>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 16, background: INK, border: `1px solid ${LINE}`, borderRadius: 18, padding: 18, color: MUTED, fontSize: 13, lineHeight: 1.6 }}>
        Funds sit in escrow until a scheduled payout. This page is the live view of who is in the circle and what the pot is.
      </div>
    </div>
  );
}