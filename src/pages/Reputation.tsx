import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TEAL = "#5EEAD4";
const CARD = "#141414";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

export default function Reputation() {
  const [paid, setPaid] = useState(0);
  const [circles, setCircles] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) { setLoading(false); return; }

      const { data: ev } = await supabase.from("circle_events").select("id").eq("user_id", user.id).eq("kind", "paid");
      setPaid((ev || []).length);

      const { data: mem } = await supabase.from("circle_members").select("circle_id").eq("user_id", user.id);
      setCircles(new Set((mem || []).map((m: { circle_id: string }) => m.circle_id)).size);
      setLoading(false);
    })();
  }, []);

  const score = Math.min(100, 60 + paid * 5);

  const tiles = [
    { k: String(paid), l: "On-time marks", s: "Months you marked paid." },
    { k: String(circles), l: "Circles joined", s: "Live and closed." },
    { k: paid ? "100%" : "—", l: "On-time rate", s: "Late marks are not tracked yet." },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>Streak</div>
      <h1 style={{ margin: "0 0 22px", fontSize: "clamp(32px, 5vw, 44px)", letterSpacing: "-0.04em", color: "#fff" }}>
        Your <span style={{ color: TEAL }}>streak</span>
      </h1>

      <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 24, padding: 24, marginBottom: 14, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: TEAL, letterSpacing: "-0.06em", lineHeight: 1 }}>{loading ? "—" : score}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>{score >= 80 ? "On track" : "Building"}</div>
          <div style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, maxWidth: 420 }}>
            This is an in-app streak, not a credit score. Mark paid on the due date to raise it.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {tiles.map((t) => (
          <div key={t.l} style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 18, padding: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 28, color: "#fff" }}>{t.k}</div>
            <div style={{ fontWeight: 700, marginTop: 4, color: "#fff" }}>{t.l}</div>
            <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>{t.s}</div>
          </div>
        ))}
      </div>

      <p style={{ color: MUTED, marginTop: 20, fontSize: 14 }}>
        Finish a rotation to grow this. <Link to="/app/circles/new" style={{ color: TEAL }}>Open a circle</Link>
      </p>
    </div>
  );
}