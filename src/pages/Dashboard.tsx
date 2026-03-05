import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

type Circle = {
  id: string;
  name: string;
  contribution_amount: number;
  total_members: number;
};

// Cycle progress — placeholder until you add cycle dates to the DB
const MOCK_PROGRESS = [72, 45, 90, 33, 58, 80];
const COLORS = ["#6B3FA0", "#C9963A", "#7B5EA7", "#3D7EAA", "#C25F3B", "#2E8B57"];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Dashboard() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      // Get display name from email
      const email = session.user.email ?? "";
      setUserName(email.split("@")[0]);

      const { data } = await supabase
        .from("circles")
        .select("*")
        .eq("organizer_id", session.user.id);

      setCircles(data ?? []);
      setLoading(false);

      // Trigger stagger animation after data loads
      setTimeout(() => setVisible(true), 50);
    }

    fetchData();
  }, []);

  const totalPool = circles.reduce(
    (sum, c) => sum + c.contribution_amount * c.total_members,
    0
  );
  const totalMembers = circles.reduce((sum, c) => sum + c.total_members, 0);
  const avgContribution =
    circles.length > 0
      ? Math.round(circles.reduce((sum, c) => sum + c.contribution_amount, 0) / circles.length)
      : 0;

  const stats = [
    {
      label: "Active Circles",
      value: circles.length,
      sub: "circles you organise",
      icon: "◉",
      color: "#6B3FA0",
    },
    {
      label: "Total Pool",
      value: `$${totalPool.toLocaleString()}`,
      sub: "combined monthly value",
      icon: "⬡",
      color: "#C9963A",
    },
    {
      label: "Total Members",
      value: totalMembers,
      sub: "across all circles",
      icon: "◈",
      color: "#7B5EA7",
    },
    {
      label: "Avg Contribution",
      value: `$${avgContribution}`,
      sub: "per member per month",
      icon: "⟡",
      color: "#3D7EAA",
    },
  ];

  return (
    <div className={`dash ${visible ? "dash--visible" : ""}`}>

      {/* ── HEADER ── */}
      <header className="dash-header">
        <div className="dash-header-left">
          <p className="dash-eyebrow">Good to see you back</p>
          <h1 className="dash-title">
            {userName ? (
              <>Welcome, <em>{userName}</em></>
            ) : (
              "Your Dashboard"
            )}
          </h1>
        </div>
        <div className="dash-header-right">
          <Link to="/app/circles/new" className="dash-new-btn">
            + New Circle
          </Link>
        </div>
      </header>

      {/* ── STAT CARDS ── */}
      <section className="dash-stats">
        {stats.map((s, i) => (
          <div
            className="stat-card"
            key={s.label}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="stat-icon" style={{ color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-value" style={{ color: s.color }}>
              {loading ? <span className="skeleton skeleton--value" /> : s.value}
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
            <div className="stat-line" style={{ background: s.color }} />
          </div>
        ))}
      </section>

      {/* ── CIRCLES ── */}
      <section className="dash-circles">
        <div className="dash-section-header">
          <h2>Your Circles</h2>
          {circles.length > 0 && (
            <span className="dash-count">{circles.length} active</span>
          )}
        </div>

        {loading && (
          <div className="circles-grid">
            {[1, 2, 3].map((n) => (
              <div className="circle-card" key={n}>
                <div className="skeleton skeleton--title" />
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--bar" />
              </div>
            ))}
          </div>
        )}

        {!loading && circles.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">◉</div>
            <h3>No circles yet</h3>
            <p>Create your first savings circle and invite your community.</p>
            <Link to="/app/circles/new" className="dash-new-btn">
              Create a Circle
            </Link>
          </div>
        )}

        {!loading && circles.length > 0 && (
          <div className="circles-grid">
            {circles.map((circle, i) => {
              const progress = MOCK_PROGRESS[i % MOCK_PROGRESS.length];
              const color = COLORS[i % COLORS.length];
              const poolValue = circle.contribution_amount * circle.total_members;

              return (
                <div
                  className="circle-card"
                  key={circle.id}
                  style={{ animationDelay: `${0.32 + i * 0.1}s` }}
                >
                  {/* Card header */}
                  <div className="cc-head">
                    <div className="cc-avatar" style={{ background: color }}>
                      {getInitials(circle.name)}
                    </div>
                    <div className="cc-title-group">
                      <h3 className="cc-name">{circle.name}</h3>
                      <span className="cc-badge">Active</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="cc-stats">
                    <div className="cc-stat">
                      <span className="cc-stat-val">
                        ${circle.contribution_amount.toLocaleString()}
                      </span>
                      <span className="cc-stat-lbl">per member</span>
                    </div>
                    <div className="cc-divider" />
                    <div className="cc-stat">
                      <span className="cc-stat-val">{circle.total_members}</span>
                      <span className="cc-stat-lbl">members</span>
                    </div>
                    <div className="cc-divider" />
                    <div className="cc-stat">
                      <span className="cc-stat-val">
                        ${poolValue.toLocaleString()}
                      </span>
                      <span className="cc-stat-lbl">pool / mo</span>
                    </div>
                  </div>

                  {/* Cycle progress */}
                  <div className="cc-progress-section">
                    <div className="cc-progress-head">
                      <span className="cc-progress-label">Cycle progress</span>
                      <span className="cc-progress-pct" style={{ color }}>
                        {progress}%
                      </span>
                    </div>
                    <div className="cc-bar">
                      <div
                        className="cc-bar-fill"
                        style={{
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}99)`,
                          animationDelay: `${0.5 + i * 0.1}s`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="cc-actions">
                    <Link
                      to={`/app/circles/${circle.id}`}
                      className="cc-btn cc-btn--primary"
                      style={{ background: color }}
                    >
                      View Circle
                    </Link>
                    <button className="cc-btn cc-btn--ghost">Manage</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── PILOT NUDGE (from 90-day pilot doc) ── */}
      {!loading && circles.length > 0 && (
        <section className="pilot-banner">
          <div className="pilot-banner-left">
            <span className="pilot-icon">⬡</span>
            <div>
              <p className="pilot-title">Build your credit identity</p>
              <p className="pilot-sub">
                Every on-time contribution is tracked and builds your financial profile.
              </p>
            </div>
          </div>
          <Link to="/app/reputation" className="pilot-cta">
            View Reputation →
          </Link>
        </section>
      )}

    </div>
  );
}