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
  organizer_id?: string;
  created_by?: string;
};

type Row = {
  id?: string;
  user_id?: string;
  name: string;
  tag: string;
};

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

export default function CircleDetail() {
  const { id } = useParams();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [people, setPeople] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("circles").select("*").eq("id", id).maybeSingle();
      const c = (data as Circle) || null;
      setCircle(c);

      const { data: memberRows } = await supabase
        .from("circle_members")
        .select("*")
        .eq("circle_id", id);

      const rows = (memberRows || []) as { id?: string; user_id?: string }[];
      const ids = rows.map((r) => r.user_id).filter(Boolean) as string[];

      let names: Record<string, string> = {};
      if (ids.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", ids);
        for (const p of profiles || []) {
          const label = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
          names[p.id] = label || "Member";
        }
      }

      const organizer = c?.organizer_id || c?.created_by;
      const listed = rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        name: (r.user_id && names[r.user_id]) || "Member",
        tag: r.user_id && organizer && r.user_id === organizer ? "Organizer" : "Member",
      }));

      setPeople(listed);
      setLoading(false);
    })();
  }, [id]);

  const amt = Number(circle?.contribution_amount ?? circle?.amount ?? 0);
  const count = Math.max(Number(circle?.member_count ?? 0), people.length);
  const pool = Number(circle?.pool ?? amt * count);
  const progress = Math.min(100, Math.max(0, Number(circle?.progress ?? 0)));
  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${circle?.invite_code || circle?.id || ""}`;
  const inviteText = `Join ${circle?.name || "my Pardna circle"}. Planned amount ${amt ? `$${amt}` : "TBD"} per person. No money moves until we say so.\n${inviteUrl}`;

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({ title: circle?.name || "Pardna", text: inviteText, url: inviteUrl });
        setMsg("Share sheet opened.");
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setMsg("Share link copied.");
    } catch {
      setMsg(inviteUrl);
    }
  }

  function sendInvites(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    if (!cleanEmail && !cleanPhone) {
      setMsg("Add an email or a phone number.");
      return;
    }
    if (cleanEmail) {
      window.location.href = `mailto:${encodeURIComponent(cleanEmail)}?subject=${encodeURIComponent(
        `Join ${circle?.name || "my Pardna circle"}`
      )}&body=${encodeURIComponent(inviteText)}`;
    }
    if (cleanPhone) {
      window.setTimeout(() => {
        window.location.href = `sms:${cleanPhone}?&body=${encodeURIComponent(inviteText)}`;
      }, cleanEmail ? 400 : 0);
    }
    setMsg("Opening Mail or Messages with the invite filled in.");
    setInviteOpen(false);
    setEmail("");
    setPhone("");
  }

  if (loading) return <div style={{ color: MUTED }}>Loading circle…</div>;
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
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setInviteOpen(true)} style={{ background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "10px 18px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>
            Invite
          </button>
          <button onClick={shareLink} title="Share link" style={{ width: 42, height: 42, borderRadius: 999, border: `1px solid ${LINE}`, background: CARD, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShareIcon />
          </button>
        </div>
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

      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 14, color: "#fff" }}>People in this circle</div>
        {people.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 14 }}>No one on the roster yet.</div>
        ) : (
          people.map((m, i) => (
            <div key={m.id || m.user_id || i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${LINE}`,
            }}>
              <span style={{ color: "#fff", fontWeight: 600 }}>{m.name}</span>
              <span style={{ color: TEAL, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>{m.tag}</span>
            </div>
          ))
        )}
      </div>

      {inviteOpen && (
        <div onClick={() => setInviteOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 80 }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={sendInvites} style={{ width: "100%", maxWidth: 420, background: CARD, border: `1px solid ${LINE}`, borderRadius: 24, padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>Invite</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 24, letterSpacing: "-0.03em" }}>Add someone you trust</h2>
            <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.55, margin: "0 0 18px" }}>
              Email or text opens on your device with the circle link already written.
            </p>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="friend@email.com" style={{ width: "100%", boxSizing: "border-box", background: "#1A1A1A", border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 14px", color: "#fff", fontFamily: "inherit", marginBottom: 12 }} />
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="2015550100" style={{ width: "100%", boxSizing: "border-box", background: "#1A1A1A", border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 14px", color: "#fff", fontFamily: "inherit", marginBottom: 18 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ flex: 1, background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "12px 16px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>Send invite</button>
              <button type="button" onClick={() => setInviteOpen(false)} style={{ background: "transparent", color: MUTED, border: `1px solid ${LINE}`, borderRadius: 999, padding: "12px 16px", fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}