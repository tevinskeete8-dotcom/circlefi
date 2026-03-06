import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/circledetail.css";

type Circle = {
  id: string;
  name: string;
  organizer_id: string;
  contribution_amount: number;
  total_members: number;
  created_at: string;
};

type Member = {
  id: string;
  circle_id: string;
  user_id: string;
  joined_at: string;
};

type Contribution = {
  id: string;
  circle_id: string;
  user_id: string;
  amount: number;
  paid: boolean;
  round_number: number;
  created_at: string;
};

function getInitials(id: string) {
  return id.slice(0, 2).toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const MEMBER_COLORS = [
  "#6B3FA0", "#C9963A", "#7B5EA7", "#3D7EAA", "#C25F3B",
  "#2E8B57", "#B5651D", "#4682B4", "#9370DB", "#20B2AA",
];

// ── Log Contribution Modal ────────────────────────────────────────────
function LogContributionModal({
  circle,
  onClose,
  onLogged,
  userId,
}: {
  circle: Circle;
  onClose: () => void;
  onLogged: () => void;
  userId: string;
}) {
  const [round, setRound]   = useState("1");
  const [paid, setPaid]     = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleLog = async () => {
    if (!round) { setError("Please enter a round number."); return; }
    setLoading(true); setError("");

    const { error: err } = await supabase.from("contributions").insert({
      circle_id:    circle.id,
      user_id:      userId,
      amount:       circle.contribution_amount,
      paid,
      round_number: Number(round),
    });

    if (err) { setError(err.message); setLoading(false); }
    else     { onLogged(); onClose(); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Log Contribution</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">⚠ {error}</div>}

        <div className="modal-fields">
          <div className="modal-field">
            <label>Amount</label>
            <div className="modal-amount-display">
              ${circle.contribution_amount.toLocaleString()}
              <span>per member</span>
            </div>
          </div>
          <div className="modal-field">
            <label>Round Number</label>
            <input
              className="modal-input"
              type="number" min="1"
              placeholder="e.g. 1"
              value={round}
              onChange={(e) => setRound(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label>Status</label>
            <div className="modal-toggle-row">
              <button
                className={`status-btn ${paid ? "status-btn--paid" : ""}`}
                onClick={() => setPaid(true)}
              >
                ✓ Paid
              </button>
              <button
                className={`status-btn ${!paid ? "status-btn--missed" : ""}`}
                onClick={() => setPaid(false)}
              >
                ✗ Missed
              </button>
            </div>
          </div>
        </div>

        <button
          className={`modal-btn ${loading ? "modal-btn--loading" : ""}`}
          onClick={handleLog}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : "Log Contribution →"}
        </button>
      </div>
    </div>
  );
}

// ── Invite Member Modal (replace existing one in CircleDetail.tsx) ────
function InviteMemberModal({
  circle,
  onClose,
}: {
  circle: Circle;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied]   = useState(false);

  const generateInvite = async () => {
    setLoading(true); setError("");

    const token = crypto.randomUUID();
    const { error: err } = await supabase
      .from("circle_invitations")
      .insert({ circle_id: circle.id, token, status: "pending" });

    if (err) { setError(err.message); setLoading(false); return; }

    const link = `${window.location.origin}/invite/${token}`;
    setInviteLink(link);
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite Member</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">⚠ {error}</div>}

        <div className="modal-fields">
          {!inviteLink ? (
            <>
              <p style={{ fontSize: "0.875rem", color: "#5E4A7A", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                Generate a unique invite link and share it with anyone you want to join <strong>{circle.name}</strong>. The link can only be used once.
              </p>
              <button
                className={`modal-btn ${loading ? "modal-btn--loading" : ""}`}
                onClick={generateInvite}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : "Generate invite link →"}
              </button>
            </>
          ) : (
            <div className="modal-field">
              <label>Share this link</label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  className="modal-input"
                  value={inviteLink}
                  readOnly
                  style={{ fontSize: "0.78rem", color: "#5E4A7A" }}
                />
                <button
                  onClick={copyLink}
                  style={{
                    padding: "0.6rem 1rem", borderRadius: 100, border: "none",
                    background: copied ? "#00BFA5" : "#6B3FA0",
                    color: "#fff", fontWeight: 700, fontSize: "0.8rem",
                    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    transition: "background 0.2s",
                  }}
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <p className="modal-hint">
                Share via WhatsApp, text, or email. The link works once and expires after 7 days.
              </p>
              <button
                onClick={generateInvite}
                style={{ marginTop: "0.5rem", background: "none", border: "none", color: "#6B3FA0", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
              >
                Generate a new link
              </button>
            </div>
          )}
        </div>

        {inviteLink && (
          <button className="modal-btn" style={{ background: "#F0EAFA", color: "#6B3FA0" }} onClick={onClose}>
            Done
          </button>
        )}
      </div>
    </div>
  );
}


// ── Main Page ─────────────────────────────────────────────────────────
export default function CircleDetail() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();

  const [circle, setCircle]             = useState<Circle | null>(null);
  const [members, setMembers]           = useState<Member[]>([]);
  const [contributions, setContribs]    = useState<Contribution[]>([]);
  const [loading, setLoading]           = useState(true);
  const [userId, setUserId]             = useState("");
  const [isOrganizer, setIsOrganizer]   = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const uid = session.user.id;
    setUserId(uid);

    const [{ data: circleData }, { data: memberData }, { data: contribData }] =
      await Promise.all([
        supabase.from("circles").select("*").eq("id", id).single(),
        supabase.from("circle_members").select("*").eq("circle_id", id),
        supabase.from("contributions").select("*").eq("circle_id", id).order("created_at", { ascending: false }),
      ]);

    if (!circleData) { navigate("/app/circles"); return; }

    setCircle(circleData);
    setMembers(memberData ?? []);
    setContribs(contribData ?? []);
    setIsOrganizer(circleData.organizer_id === uid);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  // Derived stats
  const totalPool       = circle ? circle.contribution_amount * circle.total_members : 0;
  const paidContribs    = contributions.filter((c) => c.paid);
  const missedContribs  = contributions.filter((c) => !c.paid);
  const totalCollected  = paidContribs.reduce((s, c) => s + c.amount, 0);
  const onTimeRate      = contributions.length > 0
    ? Math.round((paidContribs.length / contributions.length) * 100)
    : 0;

  // Payout rotation slots
  const slots = Array.from({ length: circle?.total_members ?? 0 }, (_, i) => ({
    slot:   i + 1,
    amount: totalPool,
    paid:   i < Math.floor((paidContribs.length / (circle?.total_members ?? 1))),
  }));

  if (loading) {
    return (
      <div className="cd-page">
        <div className="cd-skeleton-header" />
        <div className="cd-skeleton-grid">
          {[1,2,3,4].map((n) => <div className="cd-skeleton-card" key={n} />)}
        </div>
      </div>
    );
  }

  if (!circle) return null;

  return (
    <div className="cd-page">

      {/* ── Back + Header ── */}
      <div className="cd-top">
        <Link to="/app/circles" className="cd-back">← Back to Circles</Link>
      </div>

      <div className="cd-header">
        <div className="cd-header-left">
          <div
            className="cd-avatar"
            style={{ background: MEMBER_COLORS[0] }}
          >
            {circle.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="cd-badges">
              <span className="cd-badge cd-badge--active">Active</span>
              {isOrganizer && <span className="cd-badge cd-badge--organizer">Organizer</span>}
            </div>
            <h1 className="cd-title">{circle.name}</h1>
            <p className="cd-meta">Created {timeAgo(circle.created_at)} · {circle.total_members} members</p>
          </div>
        </div>

        <div className="cd-header-actions">
          <button className="cd-btn-primary" onClick={() => setShowLogModal(true)}>
            + Log Contribution
          </button>
          {isOrganizer && (
            <button className="cd-btn-ghost" onClick={() => setShowInviteModal(true)}>
              Add Member
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="cd-stats">
        {[
          { icon: "⬡", label: "Monthly Pool",    value: `$${totalPool.toLocaleString()}`,         color: "#6B3FA0" },
          { icon: "◈", label: "Total Collected",  value: `$${totalCollected.toLocaleString()}`,    color: "#C9963A" },
          { icon: "◉", label: "Members",          value: `${members.length} / ${circle.total_members}`, color: "#7B5EA7" },
          { icon: "⟡", label: "On-time Rate",     value: contributions.length ? `${onTimeRate}%` : "—", color: "#3D7EAA" },
        ].map((s, i) => (
          <div className="cd-stat-card" key={s.label} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="cd-stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="cd-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="cd-stat-label">{s.label}</div>
            <div className="cd-stat-line" style={{ background: s.color }} />
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="cd-grid">

        {/* Payout Rotation */}
        <div className="cd-panel">
          <div className="cd-panel-head">
            <h2>Payout Rotation</h2>
            <span className="cd-panel-badge">{circle.total_members} slots</span>
          </div>
          <div className="cd-rotation">
            {slots.map((slot) => (
              <div
                className={`cd-slot ${slot.paid ? "cd-slot--paid" : ""}`}
                key={slot.slot}
              >
                <div className="cd-slot-num">{String(slot.slot).padStart(2, "0")}</div>
                <div className="cd-slot-info">
                  <p className="cd-slot-label">Round {slot.slot}</p>
                  <p className="cd-slot-amount">${slot.amount.toLocaleString()}</p>
                </div>
                <div className={`cd-slot-status ${slot.paid ? "cd-slot-status--done" : ""}`}>
                  {slot.paid ? "✓ Paid out" : "Pending"}
                </div>
              </div>
            ))}
            {slots.length === 0 && (
              <p className="cd-empty-text">No rotation slots yet.</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="cd-right">

          {/* Members */}
          <div className="cd-panel">
            <div className="cd-panel-head">
              <h2>Members</h2>
              <span className="cd-panel-badge">{members.length}</span>
            </div>
            <div className="cd-members">
              {members.length === 0 && (
                <p className="cd-empty-text">No members yet. Add your first member.</p>
              )}
              {members.map((m, i) => (
                <div className="cd-member-row" key={m.id}>
                  <div
                    className="cd-member-avatar"
                    style={{ background: MEMBER_COLORS[i % MEMBER_COLORS.length] }}
                  >
                    {getInitials(m.user_id)}
                  </div>
                  <div className="cd-member-info">
                    <p className="cd-member-id">{m.user_id.slice(0, 16)}…</p>
                    <p className="cd-member-joined">Joined {timeAgo(m.joined_at)}</p>
                  </div>
                  {m.user_id === circle.organizer_id && (
                    <span className="cd-member-organizer">Organizer</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contribution History */}
          <div className="cd-panel">
            <div className="cd-panel-head">
              <h2>Contribution History</h2>
              {contributions.length > 0 && (
                <span className="cd-panel-badge">{contributions.length}</span>
              )}
            </div>

            {contributions.length === 0 && (
              <div className="cd-empty">
                <p className="cd-empty-icon">◈</p>
                <p className="cd-empty-text">No contributions logged yet.</p>
                <button
                  className="cd-btn-primary"
                  style={{ marginTop: "0.5rem", fontSize: "0.8rem", padding: "0.5rem 1.1rem" }}
                  onClick={() => setShowLogModal(true)}
                >
                  Log first contribution
                </button>
              </div>
            )}

            {contributions.length > 0 && (
              <div className="cd-contribs">
                {/* Summary bar */}
                <div className="cd-contrib-summary">
                  <div className="cd-contrib-summary-item">
                    <span className="cd-contrib-summary-val" style={{ color: "#6B3FA0" }}>
                      {paidContribs.length}
                    </span>
                    <span>Paid</span>
                  </div>
                  <div className="cd-contrib-summary-item">
                    <span className="cd-contrib-summary-val" style={{ color: "#F87171" }}>
                      {missedContribs.length}
                    </span>
                    <span>Missed</span>
                  </div>
                  <div className="cd-contrib-summary-item">
                    <span className="cd-contrib-summary-val" style={{ color: "#C9963A" }}>
                      ${totalCollected.toLocaleString()}
                    </span>
                    <span>Collected</span>
                  </div>
                </div>

                {contributions.map((c) => (
                  <div className="cd-contrib-row" key={c.id}>
                    <div className={`cd-contrib-dot ${c.paid ? "cd-contrib-dot--paid" : "cd-contrib-dot--missed"}`} />
                    <div className="cd-contrib-info">
                      <p className="cd-contrib-round">Round {c.round_number}</p>
                      <p className="cd-contrib-date">
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="cd-contrib-right">
                      <span className="cd-contrib-amount">${c.amount.toLocaleString()}</span>
                      <span className={`cd-contrib-status ${c.paid ? "cd-contrib-status--paid" : "cd-contrib-status--missed"}`}>
                        {c.paid ? "Paid" : "Missed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Escrow Safety Notice ── */}
      <div className="cd-escrow-notice">
        <span className="cd-escrow-icon">🏦</span>
        <div>
          <p className="cd-escrow-title">FDIC-Protected Escrow</p>
          <p className="cd-escrow-desc">
            All funds in this circle are held in custodial escrow — not by Jouvay or
            any individual member. Payouts are released automatically on schedule.
          </p>
        </div>
        <Link to="/app/security" className="cd-escrow-link">Learn more →</Link>
      </div>

      {/* ── Modals ── */}
      {showLogModal && (
        <LogContributionModal
          circle={circle}
          userId={userId}
          onClose={() => setShowLogModal(false)}
          onLogged={fetchData}
        />
      )}
      {showInviteModal && (
        <InviteMemberModal
          circle={circle}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}