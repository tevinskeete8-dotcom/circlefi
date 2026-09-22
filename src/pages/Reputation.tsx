import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const WHITE = "#FFFFFF";
const MUTED = "#6F6F6F";
const LINE = "rgba(11,11,11,0.08)";

export default function Reputation() {
  const [score, setScore] = useState(80);
  const [onTime, setOnTime] = useState(100);
  const [totalPaid, setTotalPaid] = useState(500);
  const [circles, setCircles] = useState(1);
  const [rounds, setRounds] = useState(1);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("reputation_score, on_time_rate, total_paid, circles_joined, contributions_made")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (!data) return;
      if (data.reputation_score != null) setScore(Number(data.reputation_score));
      if (data.on_time_rate != null) setOnTime(Number(data.on_time_rate));
      if (data.total_paid != null) setTotalPaid(Number(data.total_paid));
      if (data.circles_joined != null) setCircles(Number(data.circles_joined));
      if (data.contributions_made != null) setRounds(Number(data.contributions_made));
    })();
  }, []);

  const label = score >= 85 ? "Strong" : score >= 70 ? "Good" : "Building";

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 6 }}>
          Building your record
        </div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.035em" }}>
          Your <span style={{ color: TEAL }}>Score</span>
        </h1>
      </div>

      <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 20, padding: 24, marginBottom: 12, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em", color: TEAL, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 13, color: MUTED }}>/ 100</div>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{label}</div>
          <div style={{ color: MUTED, fontSize: 14, maxWidth: 420 }}>
            This is your Pardna record. It does not change your credit score today. On-time rounds raise it.
          </div>
        </div>
      </div>

      {[
        { v: `${onTime}%`, l: "On-time rate", s: "Contributions paid on the scheduled date." },
        { v: `$${totalPaid.toLocaleString()}`, l: "Total paid", s: "Amount contributed across all circles." },
        { v: String(circles), l: "Circles joined", s: "Savings circles you have participated in." },
        { v: String(rounds), l: "Contributions made", s: "Individual contribution rounds completed." },
      ].map((m) => (
        <div key={m.l} style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 18, padding: "18px 20px", marginBottom: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: INK }}>{m.v}</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{m.l}</div>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{m.s}</div>
        </div>
      ))}

      <div style={{ marginTop: 16, color: MUTED, fontSize: 13 }}>
        Score grows when you pay on the date and finish a full rotation.{" "}
        <Link to="/circles" style={{ color: INK, fontWeight: 700 }}>Open a circle</Link>
      </div>
    </div>
  );
}