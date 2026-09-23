import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const CARD = "#141414";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

function prettyDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CreateCircle() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<"group" | "solo">("group");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(50);
  const [seats, setSeats] = useState(5);
  const [dueDay, setDueDay] = useState(1);
  const [months, setMonths] = useState(6);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const unlockOn = useMemo(() => ymd(addMonths(new Date(), months)), [months]);
  const total = amount * months;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!name.trim()) {
      setErr(kind === "solo" ? "Name this bill." : "Name the circle.");
      return;
    }
    if (amount < 1) {
      setErr("Amount has to be at least $1.");
      return;
    }

    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      navigate("/login");
      return;
    }

    const payload: Record<string, unknown> = {
      name: name.trim(),
      organizer_id: user.id,
      contribution_amount: amount,
      total_members: kind === "solo" ? 1 : seats,
      kind,
      due_day: dueDay,
    };

    if (kind === "solo") {
      payload.duration_months = months;
      payload.unlock_on = unlockOn;
    }

    const insert = await supabase.from("circles").insert(payload).select("*").single();

    if (insert.error || !insert.data) {
      setSaving(false);
      setErr(insert.error?.message || "Could not create this.");
      return;
    }

    const circle = insert.data as { id: string };
    await supabase.from("circle_members").insert({
      circle_id: circle.id,
      user_id: user.id,
    });

    setSaving(false);
    navigate(`/app/circles/${circle.id}`);
  }

  const input: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "#1A1A1A",
    border: `1px solid ${LINE}`,
    borderRadius: 12,
    padding: "12px 14px",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: 15,
  };

  const chip = (on: boolean): React.CSSProperties => ({
    background: on ? TEAL : "transparent",
    color: on ? INK : "#fff",
    border: `1px solid ${on ? TEAL : LINE}`,
    borderRadius: 999,
    padding: "8px 14px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
  });

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5", maxWidth: 640 }}>
      <Link to="/app/circles" style={{ color: MUTED, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
        ← Back to circles
      </Link>

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, margin: "18px 0 8px" }}>
        New
      </div>
      <h1 style={{ margin: "0 0 8px", fontSize: 36, letterSpacing: "-0.04em" }}>
        {kind === "solo" ? "Set a personal bill" : "Start a circle"}
      </h1>
      <p style={{ color: MUTED, lineHeight: 1.6, margin: "0 0 22px" }}>
        {kind === "solo"
          ? "Same amount, same day, until the end date. No one else is on this one."
          : "Defaults are on purpose. Most people keep the suggested amount and size."}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
        <button type="button" onClick={() => setKind("group")} style={{ ...chip(kind === "group"), borderRadius: 16, padding: "14px 12px" }}>
          With people
        </button>
        <button type="button" onClick={() => setKind("solo")} style={{ ...chip(kind === "solo"), borderRadius: 16, padding: "14px 12px" }}>
          Just me
        </button>
      </div>

      {err && (
        <div style={{ background: "#3A1515", color: "#FF8A80", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
          {err}
        </div>
      )}

      <form onSubmit={create}>
        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22, marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
            {kind === "solo" ? "Name" : "Circle name"}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={kind === "solo" ? "Emergency floor" : "Roommate circle"}
            style={input}
          />
        </div>

        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Monthly amount</div>
          <div style={{ color: MUTED, fontSize: 14, marginBottom: 14 }}>
            $50 is filled in on purpose. Change it if you need to.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {[25, 50, 100, 250].map((n) => (
              <button key={n} type="button" onClick={() => setAmount(n)} style={chip(amount === n)}>
                ${n}
              </button>
            ))}
          </div>
          <label style={{ display: "block", fontSize: 13, color: MUTED, marginBottom: 6 }}>Or set another amount</label>
          <input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} style={input} />
        </div>

        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Due day</div>
          <div style={{ color: MUTED, fontSize: 14, marginBottom: 14 }}>
            The 1st is the default. Same day every month.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[1, 5, 15].map((d) => (
              <button key={d} type="button" onClick={() => setDueDay(d)} style={chip(dueDay === d)}>
                {d === 1 ? "1st" : d === 5 ? "5th" : "15th"}
              </button>
            ))}
          </div>
        </div>

        {kind === "group" ? (
          <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22, marginBottom: 18 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Seats</div>
            <div style={{ color: MUTED, fontSize: 14, marginBottom: 14 }}>
              Five people is the default. You are already in.
            </div>
            <input type="range" min={3} max={12} value={seats} onChange={(e) => setSeats(Number(e.target.value))} style={{ width: "100%" }} />
            <div style={{ marginTop: 8, fontWeight: 700 }}>
              {seats} people · you + {seats - 1} invites
            </div>
          </div>
        ) : (
          <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 22, marginBottom: 18 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Unlocks after</div>
            <div style={{ color: MUTED, fontSize: 14, marginBottom: 14 }}>
              Six months is the default. The total sits until that date.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {[3, 6, 12].map((m) => (
                <button key={m} type="button" onClick={() => setMonths(m)} style={chip(months === m)}>
                  {m} months
                </button>
              ))}
            </div>
            <div style={{ fontWeight: 700 }}>
              ${amount} × {months} = ${total.toLocaleString()} on {prettyDate(unlockOn)}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{ width: "100%", background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "14px 16px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer", fontSize: 16 }}
        >
          {saving
            ? "Creating…"
            : kind === "solo"
              ? `Start · $${amount} until ${prettyDate(unlockOn)}`
              : `Create circle · $${amount} / month`}
        </button>
        <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.5, marginTop: 12 }}>
          {kind === "solo"
            ? "No money moves in this test. This sets the amount, the due day, and the end date."
            : "No money moves yet. Creating puts you on the roster."}
        </p>
      </form>
    </div>
  );
}