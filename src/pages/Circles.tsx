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
  total_members?: number;
  kind?: string;
  organizer_id?: string;
};

type Membership = {
  circle_id: string;
  status?: string;
};

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0] ? w[0].toUpperCase() : "").join("");
}

export default function Circles() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [tab, setTab] = useState<"all" | "organizing" | "member">("all");
  const [q, setQ] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data: memberships } = await supabase
        .from("circle_members")
        .select("circle_id, status")
        .eq("user_id", user.id);

      const leftIds = new Set(
        ((memberships as Membership[]) || [])
          .filter((m) => (m.status || "active") === "left")
          .map((m) => m.circle_id)
      );

      const liveIds = ((memberships as Membership[]) || [])
        .filter((m) => (m.status || "active") !== "left")
        .map((m) => m.circle_id);

      let rows: Circle[] = [];
      if (liveIds.length) {
        const { data } = await supabase
          .from("circles")
          .select("*")
          .in("id", liveIds)
          .order("created_at", { ascending: false });
        rows = (data as Circle[]) || [];
      }

      const { data: owned } = await supabase
        .from("circles")
        .select("*")
        .eq("organizer_id", user.id)
        .order("created_at", { ascending: false });

      const seen = new Set(rows.map((c) => c.id));
      for (const c of (owned as Circle[]) || []) {
        if (!seen.has(c.id) && !leftIds.has(c.id)) rows.push(c);
      }

      setCircles(
        rows.filter((c) => (c.status || "active").toLowerCase() !== "closed")
      );
      setLoading(false);
    })();
  }, []);

  const filtered = circles.filter((c) => {
    if (!(c.name || "").toLowerCase().includes(q.toLowerCase())) return false;
    if (tab === "organizing") return c.organizer_id === userId;
    if (tab === "member") return c.organizer_id !== userId;
    return true;
  });

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5", maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>
            Your savings groups
          </div>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em" }}>
            Your <span style={{ color: TEAL }}>circles</span>
          </h1>
        </div>
        <Link
          to="/app/circles/new"
          style={{ background: TEAL, color: INK, textDecoration: "none", padding: "10px 16px", borderRadius: 999, fontWeight: 800, fontSize: 14 }}
        >
          + New circle
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([
            ["all", "All (" + circles.length + ")"],
            ["organizing", "Organizing"],
            ["member", "Member"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: tab === id ? TEAL : "transparent",
                color: tab === id ? INK : "#fff",
                border: "1px solid " + (tab === id ? TEAL : LINE),
                borderRadius: 999,
                padding: "8px 14px",
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search circles..."
          style={{
            background: "#1A1A1A",
            border: "1px solid " + LINE,
            borderRadius: 999,
            padding: "8px 14px",
            color: "#fff",
            fontFamily: "inherit",
            minWidth: 180,
          }}
        />
      </div>

      {loading ? (
        <div style={{ color: MUTED }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: MUTED }}>No live circles.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {filtered.map((c) => {
            const amt = Number(c.contribution_amount ?? c.amount ?? 0);
            const seats = Number(c.total_members || 0);
            return (
              <div key={c.id} style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 20, padding: 18 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: TEAL, color: INK, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12 }}>
                    {initials(c.name || "C")}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800 }}>{c.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TEAL }}>
                      {c.status || "Active"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", background: "#1A1A1A", borderRadius: 12, marginBottom: 14, overflow: "hidden" }}>
                  <div style={{ flex: 1, textAlign: "center", padding: "10px 6px" }}>
                    <div style={{ fontWeight: 800 }}>{money(amt)}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>per member</div>
                  </div>
                  <div style={{ width: 1, background: LINE }} />
                  <div style={{ flex: 1, textAlign: "center", padding: "10px 6px" }}>
                    <div style={{ fontWeight: 800 }}>{seats || "-"}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>seats</div>
                  </div>
                  <div style={{ width: 1, background: LINE }} />
                  <div style={{ flex: 1, textAlign: "center", padding: "10px 6px" }}>
                    <div style={{ fontWeight: 800 }}>{money(amt * (seats || 1))}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>pool / mo</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    to={"/app/circles/" + c.id}
                    style={{ flex: 1, textAlign: "center", background: TEAL, color: INK, textDecoration: "none", padding: "9px 12px", borderRadius: 999, fontWeight: 800, fontSize: 13 }}
                  >
                    View
                  </Link>
                  <Link
                    to={"/app/circles/" + c.id}
                    style={{ flex: 1, textAlign: "center", color: "#fff", textDecoration: "none", padding: "9px 12px", borderRadius: 999, fontWeight: 700, fontSize: 13, border: "1px solid " + LINE }}
                  >
                    Manage
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}