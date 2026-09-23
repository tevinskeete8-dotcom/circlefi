import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TEAL = "#5EEAD4";
const INK = "#0B0B0B";
const MUTED = "#8A8A8A";

const links = [
  { to: "/app", label: "Home", end: true },
  { to: "/app/circles", label: "Circles", end: false },
  { to: "/app/reputation", label: "History", end: false },
  { to: "/app/security", label: "Safety", end: false },
  { to: "/app/profile", label: "Profile", end: false },
];

export default function MainLayout({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();
  const [name, setName] = useState("You");

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        navigate("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();
      setName(data?.first_name || user.email?.split("@")[0] || "You");
    })();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: INK, color: "#F5F5F5", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", position: "relative", overflowX: "hidden" }}>
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background:
          "radial-gradient(900px 420px at 12% -10%, rgba(94,234,212,0.16), transparent 55%)," +
          "radial-gradient(700px 380px at 90% 0%, rgba(94,234,212,0.07), transparent 50%)," +
          "radial-gradient(600px 500px at 50% 110%, rgba(94,234,212,0.05), transparent 55%)",
      }} />
      <div aria-hidden="true" className="pardna-grain" />

      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, padding: "0 clamp(1.1rem, 4vw, 2.5rem)",
        background: "rgba(11,11,11,0.78)", backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        gap: 16,
      }}>
        <NavLink to="/app" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}>
          Pardna
        </NavLink>
        <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              style={({ isActive }) => ({
                color: isActive ? TEAL : MUTED,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: MUTED }}>{name}</span>
          <button
            onClick={signOut}
            style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999, padding: "7px 12px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="pardna-rise" style={{ position: "relative", zIndex: 1, padding: "28px clamp(1.1rem, 4vw, 2.5rem) 64px" }}>
        {children}
      </main>
    </div>
  );
}