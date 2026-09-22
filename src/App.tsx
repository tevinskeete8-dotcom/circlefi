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
import CreateCircle from "./pages/CreateCircle";
import Reputation from "./pages/Reputation";
import Security from "./pages/Security";

import MainLayout from "./layout/MainLayout";
import AcceptInvite from "./pages/AcceptInvite";
import Profile from "./pages/Profile";

function hasOnboarded(userId: string) {
  return (
    localStorage.getItem(`pardna_onboarded_${userId}`) === "true" ||
    localStorage.getItem(`jouvay_onboarded_${userId}`) === "true" ||
    localStorage.getItem(`circlefi_onboarded_${userId}`) === "true"
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (!data.session) navigate("/login");
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      if (!sess) navigate("/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0B0B", color: "#8A8A8A", padding: 40 }}>
        Loading…
      </div>
    );
  }
  if (!session) return null;
  return <>{children}</>;
}

function OnboardingRoute() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate("/login");
      else setLoading(false);
    });
  }, [navigate]);
  if (loading) return null;
  return <Onboarding />;
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

function AuthRedirectHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) return;
      const path = window.location.pathname;
      if (path.startsWith("/app") || path.startsWith("/invite") || path === "/onboarding") return;
      if (event === "SIGNED_IN") {
        if (hasOnboarded(session.user.id)) navigate("/app");
        else navigate("/onboarding");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <>
      <AuthRedirectHandler />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />

        <Route path="/app" element={<AppShell><Dashboard /></AppShell>} />
        <Route path="/app/circles/new" element={<AppShell><CreateCircle /></AppShell>} />
        <Route path="/app/circles" element={<AppShell><Circles /></AppShell>} />
        <Route path="/app/circles/:id" element={<AppShell><CircleDetail /></AppShell>} />
        <Route path="/app/reputation" element={<AppShell><Reputation /></AppShell>} />
        <Route path="/app/profile" element={<AppShell><Profile /></AppShell>} />
        <Route path="/app/security" element={<AppShell><Security /></AppShell>} />

        <Route path="/invite/:token" element={<AcceptInvite />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}