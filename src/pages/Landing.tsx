import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PardnaLogo from "../components/PardnaLogo";

const GREEN = "#5EEAD4";
const INK = "#0B0B0B";
const MUTED = "#8A8A8A";

export default function Landing() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const faqs = [
    {
      q: "Who holds the money?",
      a: "Circle funds sit in FDIC-insured custodial accounts — not with Pardna, and not with the person who started the circle. Payouts release on the schedule the group agreed to.",
    },
    {
      q: "What if someone doesn’t pay?",
      a: "Everyone in a circle is identity-verified. Contributions pull automatically from a connected bank account on the due date. If a pull fails, the group is notified immediately.",
    },
    {
      q: "Who can join my circle?",
      a: "Only people you invite. There is no public marketplace. You send a private link to friends, roommates, or family you already trust.",
    },
    {
      q: "Do I build credit?",
      a: "Joining does not change your credit score today. Every on-time contribution is stored as a Pardna record — a history you can use to show you save on schedule. Bureau reporting is on the roadmap.",
    },
    {
      q: "Can I leave early?",
      a: "Circles work best when everyone finishes. Life happens. The organizer can set exit rules before the circle starts. Don’t join a circle you can’t complete.",
    },
    {
      q: "Is my bank login safe?",
      a: "Bank connections run through Plaid. We never see or store your banking password. You can disconnect at any time.",
    },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#F5F5F5", background: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>

      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, padding: "0 clamp(1.1rem, 4vw, 2.5rem)",
        background: "rgba(11,11,11,0.88)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <PardnaLogo to="/" word size={28} />
        {!isMobile && (
          <div style={{ display: "flex", gap: "2rem", fontSize: 14, color: MUTED, fontWeight: 500 }}>
            <a href="#how" style={{ color: MUTED, textDecoration: "none" }}>How it works</a>
            <a href="#trust" style={{ color: MUTED, textDecoration: "none" }}>Trust</a>
            <a href="#faq" style={{ color: MUTED, textDecoration: "none" }}>FAQ</a>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isMobile && (
            <Link to="/login" style={{ color: MUTED, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Log in</Link>
          )}
          <Link to="/signup" style={{
            background: GREEN, color: INK, textDecoration: "none",
            fontWeight: 800, fontSize: 14, padding: "8px 16px", borderRadius: 999,
          }}>Get started</Link>
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: 0, color: "#fff", fontSize: 20, cursor: "pointer" }}>☰</button>
          )}
        </div>
      </nav>

      {isMobile && menuOpen && (
        <div style={{ padding: "16px 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 16 }}>
          <a href="#how" onClick={() => setMenuOpen(false)} style={{ color: "#fff", textDecoration: "none" }}>How it works</a>
          <a href="#trust" onClick={() => setMenuOpen(false)} style={{ color: "#fff", textDecoration: "none" }}>Trust</a>
          <a href="#faq" onClick={() => setMenuOpen(false)} style={{ color: "#fff", textDecoration: "none" }}>FAQ</a>
          <Link to="/login" onClick={() => setMenuOpen(false)} style={{ color: MUTED, textDecoration: "none" }}>Log in</Link>
        </div>
      )}

      <header style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1.05fr .95fr",
        gap: isMobile ? 40 : 56,
        alignItems: "center",
        padding: isMobile ? "48px 20px 64px" : "72px clamp(1.5rem, 5vw, 3rem) 88px",
        maxWidth: 1160, margin: "0 auto",
      }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            color: GREEN, marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
            Early access
          </div>
          <h1 style={{
            fontSize: isMobile ? 40 : 64,
            fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 0.98,
            marginBottom: 20, color: "#fff",
          }}>
            Save on a schedule.<br />Get paid when it’s your turn.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: MUTED, maxWidth: 440, marginBottom: 28 }}>
            Pool a set amount with people you already trust. Contributions pull automatically. When your turn hits, the full pot lands.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
            <Link to="/signup" style={{
              background: GREEN, color: INK, textDecoration: "none",
              fontWeight: 800, fontSize: 16, padding: "14px 22px", borderRadius: 999,
            }}>Start a circle</Link>
            <a href="#how" style={{
              background: "transparent", color: "#fff", textDecoration: "none",
              fontWeight: 600, fontSize: 16, padding: "14px 22px", borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.16)",
            }}>See how it works</a>
          </div>
          <p style={{ fontSize: 13, color: "#6A6A6A" }}>
            Invite-only · Auto-pay · FDIC-insured escrow
          </p>
        </div>

        <div style={{
          background: "#141414", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28, padding: 22, boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, color: "#8A8A8A", fontSize: 12, fontWeight: 600 }}>
            <span>Roommate circle · Round 3 of 6</span>
            <span style={{ color: GREEN }}>Live</span>
          </div>
          <div style={{ fontSize: 13, color: "#8A8A8A", marginBottom: 6 }}>This month’s pool</div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>$1,200</div>
          <div style={{ fontSize: 13, color: "#8A8A8A", margin: "8px 0 18px" }}>$200 each · payout in 11 days</div>
          <div style={{ height: 8, background: "#222", borderRadius: 99, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ width: "50%", height: "100%", background: GREEN }} />
          </div>
          {["Alex — paid", "Jordan — paid", "Sam — next payout", "Riley — upcoming", "Casey — upcoming", "You — upcoming"].map((row, i) => (
            <div key={row} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.06)",
              fontSize: 14, color: i === 2 ? GREEN : "#E8E8E8",
            }}>
              <span>{row}</span>
              <span style={{ color: i < 2 ? GREEN : "#666", fontSize: 12 }}>{i < 2 ? "✓" : i === 2 ? "→" : ""}</span>
            </div>
          ))}
        </div>
      </header>

      <section id="how" style={{ background: "#111", padding: isMobile ? "64px 20px" : "88px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <p style={{ color: GREEN, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontSize: isMobile ? 32 : 44, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 36, maxWidth: 560 }}>
            Set it once. Stay in because leaving takes effort.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
            {[
              { n: "01", t: "Open a circle", d: "Pick an amount. $50, $100, or $200 to start. Invite people you already text." },
              { n: "02", t: "It pulls on schedule", d: "No chasing. Contributions come out of connected accounts on the date you set." },
              { n: "03", t: "Someone gets the pot", d: "Each round, one person receives the full pool. Then it rotates until everyone has." },
            ].map((s) => (
              <div key={s.n} style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 24 }}>
                <div style={{ color: GREEN, fontWeight: 800, fontSize: 13, marginBottom: 28 }}>{s.n}</div>
                <h3 style={{ fontSize: 20, fontWeight: 750, marginBottom: 8 }}>{s.t}</h3>
                <p style={{ color: MUTED, lineHeight: 1.6, fontSize: 15 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" style={{ padding: isMobile ? "64px 20px" : "88px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <p style={{ color: GREEN, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Trust</p>
          <h2 style={{ fontSize: isMobile ? 32 : 44, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12, maxWidth: 640 }}>
            The questions you should ask before you send money.
          </h2>
          <p style={{ color: MUTED, marginBottom: 36, maxWidth: 480, lineHeight: 1.6 }}>
            This is a multi-month commitment, not a $20 tap. Here is how the money is handled.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            {[
              { t: "You pick the people", d: "Private invites only. No strangers, no public feed of circles." },
              { t: "Nobody holds the cash", d: "Funds sit in FDIC-insured custodial accounts until a scheduled payout." },
              { t: "Payments are automatic", d: "Tied to a verified bank account. The circle does not depend on someone remembering." },
              { t: "You can see every round", d: "Live log of who paid, who is next, and when the pot moves." },
            ].map((c) => (
              <div key={c.t} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "22px 24px" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{c.t}</h3>
                <p style={{ color: MUTED, lineHeight: 1.6, fontSize: 15 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#111", padding: isMobile ? "64px 20px" : "80px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <p style={{ color: GREEN, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Your record</p>
            <h2 style={{ fontSize: isMobile ? 32 : 40, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 14 }}>
              Finish circles. Build a history banks never gave you.
            </h2>
            <p style={{ color: MUTED, lineHeight: 1.65, fontSize: 16 }}>
              Every on-time contribution adds to your Pardna record. It does not change your credit score today. It is a savings history you can carry — and the path to reporting later.
            </p>
          </div>
          <div style={{ background: "#1A1A1A", borderRadius: 24, padding: 28, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 8 }}>Pardna record</div>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em", color: GREEN }}>0</div>
            <div style={{ fontSize: 14, color: MUTED, marginBottom: 20 }}>Starting score · grows with on-time rounds</div>
            {["Pay on the date", "Finish a full rotation", "Stay in more than one circle"].map((x) => (
              <div key={x} style={{ padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.06)", color: "#E8E8E8", fontSize: 15 }}>{x}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" style={{ padding: isMobile ? "64px 20px" : "88px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ color: GREEN, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>FAQ</p>
          <h2 style={{ fontSize: isMobile ? 32 : 40, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 28 }}>Straight answers.</h2>
          {faqs.map((item, i) => (
            <div key={item.q} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%", textAlign: "left", background: "none", border: 0, color: "#fff",
                  padding: "18px 0", fontSize: 17, fontWeight: 650, cursor: "pointer",
                  display: "flex", justifyContent: "space-between", gap: 16, fontFamily: "inherit",
                }}
              >
                {item.q}
                <span style={{ color: GREEN }}>{openFaq === i ? "–" : "+"}</span>
              </button>
              {openFaq === i && (
                <p style={{ color: MUTED, lineHeight: 1.7, paddingBottom: 18, fontSize: 15 }}>{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: isMobile ? "24px 16px 72px" : "24px 24px 96px" }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto", background: GREEN, color: INK,
          borderRadius: 28, padding: isMobile ? "48px 24px" : "72px 48px", textAlign: "center",
        }}>
          <h2 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Start with people you already trust.
          </h2>
          <p style={{ fontSize: 17, marginBottom: 28, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            One circle. A set amount. A date on the calendar. That is the whole habit.
          </p>
          <Link to="/signup" style={{
            display: "inline-block", background: INK, color: "#fff", textDecoration: "none",
            fontWeight: 800, fontSize: 16, padding: "14px 24px", borderRadius: 999,
          }}>Create your account</Link>
        </div>
      </section>
      <footer style={{
        padding: "20px clamp(1.1rem, 4vw, 2.5rem) 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        color: "#666",
        fontSize: 13,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <img src="/Favicon.png" alt="" width={22} height={22} style={{ borderRadius: 6 }} />
          © 2026 Pardna
        </span>
        <span>Pooled savings for people you already know.</span>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="#" style={{ color: "#666", textDecoration: "none" }}>Privacy</a>
          <a href="#" style={{ color: "#666", textDecoration: "none" }}>Terms</a>
        </div>
      </footer>
    </div>
  );
}