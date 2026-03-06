import { useState } from "react";
import PardnaLogo from "../components/PardnaLogo";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css"; // reuses login styles — no new CSS needed

export default function Signup() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");

    if (!email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    // Auto sign-in after signup
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      // Signup worked but auto-login failed — show confirmation instead
      setSuccess(true);
      setLoading(false);
    } else {
      navigate("/app");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSignup();
  };

  // ── Email confirmation screen ────────────────────────────────────
  if (success) {
    return (
      <div className="login-page">
        <div className="login-bg-grid" aria-hidden="true" />
        <div className="login-glow" aria-hidden="true" />

        <div className="login-card">
          <PardnaLogo size="md" />

          <div className="login-header">
            <h1>Check your email</h1>
            <p>We sent a confirmation link to <strong style={{ color: "#EEF2F8" }}>{email}</strong></p>
          </div>

          <div className="login-error" style={{
            background: "rgba(26,191,173,0.08)",
            borderColor: "rgba(26,191,173,0.2)",
            color: "#1D4ED8",
          }}>
            <span>✓</span> Click the link in your email to activate your account.
          </div>

          <p className="login-signup" style={{ textAlign: "center" }}>
            Already confirmed?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Main signup form ─────────────────────────────────────────────
  return (
    <div className="login-page">

      <div className="login-bg-grid" aria-hidden="true" />
      <div className="login-glow" aria-hidden="true" />

      <Link to="/" className="login-back">
        ← Back to Pardna
      </Link>

      <div className="login-card">

        <div className="login-logo">
          <div className="logo-circle">C</div>
          <span>Pardna</span>
        </div>

        <div className="login-header">
          <h1>Create your account</h1>
          <p>Join a savings circle and start building credit</p>
        </div>

        {error && (
          <div className="login-error">
            <span>⚠</span> {error}
          </div>
        )}

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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="login-input"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="new-password"
            />
          </div>

          <div className="field-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Password strength indicator */}
        {password.length > 0 && (
          <div className="password-strength">
            <div className="strength-bars">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="strength-bar"
                  style={{
                    background:
                      password.length >= n * 3
                        ? password.length < 6  ? "#F87171"
                        : password.length < 10 ? "#D97706"
                        : "#1D4ED8"
                        : "rgba(255,255,255,0.08)",
                  }}
                />
              ))}
            </div>
            <span className="strength-label">
              {password.length < 6  ? "Too short"
              : password.length < 10 ? "Could be stronger"
              : "Strong password"}
            </span>
          </div>
        )}

        <button
          className={`login-btn ${loading ? "login-btn--loading" : ""}`}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <>Create account <span className="btn-arrow">→</span></>
          )}
        </button>

        <p className="login-signup">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>

      </div>

      <p className="login-trust">
        🔐 Bank-grade encryption · Your data is always protected
      </p>
    </div>
  );
}