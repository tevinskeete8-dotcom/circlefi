import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleLogin() {
    login();
    navigate("/app");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F9FAFB"
      }}
    >
      <div
        style={{
          background: "white",
          padding: 40,
          borderRadius: 12,
          width: 350,
          textAlign: "center"
        }}
      >
        <h2>Login to CircleFi</h2>

        <button
          onClick={handleLogin}
          style={{
            marginTop: 20,
            padding: "12px 20px",
            background: "#02C39A",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Mock Login
        </button>
      </div>
    </div>
  );
}