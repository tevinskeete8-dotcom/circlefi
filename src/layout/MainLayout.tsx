import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <h2 style={{ marginBottom: "30px" }}>CircleFi</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Link to="/app" style={{ color: "white", textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link to="/reputation" style={{ color: "white", textDecoration: "none" }}>
            Reputation
          </Link>
          <Link to="/circles" style={{ color: "white", textDecoration: "none" }}>
            Circles
          </Link>
          <Link to="/security" style={{ color: "white", textDecoration: "none" }}>
            Security
          </Link>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            marginTop: "40px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white",
            padding: "6px 10px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <div className="main-content fade-in">
        <div className="topbar">
          <h1 style={{ margin: 0 }}>CircleFi Platform</h1>

          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span>{user.name}</span>
              <button
                onClick={logout}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}