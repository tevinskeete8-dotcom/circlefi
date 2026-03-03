import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

import MainLayout from "./layout/MainLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reputation from "./pages/Reputation";
import Circles from "./pages/Circles";
import Security from "./pages/Security";
import Onboarding from "./pages/Onboarding";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {user && !user.onboarded && (
        <Route path="*" element={<Onboarding />} />
      )}

      {user && user.onboarded && (
        <Route
          path="/app"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
      )}

      {user && user.onboarded && (
        <>
          <Route
            path="/reputation"
            element={
              <MainLayout>
                <Reputation />
              </MainLayout>
            }
          />

          <Route
            path="/circles"
            element={
              <MainLayout>
                <Circles />
              </MainLayout>
            }
          />

          <Route
            path="/security"
            element={
              <MainLayout>
                <Security />
              </MainLayout>
            }
          />
        </>
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}