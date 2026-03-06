import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import "../styles/reputation.css";

type Contribution = {
  id: string;
  circle_id: string;
  user_id: string;
  amount: number;
  paid: boolean;
  round_number: number;
  created_at: string;
};

type Circle = {
  id: string;
  name: string;
};

type Stats = {
  totalContributions: number;
  paidOnTime: number;
  missed: number;
  totalPaid: number;
  circlesJoined: number;
  onTimeRate: number;
  score: number;
};

const SCORE_TIERS = [
  { min: 90, label: "Excellent", color: "#1D4ED8", desc: "You are a top-tier circle member." },
  { min: 75, label: "Good",      color: "#2E8B57", desc: "Strong track record with room to grow." },
  { min: 60, label: "Fair",      color: "#D97706", desc: "Building your history — keep going." },
  { min: 0,  label: "New",       color: "#8A9BB5", desc: "No contribution history yet." },
];

function getTier(score: number) {
  return SCORE_TIERS.find((t) => score >= t.min) ?? SCORE_TIERS[SCORE_TIERS.length - 1];
}

function calcScore(s: Stats): number {
  if (s.totalContributions === 0) return 0;
  const onTimeScore  = s.onTimeRate * 70;
  const circleScore  = Math.min(s.circlesJoined / 3, 1) * 30;
  return Math.round(onTimeScore + circleScore);
}

const METRICS = [
  { icon: "⟡", label: "On-time Rate",       color: "#1D4ED8", key: "onTimeRate"         as keyof Stats, format: (v: number) => `${Math.round(v * 100)}%`,   desc: "Percentage of contributions paid on schedule." },
  { icon: "◈", label: "Total Paid",          color: "#D97706", key: "totalPaid"          as keyof Stats, format: (v: number) => `$${v.toLocaleString()}`,     desc: "Cumulative amount contributed across all circles." },
  { icon: "◉", label: "Circles Joined",      color: "#7B5EA7", key: "circlesJoined"      as keyof Stats, format: (v: number) => `${v}`,                       desc: "Number of savings circles you've participated in." },
  { icon: "⬡", label: "Contributions Made",  color: "#3D7EAA", key: "totalContributions" as keyof Stats, format: (v: number) => `${v}`,                       desc: "Total individual contribution rounds completed." },
];

const HOW_IT_WORKS = [
  { icon: "⟡", color: "#1D4ED8", title: "Pay on time",         desc: "Every on-schedule contribution raises your score. Missed payments lower it." },
  { icon: "◉", color: "#D97706", title: "Join more circles",   desc: "Participating in multiple circles demonstrates consistent community trust." },
  { icon: "◈", color: "#7B5EA7", title: "Complete full cycles", desc: "Finishing a full rotation without gaps gives the strongest signal to lenders." },
];

export default function Reputation() {
  const [stats, setStats]                   = useState<Stats | null>(null);
  const [recentContribs, setRecentContribs] = useState<(Contribution & { circle_name: string })[]>([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const uid = session.user.id;

      const [{ data: contribData }, { data: memberRows }, { data: organizedCircles }] =
        await Promise.all([
          supabase.from("contributions").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("circle_members").select("circle_id").eq("user_id", uid),
          supabase.from("circles").select("id, name").eq("organizer_id", uid),
        ]);

      const contribs: Contribution[] = contribData ?? [];

      const circleIds = new Set<string>([
        ...(memberRows ?? []).map((r: { circle_id: string }) => r.circle_id),
        ...(organizedCircles ?? []).map((c: Circle) => c.id),
      ]);

      const paid     = contribs.filter((c) => c.paid);
      const missed   = contribs.filter((c) => !c.paid);
      const onTimeRate = contribs.length > 0 ? paid.length / contribs.length : 0;
      const totalPaid  = paid.reduce((sum, c) => sum + c.amount, 0);

      const s: Stats = {
        totalContributions: contribs.length,
        paidOnTime: paid.length,
        missed: missed.length,
        totalPaid,
        circlesJoined: circleIds.size,
        onTimeRate,
        score: 0,
      };
      s.score = calcScore(s);
      setStats(s);

      // Build circle name map
      const circleMap = new Map<string, string>(
        (organizedCircles ?? []).map((c: Circle) => [c.id, c.name])
      );
      const unknownIds = [...new Set(contribs.map((c) => c.circle_id))].filter((id) => !circleMap.has(id));
      if (unknownIds.length > 0) {
        const { data: extra } = await supabase.from("circles").select("id, name").in("id", unknownIds);
        (extra ?? []).forEach((c: Circle) => circleMap.set(c.id, c.name));
      }

      setRecentContribs(
        contribs.slice(0, 8).map((c) => ({ ...c, circle_name: circleMap.get(c.circle_id) ?? "Unknown Circle" }))
      );
      setLoading(false);
    }

    fetchData();
  }, []);

  const hasData = (stats?.totalContributions ?? 0) > 0;
  const tier    = getTier(stats?.score ?? 0);
  const circumference = 2 * Math.PI * 50;

  return (
    <div className="rep-page">

      {/* Header */}
      <div className="rep-header">
        <p className="rep-eyebrow">Financial identity</p>
        <h1 className="rep-title">Reputation Score</h1>
      </div>

      {/* Score hero */}
      <div className="rep-hero">
        <div className="score-ring-wrap">
          <svg className="score-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke={loading ? "rgba(255,255,255,0.06)" : tier.color}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - (stats?.score ?? 0) / 100)}
              transform="rotate(-90 60 60)"
              className="score-arc"
            />
          </svg>
          <div className="score-inner">
            {loading
              ? <div className="skeleton skeleton--score" />
              : <>
                  <div className="score-number" style={{ color: tier.color }}>{stats?.score ?? 0}</div>
                  <div className="score-sub">/ 100</div>
                </>
            }
          </div>
        </div>

        <div className="rep-hero-info">
          <div className="rep-tier-badge" style={{ color: tier.color, borderColor: `${tier.color}44`, background: `${tier.color}12` }}>
            {tier.label}
          </div>
          <p className="rep-tier-desc">{tier.desc}</p>
          {!hasData && !loading && (
            <p className="rep-hint">
              Your score updates automatically as you make contributions to your circles.
            </p>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div className="rep-metrics">
        {METRICS.map((m, i) => (
          <div className="rep-metric-card" key={m.label} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="rep-metric-icon" style={{ color: m.color }}>{m.icon}</div>
            <div className="rep-metric-value" style={{ color: m.color }}>
              {loading
                ? <span className="skeleton skeleton--val" />
                : stats ? m.format(stats[m.key] as number) : "—"}
            </div>
            <div className="rep-metric-label">{m.label}</div>
            <div className="rep-metric-desc">{m.desc}</div>
            <div className="rep-metric-line" style={{ background: m.color }} />
          </div>
        ))}
      </div>

      {/* Contribution history */}
      <div className="rep-section">
        <div className="rep-section-head">
          <h2>Contribution History</h2>
          {hasData && <span className="rep-count">{stats?.totalContributions} total</span>}
        </div>

        {!loading && !hasData && (
          <div className="rep-empty">
            <div className="rep-empty-icon">◈</div>
            <h3>No contributions yet</h3>
            <p>Once you start contributing to a circle, every payment will appear here and build your financial reputation.</p>
            <Link to="/app/circles" className="rep-empty-btn">Go to your circles →</Link>
          </div>
        )}

        {!loading && hasData && (
          <div className="rep-activity">
            {recentContribs.map((c) => (
              <div className="rep-row" key={c.id}>
                <div className={`rep-dot ${c.paid ? "rep-dot--paid" : "rep-dot--missed"}`} />
                <div className="rep-row-info">
                  <p className="rep-row-circle">{c.circle_name}</p>
                  <p className="rep-row-meta">
                    Round {c.round_number} · {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="rep-row-right">
                  <span className="rep-row-amount">${c.amount.toLocaleString()}</span>
                  <span className={`rep-row-status ${c.paid ? "rep-row-status--paid" : "rep-row-status--missed"}`}>
                    {c.paid ? "Paid" : "Missed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How score is built */}
      <div className="rep-section">
        <div className="rep-section-head"><h2>How your score is built</h2></div>
        <div className="rep-how-grid">
          {HOW_IT_WORKS.map((h) => (
            <div className="rep-how-card" key={h.title}>
              <div className="rep-how-icon" style={{ color: h.color }}>{h.icon}</div>
              <h3>{h.title}</h3>
              <p>{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}