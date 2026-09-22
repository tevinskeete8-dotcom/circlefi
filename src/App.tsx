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
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      setSession(s);

      if (s?.user && !hasOnboarded(s.user.id)) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", s.user.id)
          .single();
        if (profile?.first_name) {
          localStorage.setItem(`pardna_onboarded_${s.user.id}`, "true");
        }
      }

      setProfileChecked(true);
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
          background: "#F6F6F4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#5EEAD4",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontSize: "0.9rem",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (!profileChecked) return null;
  if (!hasOnboarded(session.user.id)) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

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

function AuthRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        if (event !== "SIGNED_IN" || !session) return;

        const path = window.location.pathname;
        if (
          path.startsWith("/app") ||
          path.startsWith("/onboarding") ||
          path.startsWith("/invite")
        ) {
          return;
        }

        if (!hasOnboarded(session.user.id)) {
          navigate("/onboarding", { replace: true });
        } else {
          navigate("/app", { replace: true });
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