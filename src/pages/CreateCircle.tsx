import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const CARD = "#141414";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

export default function CreateCircle() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(50);
  const [seats, setSeats] = useState(5);
  const [cadence, setCadence] = useState("monthly");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!name.trim()) {
      setErr("Name the circle.");
      return;
    }
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      navigate("/login");
      return;
    }

    const invite_code = crypto.randomUUID();
    const insert = await supabase
      .from("circles")
      .insert({
        name: name.trim(),
        contribution_amount: amount,
        organizer_id: user.id,
        created_by: user.id,
        invite_code,
        status: "active",
      })
      .select("*")
      .single();

    let circle = insert.data as { id: string } | null;
    if (insert.error || !circle) {
      const fallback = await supabase
        .from("circles")
        .insert({
          name: name.trim(),
          contribution_amount: amount,
        })
        .select("*")
        .single();
      if (fallback.error || !fallback.data) {
        setSaving(false);
        setErr(insert.error?.message || fallback.error?.message || "Could not create the circle.");
        return;
      }
      circle = fallback.data as { id: string };
    }

    await supabase.from("circle_members").insert({
      circle_id: circle.id,
      user_id: user.id,
    });

    setSaving(false);
    navigate(`/app/circles/${circle.id}`);
  }

  const input = {
    width: "100%" as const,
    boxSizing: "border-box" as const,
    background: "#1A1A1A",
    border: `1px solid ${LINE}`,
    borderRadius: 12,
    padding: "12px 14px",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: 15,
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5", maxWidth: 640 }}>
      <Link to="/app/circles" style={{ color: MUTED, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
        ← Back to circles
      </Link>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, margin: "18px 0 8px" }}>
        New circle
      </div>
      <h1 style={{ margin: "0 0 8px", fontSize: 36, letterSpacing: "-0.04em" }}>Start a circle</h1>
      <p style={{ color: MUTED, lineHeight: 1.6, margin: "0 0 24px" }}>
        Defaults are on purpose. Most people keep the suggested amount and schedule.
        You can change them before you create.
      </p>

      {err && (
        <div style={{ background: "#3A1515", color: "#FF8A80", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
          {err}
        </div>
      )}

      <form onSubmit={create}>
        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22, marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Circle name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Roommate circle" style={input} />
        </div>

        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Suggested contribution</div>
          <div style={{ color: MUTED, fontSize: 14, marginBottom: 14 }}>
            $50 / month is the default. People who see a filled-in number start more often than a blank field.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {[25, 50, 100, 250].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setAmount(n)}
                style={{
                  background: amount === n ? TEAL : "transparent",
                  color: amount === n ? INK : "#fff",
                  border: `1px solid ${amount === n ? TEAL : LINE}`,
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                ${n}
              </button>
            ))}
          </div>
          <label style={{ display: "block", fontSize: 13, color: MUTED, marginBottom: 6 }}>Or set another amount</label>
          <input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} style={input} />
        </div>

        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Seats</div>
          <div style={{ color: MUTED, fontSize: 14, marginBottom: 14 }}>
            Five people is the default size. Small enough to know everyone. You are already in.
          </div>
          <input type="range" min={3} max={12} value={seats} onChange={(e) => setSeats(Number(e.target.value))} style={{ width: "100%" }} />
          <div style={{ marginTop: 8, fontWeight: 700 }}>{seats} people · you + {seats - 1} invites</div>
        </div>

        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Schedule</div>
          <div style={{ color: MUTED, fontSize: 14, marginBottom: 14 }}>
            Monthly is on unless you change it. Same idea as default 401(k) enrollment: the plan starts; opting out is the extra step.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "monthly", label: "Monthly" },
              { id: "biweekly", label: "Every 2 weeks" },
              { id: "weekly", label: "Weekly" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCadence(c.id)}
                style={{
                  background: cadence === c.id ? TEAL : "transparent",
                  color: cadence === c.id ? INK : "#fff",
                  border: `1px solid ${cadence === c.id ? TEAL : LINE}`,
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{ width: "100%", background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "14px 16px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer", fontSize: 16 }}
        >
          {saving ? "Creating…" : `Create circle · $${amount} ${cadence}`}
        </button>
        <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.5, marginTop: 12 }}>
          No money moves yet. Creating puts you on the roster and gives you an invite link.
        </p>
      </form>
    </div>
  );
}