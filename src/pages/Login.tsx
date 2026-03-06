import { useState } from "react";
import PardnaLogo from "../components/PardnaLogo";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      navigate("/app");
    } else {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-page">

      {/* Background effects */}
      <div className="login-bg-grid" aria-hidden="true" />
      <div className="login-glow" aria-hidden="true" />

      {/* Back to landing */}
      <Link to="/" className="login-back">
        ← Back to Pardna
      </Link>

      <div className="login-card">

        {/* Logo */}
        <PardnaLogo size="md" />
          <span>Pardna</span>
        </div>

        <div className="login-header">
          <h1>Welcome back</h1>
          <p>Sign in to your savings circle</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="login-error">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Fields */}
        <div className="login-fields">
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="login-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
            />
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <label htmlFor="password">Password</label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            <input
              id="password"
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />
          </div>
        </div>

        <button
          className={`login-btn ${loading ? "login-btn--loading" : ""}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <>Sign in <span className="btn-arrow">→</span></>
          )}
        </button>

        <p className="login-signup">
          Don't have an account?{" "}
          <Link to="/signup">Create one free</Link>
        </p>

      </div>

      {/* Bottom trust line */}
      <p className="login-trust">
        🔐 Bank-grade encryption · Your data is always protected
      </p>
    </div>
  );
}