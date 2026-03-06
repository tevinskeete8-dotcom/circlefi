import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import "../styles/circles.css";

type Circle = {
  id: string;
  name: string;
  organizer_id: string;
  contribution_amount: number;
  total_members: number;
  created_at: string;
};

type Tab = "all" | "organizing" | "member";

const COLORS = ["#1D4ED8", "#D97706", "#7B5EA7", "#3D7EAA", "#C25F3B", "#2E8B57"];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ── Create Circle Modal ──────────────────────────────────────────────
function CreateCircleModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [members, setMembers] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !amount || !members) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error: err } = await supabase.from("circles").insert({
      name: name.trim(),
      contribution_amount: Number(amount),
      total_members: Number(members),
      organizer_id: session.user.id,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      onCreated();
      onClose();
    }
  };

  const previewPool = name && amount && members
    ? Number(amount) * Number(members)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create a New Circle</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">⚠ {error}</div>}

        <div className="modal-fields">
          <div className="modal-field">
            <label>Circle Name</label>
            <input
              className="modal-input"
              placeholder="e.g. Family Savings Circle"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label>Monthly Contribution ($)</label>
              <input
                className="modal-input"
                type="number"
                min="1"
                placeholder="e.g. 300"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Total Members</label>
              <input
                className="modal-input"
                type="number"
                min="2"
                placeholder="e.g. 8"
                value={members}
                onChange={(e) => setMembers(e.target.value)}
              />
            </div>
          </div>

          {previewPool !== null && (
            <div className="modal-preview">
              <p className="modal-preview-label">Circle Preview</p>
              <div className="preview-row">
                <span>Monthly pool</span>
                <strong>${previewPool.toLocaleString()}</strong>
              </div>
              <div className="preview-row">
                <span>Each member receives</span>
                <strong>${previewPool.toLocaleString()}</strong>
              </div>
              <div className="preview-row">
                <span>Full cycle length</span>
                <strong>{members} months</strong>
              </div>
            </div>
          )}
        </div>

        <button
          className={`modal-btn ${loading ? "modal-btn--loading" : ""}`}
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : "Create Circle →"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function Circles() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [memberCircleIds, setMemberCircleIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState("");

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const uid = session.user.id;
    setUserId(uid);

    // Circles the user organises
    const { data: organized } = await supabase
      .from("circles")
      .select("*")
      .eq("organizer_id", uid)
      .order("created_at", { ascending: false });

    // Circles the user is a member of
    const { data: memberships } = await supabase
      .from("circle_members")
      .select("circle_id")
      .eq("user_id", uid);

    const memberIds = new Set<string>(
      (memberships ?? []).map((m: { circle_id: string }) => m.circle_id)
    );
    setMemberCircleIds(memberIds);

    // Fetch member circles (excluding ones user organises to avoid dupes)
    let memberCircles: Circle[] = [];
    if (memberIds.size > 0) {
      const { data: mc } = await supabase
        .from("circles")
        .select("*")
        .in("id", [...memberIds])
        .neq("organizer_id", uid);
      memberCircles = mc ?? [];
    }

    // Merge + deduplicate
    const all = [...(organized ?? []), ...memberCircles];
    const seen = new Set<string>();
    const deduped = all.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

    setCircles(deduped);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const organizing = circles.filter((c) => c.organizer_id === userId);
  const memberOf   = circles.filter((c) => memberCircleIds.has(c.id));

  const filtered = circles.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (tab === "organizing") return matchSearch && c.organizer_id === userId;
    if (tab === "member")     return matchSearch && memberCircleIds.has(c.id);
    return matchSearch;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "all",        label: `All (${circles.length})` },
    { key: "organizing", label: `Organizing (${organizing.length})` },
    { key: "member",     label: `Member (${memberOf.length})` },
  ];

  return (
    <div className="circles-page">

      {/* ── Header ── */}
      <div className="circles-header">
        <div>
          <p className="circles-eyebrow">Your savings groups</p>
          <h1 className="circles-title">Circles</h1>
        </div>
        <button className="circles-new-btn" onClick={() => setShowModal(true)}>
          + New Circle
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="circles-toolbar">
        <div className="circles-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`circles-tab ${tab === t.key ? "circles-tab--active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          className="circles-search"
          placeholder="Search circles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Loading ── */}
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

      {/* ── Empty ── */}
      {!loading && filtered.length === 0 && (
        <div className="circles-empty">
          <div className="circles-empty-icon">◉</div>
          <h3>{search ? `No circles matching "${search}"` : "No circles yet"}</h3>
          <p>
            {search
              ? "Try a different search term."
              : "Create your first circle and invite your community."}
          </p>
          {!search && (
            <button className="circles-new-btn" style={{ marginTop: "0.5rem" }} onClick={() => setShowModal(true)}>
              Create a Circle
            </button>
          )}
        </div>
      )}

      {/* ── Cards ── */}
      {!loading && filtered.length > 0 && (
        <div className="circles-grid">
          {filtered.map((circle, i) => {
            const color = COLORS[i % COLORS.length];
            const isOrganizer = circle.organizer_id === userId;
            const pool = circle.contribution_amount * circle.total_members;

            return (
              <div
                className="circle-card"
                key={circle.id}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="cc-head">
                  <div className="cc-avatar" style={{ background: color }}>
                    {getInitials(circle.name)}
                  </div>
                  <div className="cc-title-group">
                    <h3 className="cc-name">{circle.name}</h3>
                    <div className="cc-badges">
                      <span className="cc-badge cc-badge--active">Active</span>
                      {isOrganizer && (
                        <span className="cc-badge cc-badge--organizer">Organizer</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="cc-stats">
                  <div className="cc-stat">
                    <span className="cc-stat-val">${circle.contribution_amount.toLocaleString()}</span>
                    <span className="cc-stat-lbl">per member</span>
                  </div>
                  <div className="cc-divider" />
                  <div className="cc-stat">
                    <span className="cc-stat-val">{circle.total_members}</span>
                    <span className="cc-stat-lbl">members</span>
                  </div>
                  <div className="cc-divider" />
                  <div className="cc-stat">
                    <span className="cc-stat-val">${pool.toLocaleString()}</span>
                    <span className="cc-stat-lbl">pool / mo</span>
                  </div>
                </div>

                <div className="cc-footer">
                  <span className="cc-date">Created {timeAgo(circle.created_at)}</span>
                  <div className="cc-actions">
                    <Link
                      to={`/app/circles/${circle.id}`}
                      className="cc-btn cc-btn--primary"
                      style={{ background: color }}
                    >
                      View
                    </Link>
                    {isOrganizer && (
                      <button className="cc-btn cc-btn--ghost">Manage</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <CreateCircleModal
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  );
}