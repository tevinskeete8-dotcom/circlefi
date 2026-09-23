import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const CARD = "#141414";
const MUTED = "#8A8A8A";
const LINE = "rgba(255,255,255,0.08)";

type Circle = {
  id: string;
  name?: string;
  status?: string;
  contribution_amount?: number;
  amount?: number;
  invite_code?: string;
  kind?: string;
  due_day?: number;
  unlock_on?: string | null;
  organizer_id?: string;
  total_members?: number;
};

type Member = {
  user_id?: string;
  first_name?: string;
  last_name?: string;
  status?: string;
};

type EventRow = {
  kind?: string;
  user_id?: string;
  period?: string | null;
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

function monthKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-01";
}

function monthLabel() {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function displayName(m: Member) {
  const n = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return n || "Member";
}

export default function CircleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirm, setConfirm] = useState<"leave" | "end" | null>(null);
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(circleId: string) {
    const { data } = await supabase.from("circles").select("*").eq("id", circleId).maybeSingle();
    setCircle((data as Circle) || null);

    const { data: memberRows } = await supabase
      .from("circle_members")
      .select("user_id, status")
      .eq("circle_id", circleId);

    const userIds = (memberRows || []).map((r: { user_id: string }) => r.user_id).filter(Boolean);
    const statusBy = new Map((memberRows || []).map((r: any) => [r.user_id, r.status || "active"]));

    if (userIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);
      const byId = new Map((profiles || []).map((p: any) => [p.id, p]));
      setMembers(
        userIds.map((mid: string) => ({
          user_id: mid,
          first_name: byId.get(mid)?.first_name,
          last_name: byId.get(mid)?.last_name,
          status: statusBy.get(mid),
        }))
      );
    } else {
      setMembers([]);
    }

    const { data: ev } = await supabase
      .from("circle_events")
      .select("kind, user_id, period")
      .eq("circle_id", circleId);
    setEvents((ev as EventRow[]) || []);
  }

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      setUserId(auth.user?.id || null);
      await load(id);
      setLoading(false);
    })();
  }, [id]);

  const amt = Number(circle?.contribution_amount ?? circle?.amount ?? 0);
  const solo = (circle?.kind || "group") === "solo";
  const due = Number(circle?.due_day || 1);
  const closed = (circle?.status || "active").toLowerCase() === "closed";
  const isOrganizer = !!(userId && circle?.organizer_id && userId === circle.organizer_id);
  const myRow = members.find((m) => m.user_id === userId);
  const onRoster = myRow?.status === "active" || myRow?.status === "owing";
  const thisMonth = monthKey();
  const payoutUserIds = new Set(events.filter((e) => e.kind === "payout").map((e) => e.user_id));
  const paidThisMonthIds = new Set(
    events.filter((e) => e.kind === "paid" && e.period === thisMonth).map((e) => e.user_id)
  );
  const anyPayout = payoutUserIds.size > 0;
  const iGotPaid = !!(userId && payoutUserIds.has(userId));
  const iPaidThisMonth = !!(userId && paidThisMonthIds.has(userId));
  const seats = Number(circle?.total_members || members.filter((m) => m.status !== "left").length || 1);
  const remainingMonths = Math.max(1, seats - 1);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const invite = origin + "/invite/" + (circle?.invite_code || circle?.id || "");
  const leavePaidText =
    "You already recorded a payout. Leaving does not cancel the remaining " +
    money(amt) +
    " times " +
    remainingMonths +
    " due dates. You stay on the roster as still owing. No money is collected in this test.";

  function openMail() {
    const subject = encodeURIComponent("Join " + (circle?.name || "my circle"));
    const body = encodeURIComponent(
      "You are invited.\n\n" + invite + "\n\n" + money(amt) + " due the " + ordinal(due) + " each month."
    );
    window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
    setMsg("Email draft opened.");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(invite);
      setMsg("Link copied.");
    } catch {
      setMsg(invite);
    }
  }

  async function markPaid() {
    if (!id || !userId || iPaidThisMonth) return;
    setBusy(true);
    const { error } = await supabase.from("circle_events").insert({
      circle_id: id,
      user_id: userId,
      kind: "paid",
      period: thisMonth,
    });
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg("Marked paid for " + monthLabel() + ". No money moved.");
    await load(id);
  }

  async function recordPayout() {
    if (!id || !userId) return;
    setBusy(true);
    const { error } = await supabase.from("circle_events").insert({
      circle_id: id,
      user_id: userId,
      kind: "payout",
      period: thisMonth,
    });
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg("Payout recorded. Remaining months are still due.");
    await load(id);
  }

  async function leave() {
    if (!id || !userId) return;
    setBusy(true);
    const nextStatus = iGotPaid ? "owing" : "left";
    const { error } = await supabase
      .from("circle_members")
      .update({ status: nextStatus, left_at: new Date().toISOString() })
      .eq("circle_id", id)
      .eq("user_id", userId);

    await supabase.from("circle_events").insert({
      circle_id: id,
      user_id: userId,
      kind: iGotPaid ? "owing" : "left",
    });

    setBusy(false);
    if (error) {
      setMsg(error.message);
      setConfirm(null);
      return;
    }
    setConfirm(null);
    navigate("/app");
  }

  async function endCircle() {
    if (!id) return;
    if (!solo && anyPayout) {
      setMsg("A payout is already on record. End the cycle only after remaining bills are done.");
      setConfirm(null);
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("circles").update({ status: "closed" }).eq("id", id);
    setBusy(false);
    if (error) {
      setMsg(error.message);
      setConfirm(null);
      return;
    }
    setConfirm(null);
    setMsg(solo ? "This bill is ended." : "This circle is ended.");
    await load(id);
  }

  if (loading) return <div style={{ color: MUTED }}>Loading...</div>;
  if (!circle) {
    return (
      <div>
        <Link to="/app/circles" style={{ color: MUTED, textDecoration: "none" }}>Back</Link>
        <h1 style={{ color: "#fff", marginTop: 16 }}>Not found</h1>
      </div>
    );
  }

  const visible = members.filter((m) => m.status !== "left");

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5", maxWidth: 840 }}>
      <Link to="/app/circles" style={{ color: MUTED, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
        Back to circles
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", margin: "18px 0 24px" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 8 }}>
            {closed ? "Ended" : solo ? "Personal" : circle.status || "Active"}
          </div>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em" }}>
            {circle.name || "Circle"}
          </h1>
        </div>
        {!solo && !closed && (
          <button
            onClick={() => setInviteOpen(true)}
            style={{ background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "10px 18px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}
          >
            Invite
          </button>
        )}
      </div>

      {msg && (
        <div style={{ background: "#12352F", color: TEAL, borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 14 }}>
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 22 }}>{money(amt)}</div>
          <div style={{ color: MUTED, fontSize: 12 }}>Each month</div>
        </div>
        <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 22 }}>{ordinal(due)}</div>
          <div style={{ color: MUTED, fontSize: 12 }}>Due day</div>
        </div>
        <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{iPaidThisMonth ? "Paid" : "Due"}</div>
          <div style={{ color: MUTED, fontSize: 12 }}>{monthLabel()}</div>
        </div>
        {solo ? (
          <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{prettyDate(circle.unlock_on) || "-"}</div>
            <div style={{ color: MUTED, fontSize: 12 }}>Unlocks</div>
          </div>
        ) : (
          <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 22 }}>{visible.length}</div>
            <div style={{ color: MUTED, fontSize: 12 }}>On the roster</div>
          </div>
        )}
      </div>

      {solo ? (
        <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 20, padding: 22, marginBottom: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>This bill</div>
          <p style={{ color: MUTED, lineHeight: 1.6, margin: 0 }}>
            {money(amt)} on the {ordinal(due)} until {prettyDate(circle.unlock_on) || "the end date"}.
            Mark paid when you set the money aside. Nothing is withdrawn in this test.
          </p>
        </div>
      ) : (
        <div style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 20, padding: 22, marginBottom: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 14 }}>Roster</div>
          {visible.length === 0 ? (
            <div style={{ color: MUTED }}>You are the only name so far.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {visible.map((m) => (
                <div key={m.user_id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 99, background: "#222", color: TEAL, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12 }}>
                    {displayName(m).slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {displayName(m)}
                    {m.user_id === circle.organizer_id ? <span style={{ color: MUTED, fontWeight: 600 }}> · organizer</span> : null}
                    {paidThisMonthIds.has(m.user_id) ? <span style={{ color: TEAL, fontWeight: 600 }}> · paid</span> : <span style={{ color: MUTED, fontWeight: 600 }}> · due</span>}
                    {payoutUserIds.has(m.user_id) ? <span style={{ color: TEAL, fontWeight: 600 }}> · paid out</span> : null}
                    {m.status === "owing" ? <span style={{ color: "#FF8A80", fontWeight: 600 }}> · still owes</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!closed && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {onRoster && !iPaidThisMonth && (
            <button
              onClick={markPaid}
              disabled={busy}
              style={{ background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "10px 16px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}
            >
              Mark paid this month
            </button>
          )}
          {onRoster && iPaidThisMonth && (
            <div style={{ background: "#12352F", color: TEAL, borderRadius: 999, padding: "10px 16px", fontWeight: 800 }}>
              Paid for {monthLabel()}
            </div>
          )}
          {!solo && onRoster && !iGotPaid && (
            <button
              onClick={recordPayout}
              disabled={busy}
              style={{ background: "transparent", color: "#fff", border: "1px solid " + LINE, borderRadius: 999, padding: "10px 16px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}
            >
              I received this month's payout
            </button>
          )}
          {onRoster && !(isOrganizer && solo) && (
            <button
              onClick={() => setConfirm("leave")}
              style={{ background: "transparent", color: "#fff", border: "1px solid " + LINE, borderRadius: 999, padding: "10px 16px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}
            >
              Leave
            </button>
          )}
          {isOrganizer && (
            <button
              onClick={() => setConfirm("end")}
              style={{ background: "transparent", color: "#FF8A80", border: "1px solid rgba(255,138,128,0.35)", borderRadius: 999, padding: "10px 16px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}
            >
              {solo ? "End this bill" : "End circle"}
            </button>
          )}
        </div>
      )}

      {inviteOpen && !solo && !closed && (
        <div onClick={() => setInviteOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", padding: 16, zIndex: 40 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 20, padding: 22, width: "100%", maxWidth: 420 }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>Invite someone</div>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="email@example.com"
              style={{ width: "100%", boxSizing: "border-box", background: "#1A1A1A", border: "1px solid " + LINE, borderRadius: 12, padding: "12px 14px", color: "#fff", fontFamily: "inherit", marginBottom: 12 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={openMail} style={{ flex: 1, background: TEAL, color: INK, border: 0, borderRadius: 999, padding: "10px 14px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>Email</button>
              <button onClick={copyLink} style={{ flex: 1, background: "transparent", color: "#fff", border: "1px solid " + LINE, borderRadius: 999, padding: "10px 14px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>Copy link</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div onClick={() => setConfirm(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", padding: 16, zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 20, padding: 22, width: "100%", maxWidth: 440 }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
              {confirm === "leave"
                ? iGotPaid
                  ? "You still owe the rest"
                  : "Leave this circle?"
                : solo
                  ? "End this bill?"
                  : anyPayout
                    ? "This circle has a payout on record"
                    : "End this circle?"}
            </div>
            <p style={{ color: MUTED, lineHeight: 1.6, margin: "0 0 16px" }}>
              {confirm === "leave" && iGotPaid
                ? leavePaidText
                : confirm === "leave"
                  ? "You have not recorded a payout. You come off as left. The circle stays up. No refund from the pot."
                  : confirm === "end" && !solo && anyPayout
                    ? "Someone already got a turn. Ending now would strand the remaining seats. Finish the cycle first."
                    : solo
                      ? "The personal bill closes. History stays. Nothing is withdrawn because nothing is held yet."
                      : "Invites stop and the circle is marked ended. The roster is not wiped."}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfirm(null)}
                style={{ flex: 1, background: "transparent", color: "#fff", border: "1px solid " + LINE, borderRadius: 999, padding: "10px 14px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}
              >
                {confirm === "end" && !solo && anyPayout ? "OK" : "Stay"}
              </button>
              {!(confirm === "end" && !solo && anyPayout) && (
                <button
                  onClick={confirm === "leave" ? leave : endCircle}
                  disabled={busy}
                  style={{ flex: 1, background: confirm === "leave" && iGotPaid ? "#FF8A80" : TEAL, color: INK, border: 0, borderRadius: 999, padding: "10px 14px", fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}
                >
                  {busy ? "Working..." : confirm === "leave" ? (iGotPaid ? "Leave - I still owe" : "Leave") : "End"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}