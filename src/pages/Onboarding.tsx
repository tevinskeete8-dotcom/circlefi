import { useAuth } from "../auth/AuthContext";

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f9fc",
        padding: "40px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "50px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>
          Welcome to CircleFi, {user?.name}
        </h2>

        <p style={{ marginBottom: "30px", color: "#475569" }}>
          Let’s configure your account to begin building your
          portable financial reputation.
        </p>

        <button
          onClick={completeOnboarding}
          style={{
            background: "#14b8a6",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
}