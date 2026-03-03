import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function MainLayout({ children }: any) {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <div className="sidebar">
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
      </div>

      <div className="main-content">
        <div className="topbar">
          <h1 style={{ fontSize: "34px", fontWeight: 700 }}>
            CircleFi Platform
          </h1>

          <div>
            <span style={{ marginRight: 20 }}>
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