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
  member_count?: number;
  pool?: number;
  created_at?: string;
  role?: string;
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}
function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function Circles() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [tab, setTab] = useState<"all" | "organizing" | "member">("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("circles").select("*").order("created_at", { ascending: false });
      setCircles((data as Circle[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = circles.filter((c) => {
    const nameOk = (c.name || "").toLowerCase().includes(q.toLowerCase());
    if (!nameOk) return false;
    if (tab === "organizing") return (c.role || "organizer") === "organizer";
    if (tab === "member") return c.role === "member";
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>
            Your savings groups
          </div>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>
            Your <span style={{ color: TEAL }}>circles</span>
          </h1>
        </div>
        <Link to="/onboarding" style={{ background: TEAL, color: INK, textDecoration: "none", padding: "10px 18px", borderRadius: 999, fontWeight: 800, fontSize: 14 }}>
          + New circle
        </Link>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {([
          ["all", `All (${circles.length})`],
          ["organizing", "Organizing"],
          ["member", "Member"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              border: 0, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
              padding: "8px 14px", borderRadius: 999,
              background: tab === id ? TEAL : CARD,
              color: tab === id ? INK : MUTED,
            }}
          >
            {label}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search circles…"
          style={{
            marginLeft: "auto", minWidth: 200, padding: "8px 14px", borderRadius: 999,
            border: `1px solid ${LINE}`, outline: "none", fontFamily: "inherit",
            background: CARD, color: "#fff",
          }}
        />
      </div>

      {loading ? (
        <div style={{ color: MUTED }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 48, textAlign: "center", color: MUTED }}>
          No circles in this view.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map((c) => {
            const amt = Number(c.contribution_amount ?? c.amount ?? 0);
            const members = Number(c.member_count ?? 0);
            const pool = Number(c.pool ?? amt * members);
            return (
              <div key={c.id} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, background: TEAL, color: INK,
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0,
                  }}>{initials(c.name || "C")}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>{c.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                      {c.status || "Active"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", background: "#1A1A1A", borderRadius: 12 }}>
                  <div style={{ flex: 1, textAlign: "center", padding: "10px 6px" }}>
                    <div style={{ fontWeight: 800, color: "#fff" }}>{money(amt)}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>per member</div>
                  </div>
                  <div style={{ width: 1, background: LINE }} />
                  <div style={{ flex: 1, textAlign: "center", padding: "10px 6px" }}>
                    <div style={{ fontWeight: 800, color: "#fff" }}>{members}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>members</div>
                  </div>
                  <div style={{ width: 1, background: LINE }} />
                  <div style={{ flex: 1, textAlign: "center", padding: "10px 6px" }}>
                    <div style={{ fontWeight: 800, color: "#fff" }}>{money(pool)}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>pool / mo</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to={`/app/circles/${c.id}`} style={{
                    flex: 1, textAlign: "center", background: TEAL, color: INK, textDecoration: "none",
                    padding: "9px 12px", borderRadius: 999, fontWeight: 800, fontSize: 13,
                  }}>View</Link>
                  <Link to={`/app/circles/${c.id}`} style={{
                    flex: 1, textAlign: "center", color: "#fff", textDecoration: "none",
                    padding: "9px 12px", borderRadius: 999, fontWeight: 700, fontSize: 13,
                    border: `1px solid ${LINE}`,
                  }}>Manage</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}