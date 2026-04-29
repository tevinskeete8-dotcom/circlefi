import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PardnaLogo from "../components/PardnaLogo";
import { useEffect, useState } from "react";
import "../styles/layout.css";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Shield,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/app",             end: true,  icon: <LayoutDashboard size={18} strokeWidth={1.8} />, label: "Dashboard"  },
  { to: "/app/circles",    end: false, icon: <Users            size={18} strokeWidth={1.8} />, label: "Circles"    },
  { to: "/app/reputation", end: false, icon: <TrendingUp       size={18} strokeWidth={1.8} />, label: "Reputation" },
  { to: "/app/security",   end: false, icon: <Shield           size={18} strokeWidth={1.8} />, label: "Security"   },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      setEmail(user.email ?? null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

      if (profile?.first_name) setDisplayName(profile.first_name);
    });
  }, []);

  const userInitial = displayName
    ? displayName[0].toUpperCase()
    : email ? email[0].toUpperCase() : "U";

  const userName = displayName ?? (email ? email.split("@")[0] : "User");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="layout-root">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar-logo">
          <PardnaLogo variant="full" color="white" markColor="#006FFF" />
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " sidebar-link--active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-link sidebar-link--profile"
            onClick={() => { navigate("/app/profile"); setSidebarOpen(false); }}
          >
            <span className="sidebar-link-icon"><User size={18} strokeWidth={1.8} /></span>
            <span className="sidebar-link-label">{userName}</span>
          </button>
          <button className="sidebar-link sidebar-link--logout" onClick={handleLogout}>
            <span className="sidebar-link-icon"><LogOut size={18} strokeWidth={1.8} /></span>
            <span className="sidebar-link-label">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="layout-main">
        <header className="topbar">
          <button
            className="topbar-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <span className="topbar-title">Pardna</span>

          <div className="topbar-right">
            <div
              className="topbar-avatar"
              title={email ?? ""}
              onClick={() => navigate("/app/profile")}
              style={{ cursor: "pointer" }}
            >
              {userInitial}
            </div>
          </div>
        </header>

        <main className="layout-content">{children}</main>

        {/* App Footer */}
        <footer style={{
          padding: "1rem clamp(1.5rem, 4vw, 3rem)",
          background: "#006FFF",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "0.75rem",
        }}>
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.65)" }}>© 2026 Pardna. All rights reserved.</span>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            {["Privacy", "Terms", "Contact"].map(l => (
              <a key={l} href="#" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F59E0B"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)"}
              >{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
