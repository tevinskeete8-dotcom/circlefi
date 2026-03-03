import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-container">
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <h2>CircleFi</h2>

        <NavLink to="/app" className="nav-link">
          Dashboard
        </NavLink>

        <NavLink to="/reputation" className="nav-link">
          Reputation
        </NavLink>

        <NavLink to="/circles" className="nav-link">
          Circles
        </NavLink>

        <NavLink to="/security" className="nav-link">
          Security
        </NavLink>

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          Toggle
        </button>
      </div>

      <div className="main-content fade-in">
        <div className="topbar">
          <h1>CircleFi Platform</h1>

          <div>
            <span style={{ marginRight: "20px" }}>
              {user?.name} ({user?.role})
            </span>
            <button className="primary-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}