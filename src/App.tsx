import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Reputation from "./pages/Reputation";
import Circles from "./pages/Circles";
import Security from "./pages/Security";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reputation"
          element={
            <ProtectedRoute>
              <Reputation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/circles"
          element={
            <ProtectedRoute>
              <Circles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <Security />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}