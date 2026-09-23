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
  organizer_id?: string;
};

type Membership = {
  circle_id: string;
  status?: string;
};

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
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const [firstName, setFirstName] = useState("there");
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();

      setFirstName(profile?.first_name || user.email?.split("@")[0] || "there");

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

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5", maxWidth: 980 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>
            Home
          </div>
          <h1 style={{ margin: 0, fontSize: 36, letterSpacing: "-0.04em" }}>Hi, {firstName}</h1>
        </div>
        <Link
          to="/app/circles/new"
          style={{ background: TEAL, color: INK, textDecoration: "none", padding: "10px 16px", borderRadius: 999, fontWeight: 800, fontSize: 14 }}
        >
          New
        </Link>
      </div>

      {loading ? (
        <div style={{ color: MUTED }}>Loading...</div>
      ) : circles.length === 0 ? (
        <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 24, padding: 28 }}>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Nothing due yet</div>
          <div style={{ color: MUTED, lineHeight: 1.6, marginBottom: 16 }}>
            Start a circle with people, or set a personal bill that stays on until a date you choose.
          </div>
          <Link
            to="/app/circles/new"
            style={{ display: "inline-block", background: TEAL, color: INK, textDecoration: "none", padding: "10px 16px", borderRadius: 999, fontWeight: 800 }}
          >
            Start one
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {circles.map((c) => {
            const amt = Number(c.contribution_amount ?? c.amount ?? 0);
            const solo = (c.kind || "group") === "solo";
            return (
              <Link
                key={c.id}
                to={"/app/circles/" + c.id}
                style={{ textDecoration: "none", color: "inherit", background: CARD, border: "1px solid " + LINE, borderRadius: 20, padding: "18px 20px", display: "block" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TEAL, marginBottom: 6 }}>
                      {solo ? "Personal" : "Circle"}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 20 }}>{c.name}</div>
                    <div style={{ color: MUTED, fontSize: 13, marginTop: 6 }}>
                      {money(amt)} due the {ordinal(Number(c.due_day || 1))}
                      {solo && c.unlock_on ? " · opens " + prettyDate(c.unlock_on) : ""}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: TEAL }}>{money(amt)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 28, background: TEAL, color: INK, borderRadius: 24, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>On-time record</div>
          <div style={{ fontSize: 13 }}>Months marked on time are stored. This does not change a credit score today.</div>
        </div>
        <Link to="/app/reputation" style={{ background: INK, color: "#fff", textDecoration: "none", padding: "10px 16px", borderRadius: 999, fontWeight: 800, fontSize: 14 }}>
          View record
        </Link>
      </div>
    </div>
  );
}