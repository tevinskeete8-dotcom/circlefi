import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "./lib/supabase";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";

import Dashboard from "./pages/Dashboard";
import Circles from "./pages/Circles";
import CircleDetail from "./pages/CircleDetail";
import Reputation from "./pages/Reputation";
import Security from "./pages/Security";

import MainLayout from "./layout/MainLayout";
import AcceptInvite from "./pages/AcceptInvite";


// ── Check onboarding status ───────────────────────────────────────────
function hasOnboarded(userId: string) {
  return localStorage.getItem(`jouvay_onboarded_${userId}`) === "true";
}


// ── Protected route wrapper ───────────────────────────────────────────
function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F7F5F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6B3FA0",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: "0.9rem",
          letterSpacing: "0.05em",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (!hasOnboarded(session.user.id)) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}


// ── Layout wrapper for authenticated pages ───────────────────────────
function AppShell({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}


// ── Onboarding guard ─────────────────────────────────────────────────
function OnboardingRoute() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  if (!session) return <Navigate to="/login" replace />;

  if (hasOnboarded(session.user.id)) {
    return <Navigate to="/app" replace />;
  }

  return <Onboarding />;
}


// ── Redirect after authentication ────────────────────────────────────
function AuthRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          if (!hasOnboarded(session.user.id)) {
            navigate("/onboarding", { replace: true });
          } else {
            navigate("/app", { replace: true });
          }
        }
      });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}


// ── Main App Router ──────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <AuthRedirectHandler />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<OnboardingRoute />} />

        {/* Protected app */}
        <Route path="/app" element={<AppShell><Dashboard /></AppShell>} />

        <Route path="/app/circles" element={
          <AppShell>
            <Circles />
          </AppShell>
        } />

        <Route path="/app/circles/:id" element={
          <AppShell>
            <CircleDetail />
          </AppShell>
        } />

        <Route path="/app/reputation" element={
          <AppShell>
            <Reputation />
          </AppShell>
        } />

        <Route path="/app/security" element={
          <AppShell>
            <Security />
          </AppShell>
        } />

        {/* Invite */}
        <Route path="/invite/:token" element={<AcceptInvite />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}