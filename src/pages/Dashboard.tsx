import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const CARD = "#141414";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

type Circle = {
  id: string;
  name: string;
  status?: string;
  contribution_amount?: number;
  amount?: number;
  kind?: string;
  due_day?: number;
  unlock_on?: string | null;
};

type Membership = { circle_id: string; status?: string };

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function ordinal(n: number) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return n + "th";
}
function prettyDate(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function monthKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-01";
}
function monthLabel() {
  return new Date().toLocaleDateString("en-US", { month: "long" });
}

export default function Dashboard() {
  const [firstName, setFirstName] = useState("there");
  const [circles, setCircles] = useState<Circle[]>([]);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase.from("profiles").select("first_name").eq("id", user.id).maybeSingle();
      setFirstName(profile?.first_name || user.email?.split("@")[0] || "there");

      const { data: memberships } = await supabase.from("circle_members").select("circle_id, status").eq("user_id", user.id);
      const leftIds = new Set(((memberships as Membership[]) || []).filter((m) => (m.status || "active") === "left").map((m) => m.circle_id));
      const liveIds = ((memberships as Membership[]) || []).filter((m) => (m.status || "active") !== "left").map((m) => m.circle_id);

      let rows: Circle[] = [];
      if (liveIds.length) {
        const { data } = await supabase.from("circles").select("*").in("id", liveIds).order("created_at", { ascending: false });
        rows = (data as Circle[]) || [];
      }
      const { data: owned } = await supabase.from("circles").select("*").eq("organizer_id", user.id);
      const seen = new Set(rows.map((c) => c.id));
      for (const c of (owned as Circle[]) || []) {
        if (!seen.has(c.id) && !leftIds.has(c.id)) rows.push(c);
      }
      const live = rows.filter((c) => (c.status || "active").toLowerCase() !== "closed");
      setCircles(live);

      if (live.length) {
        const { data: ev } = await supabase.from("circle_events").select("circle_id").eq("user_id", user.id).eq("kind", "paid").eq("period", monthKey()).in("circle_id", live.map((c) => c.id));
        setPaidIds(new Set((ev || []).map((e: { circle_id: string }) => e.circle_id)));
      }
      setLoading(false);
    })();
  }, []);

  const dueCount = circles.filter((c) => !paidIds.has(c.id)).length;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>Home</div>
          <h1 style={{ margin: 0, fontSize: "clamp(32px, 5vw, 44px)", letterSpacing: "-0.04em", color: "#fff" }}>Hi, {firstName}</h1>
        </div>
        <Link to="/app/circles/new" style={{ background: TEAL, color: INK, textDecoration: "none", padding: "10px 16px", borderRadius: 999, fontWeight: 800 }}>New</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 18, padding: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 28, color: "#fff" }}>{circles.length}</div>
          <div style={{ color: MUTED, fontSize: 13 }}>Live bills</div>
        </div>
        <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 18, padding: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 28, color: "#fff" }}>{dueCount}</div>
          <div style={{ color: MUTED, fontSize: 13 }}>Still due · {monthLabel()}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: MUTED }}>Loading...</div>
      ) : circles.length === 0 ? (
        <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 24, padding: 28 }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 8 }}>Nothing due yet</div>
          <div style={{ color: MUTED, lineHeight: 1.6, marginBottom: 16 }}>Start a circle or a personal bill.</div>
          <Link to="/app/circles/new" style={{ display: "inline-block", background: TEAL, color: INK, textDecoration: "none", padding: "10px 16px", borderRadius: 999, fontWeight: 800 }}>Start one</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {circles.map((c) => {
            const amt = Number(c.contribution_amount ?? c.amount ?? 0);
            const paid = paidIds.has(c.id);
            const solo = (c.kind || "group") === "solo";
            return (
              <Link key={c.id} to={"/app/circles/" + c.id} style={{ textDecoration: "none", color: "inherit", background: CARD, border: "1px solid " + LINE, borderRadius: 20, padding: "20px 22px", display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TEAL, marginBottom: 6 }}>
                      {solo ? "Personal" : "Circle"} · {paid ? "Paid" : "Due"}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 22, color: "#fff" }}>{c.name}</div>
                    <div style={{ color: MUTED, fontSize: 14, marginTop: 6 }}>
                      {money(amt)} on the {ordinal(Number(c.due_day || 1))}
                      {solo && c.unlock_on ? " · opens " + prettyDate(c.unlock_on) : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 26, color: TEAL }}>{money(amt)}</div>
                    <div style={{ fontSize: 13, color: paid ? TEAL : MUTED, marginTop: 4 }}>{paid ? "Set aside" : "Mark on the bill"}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 24, background: TEAL, color: INK, borderRadius: 24, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>On-time streak</div>
          <div style={{ fontSize: 13 }}>Months marked on time are stored. This does not change a credit score today.</div>
        </div>
        <Link to="/app/reputation" style={{ background: INK, color: "#fff", textDecoration: "none", padding: "10px 16px", borderRadius: 999, fontWeight: 800, fontSize: 14 }}>View streak</Link>
      </div>
    </div>
  );
}