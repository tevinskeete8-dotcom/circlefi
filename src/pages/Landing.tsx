import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import PardnaLogo from "../components/PardnaLogo";

// ── Design tokens ─────────────────────────────────────────────────
const C = {
  primary:      "#1D4ED8",
  primaryMid:   "#3B82F6",
  primaryDim:   "#1E40AF",
  primaryLight: "#EFF6FF",
  primaryDark:  "#0F172A",
  gold:         "#D97706",
  goldBright:   "#F59E0B",
  goldLight:    "#FFFBEB",
  teal:         "#059669",
  tealLight:    "#ECFDF5",
  bg:           "#F8FAFC",
  card:         "#FFFFFF",
  text:         "#0F172A",
  mid:          "#475569",
  dim:          "#94A3B8",
  border:       "rgba(15,23,42,0.08)",
  // aliases for backward compat
  purple:       "#1D4ED8",
  purpleMid:    "#3B82F6",
  purpleDim:    "#1E40AF",
  purpleLight:  "#EFF6FF",
  purpleDark:   "#0F172A",
};

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={`wg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={C.purple} />
          <stop offset="55%"  stopColor="#3B82F6" />
          <stop offset="100%" stopColor={C.gold} />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#wg-${size})`} />
      <text x="19" y="28" textAnchor="middle" fill="#fff" fontSize="23" fontWeight="900"
        fontFamily="'Noto Serif', Georgia, serif" letterSpacing="-1">P</text>
      <circle cx="29" cy="11" r="5" fill={C.teal} />
      <circle cx="29" cy="11" r="2.5" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

function useInView(threshold = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const COMMUNITIES = [
  { flag: "🇬🇾", name: "Box-hand",     region: "Guyana"      },
  { flag: "🇹🇹", name: "Sou-Sou",     region: "Trinidad"    },
  { flag: "🇯🇲", name: "Partner",     region: "Jamaica"     },
  { flag: "🇬🇭", name: "Susu",        region: "West Africa" },
  { flag: "🇲🇽", name: "Tanda",       region: "Mexico"      },
  { flag: "🇵🇭", name: "Paluwagan",   region: "Philippines" },
  { flag: "🇰🇷", name: "Gye",         region: "Korea"       },
  { flag: "🇮🇳", name: "Chit Fund",   region: "India"       },
  { flag: "🇧🇧", name: "Meeting Turn",region: "Barbados"    },
];

const FEATURES = [
  { icon: "🔐", bg: C.purpleLight, title: "Bank-grade security",  body: "End-to-end encrypted transactions. Verified member identities. FDIC-protected escrow. Your community's money, safe." },
  { icon: "📈", bg: C.goldLight,   title: "Build real credit",    body: "Your circle contributions are reported as positive financial behaviour — building the credit profile banks have denied you." },
  { icon: "🤝", bg: C.tealLight,   title: "Trusted circles only", body: "Invite-only groups with full activity transparency. Know exactly who you're saving with, every round." },
  { icon: "⚡", bg: C.purpleLight, title: "Instant payouts",      body: "When your turn comes, funds land immediately. No waiting, no cheques, no bank bureaucracy." },
  { icon: "🔄", bg: C.goldLight,   title: "Flexible formats",     body: "Rotating, goal-based, or emergency circles. Configure the structure your community already knows." },
  { icon: "📊", bg: C.tealLight,   title: "Automated tracking",   body: "Smart reminders, live contribution logs, progress dashboards. The admin your organiser used to carry alone." },
];

const STEPS = [
  { n: "01", icon: "1", title: "Start your circle",    body: "Set the amount, frequency, and size. Invite people you trust. Takes five minutes." },
  { n: "02", icon: "2", title: "Everyone contributes", body: "Members pay each round on schedule. Automated reminders handle the awkward follow-ups." },
  { n: "03", icon: "3", title: "Receive your payout",  body: "When your position comes up, the full pool transfers instantly to your account." },
];

const STATS = [
  { val: "$25B", label: "Annual ROSCA flow in the US" },
  { val: "7M+",  label: "Estimated US participants"   },
  { val: "180+", label: "Active circles on Pardna"    },
];

const MEMBERS = [
  { i: "KA", c: "#1D4ED8" }, { i: "MR", c: "#D97706" },
  { i: "JT", c: "#059669" }, { i: "SB", c: "#3B82F6" },
  { i: "OD", c: "#1E40AF" },
];

function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

const signupStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "0.5rem",
  background: `linear-gradient(135deg, #D97706, #F59E0B)`,
  color: "#0F172A", borderRadius: 100, fontWeight: 800,
  textDecoration: "none", cursor: "pointer",
  boxShadow: "0 8px 32px rgba(201,150,58,0.4)",
  transition: "transform 0.2s, box-shadow 0.2s",
};

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 80);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const anim = (delay: number): React.CSSProperties => ({
    opacity:    heroVisible ? 1 : 0,
    transform:  heroVisible ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  });

  return (
    <div style={{ fontFamily: "'Noto Sans', system-ui, sans-serif", color: C.text }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(1.25rem, 6vw, 4rem)",
        height: 68,
        background: scrolled ? "rgba(15,23,42,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <PardnaLogo dark size="md" />
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(1rem, 3vw, 2.5rem)" }}>
          <a href="#features" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontWeight: 500 }}>Features</a>
          <a href="#how-it-works" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontWeight: 500 }}>How it works</a>
          <a href="#communities" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontWeight: 500 }}>Communities</a>
        </div>
        <Link to="/signup" style={{
          padding: "0.5rem 1.25rem", background: C.gold, color: "#fff",
          borderRadius: 100, fontSize: "0.875rem", fontWeight: 700,
          textDecoration: "none", transition: "opacity 0.2s",
        }}>Get started →</Link>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "9rem clamp(1.25rem, 6vw, 5rem) 6rem",
        position: "relative", overflow: "hidden",
        background: `
          radial-gradient(ellipse 80% 60% at 50% -10%, ${C.primaryMid}30 0%, transparent 65%),
          radial-gradient(ellipse 50% 40% at 85% 90%, ${C.gold}15 0%, transparent 55%),
          radial-gradient(ellipse 40% 30% at 10% 80%, ${C.teal}12 0%, transparent 50%),
          linear-gradient(175deg, #0F172A 0%, #1E293B 45%, #0F172A 100%)
        `,
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.035, zIndex: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px 200px" }} />
        <div style={{ position: "absolute", top: "20%", left: "8%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${C.purple}30, transparent 70%)`, filter: "blur(40px)", animation: "float1 8s ease-in-out infinite", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "15%", right: "6%", width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold}20, transparent 70%)`, filter: "blur(40px)", animation: "float2 10s ease-in-out infinite", zIndex: 0 }} />
        <div style={{ position: "absolute", top: "50%", right: "15%", width: 150, height: 150, borderRadius: "50%", background: `radial-gradient(circle, ${C.teal}20, transparent 70%)`, filter: "blur(30px)", animation: "float3 12s ease-in-out infinite", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
          <div style={{ ...anim(0.1), display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.gold, background: "rgba(201,150,58,0.12)", border: "1px solid rgba(201,150,58,0.25)", padding: "0.4rem 1.1rem", borderRadius: 100, marginBottom: "2rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, display: "inline-block" }} />
            Now in early access
          </div>

          <h1 style={{ ...anim(0.2), fontSize: "clamp(2.6rem, 7vw, 5.2rem)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05, color: "#fff", marginBottom: "1.5rem", fontFamily: "'Noto Serif', Georgia, serif" }}>
            Before the banks existed,{" "}
            <span style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldBright}, ${C.teal})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              your community
            </span>{" "}
            already knew how.
          </h1>

          <p style={{ ...anim(0.35), fontSize: "clamp(1rem, 2.2vw, 1.2rem)", color: "rgba(255,255,255,0.65)", lineHeight: 1.75, maxWidth: 520, margin: "0 auto 2.75rem" }}>
            The savings circle your community already runs — now with infrastructure. Security, accountability, and the financial credibility you deserve.
          </p>

          <div style={{ ...anim(0.5), display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "3.5rem" }}>
            <Link to="/signup" style={{ ...signupStyle, padding: "0.95rem 2.25rem", fontSize: "1rem" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 14px 40px rgba(201,150,58,0.6)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,150,58,0.4)"; }}
            >Start your circle →</Link>
            <a href="#how-it-works" style={{ padding: "0.95rem 2.25rem", background: "rgba(255,255,255,0.08)", color: "#fff", borderRadius: 100, fontSize: "1rem", fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            >See how it works</a>
          </div>

          <div style={{ ...anim(0.65), display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex" }}>
              {MEMBERS.map((m, i) => (
                <div key={m.i} style={{ width: 30, height: 30, borderRadius: "50%", background: m.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: "#fff", border: "2px solid rgba(255,255,255,0.2)", marginLeft: i > 0 ? -8 : 0 }}>{m.i}</div>
              ))}
            </div>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>
              <strong style={{ color: "rgba(255,255,255,0.85)" }}>2,400+</strong> members across <strong style={{ color: "rgba(255,255,255,0.85)" }}>180</strong> active circles
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem" }}>●</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>🔐 FDIC-protected escrow</span>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{ background: "#0F172A", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
        {STATS.map((s, i) => (
          <Reveal key={s.val} delay={i * 0.1}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2.5rem 1rem", textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-1.5px", color: C.gold, lineHeight: 1, marginBottom: "0.4rem", fontFamily: "'Noto Serif', Georgia, serif" }}>{s.val}</div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* COMMUNITIES */}
      <section id="communities" style={{ padding: "6rem clamp(1.25rem, 5vw, 4rem)", background: C.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.purple, display: "block", marginBottom: "0.75rem" }}>Cultural roots</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, letterSpacing: "-0.75px", lineHeight: 1.1, color: C.text, marginBottom: "0.75rem", fontFamily: "'Noto Serif', Georgia, serif" }}>
              A tradition across cultures,<br />
              <em style={{ color: C.purple }}>now with infrastructure.</em>
            </h2>
            <p style={{ fontSize: "1rem", color: C.mid, lineHeight: 1.7, maxWidth: 520, marginBottom: "2.5rem" }}>
              Savings circles have existed across every continent for centuries. Pardna is the digital home they've never had.
            </p>
          </Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem" }}>
            {COMMUNITIES.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.05}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.1rem", background: C.card, border: `1px solid ${C.border}`, borderRadius: 100, boxShadow: "0 2px 8px rgba(15,23,42,0.07)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.07)"; }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{c.flag}</span>
                  <span style={{ fontWeight: 700, color: C.text, fontSize: "0.875rem" }}>{c.name}</span>
                  <span style={{ color: C.dim, fontSize: "0.75rem" }}>{c.region}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "6rem clamp(1.25rem, 5vw, 4rem)", background: "#0F172A", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.purple}30, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold}15, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.gold, display: "block", marginBottom: "0.75rem" }}>Why Pardna</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, letterSpacing: "-0.75px", lineHeight: 1.1, color: "#fff", marginBottom: "3rem", fontFamily: "'Noto Serif', Georgia, serif" }}>
              Everything your circle<br /><em style={{ color: C.gold }}>needs to thrive.</em>
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.1}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "1.75rem", display: "flex", gap: "1.25rem", alignItems: "flex-start", transition: "background 0.2s, transform 0.2s", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" }}>{f.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{f.body}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "6rem clamp(1.25rem, 5vw, 4rem)", background: C.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.purple, display: "block", marginBottom: "0.75rem" }}>Getting started</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, letterSpacing: "-0.75px", lineHeight: 1.1, color: C.text, marginBottom: "3rem", fontFamily: "'Noto Serif', Georgia, serif" }}>
              Up and running<br /><em style={{ color: C.purple }}>in minutes.</em>
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.15}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: "2.25rem", boxShadow: "0 2px 12px rgba(15,23,42,0.06)", position: "relative", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(15,23,42,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,23,42,0.06)"; }}
                >
                  <div style={{ position: "absolute", top: -10, right: 16, fontSize: "5rem", fontWeight: 900, color: "rgba(0,0,0,0.15)", lineHeight: 1, fontFamily: "'Noto Serif', Georgia, serif", userSelect: "none" }}>{s.n}</div>

                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: C.text, marginBottom: "0.5rem" }}>{s.title}</div>
                  <div style={{ fontSize: "0.875rem", color: C.mid, lineHeight: 1.7 }}>{s.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "7rem clamp(1.25rem, 5vw, 4rem)", textAlign: "center", background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${C.primary}30 0%, transparent 70%), linear-gradient(160deg, #0F172A 0%, #1E293B 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold}15, transparent 70%)`, filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${C.teal}15, transparent 70%)`, filter: "blur(35px)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Reveal>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.gold, display: "block", marginBottom: "1.25rem" }}>Join the movement</span>
            <h2 style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1, color: "#fff", marginBottom: "1.25rem", fontFamily: "'Noto Serif', Georgia, serif" }}>
              Every circle has a payout.{" "}
              <em style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldBright}, ${C.teal})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Yours is coming.</em>
            </h2>
            <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 2.5rem" }}>
              Thousands are already building wealth together — the way communities always have. Find your circle and claim your turn.
            </p>
            <Link to="/signup" style={{ ...signupStyle, padding: "1rem 2.5rem", fontSize: "1.05rem" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 18px 50px rgba(201,150,58,0.55)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,150,58,0.4)"; }}
            >Start your circle today →</Link>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "2rem clamp(1.25rem, 5vw, 4rem)", background: "#0D0618", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <PardnaLogo dark size="sm" />
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>© 2026 Pardna. All rights reserved.</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = C.gold}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
            >{l}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&family=Noto+Serif:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-30px) scale(1.05); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,20px) scale(0.95); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(15px,-20px); } }
        @keyframes scrollHint { 0%,100% { opacity: 0.4; transform: translateX(-50%) translateY(0); } 50% { opacity: 0.15; transform: translateX(-50%) translateY(8px); } }
      `}</style>
    </div>
  );
}