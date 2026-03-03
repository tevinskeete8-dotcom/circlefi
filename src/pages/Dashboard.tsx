import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchCircles() {
      setLoading(true);

      const { data, error } = await supabase
        .from("circles")
        .select("*");

      console.log("USER:", user.id);
      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (!error && data) {
        setData(data);
      }

      setLoading(false);
    }

    fetchCircles();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>

      {data.length === 0 ? (
        <p>No circles found.</p>
      ) : (
        data.map((circle) => (
          <div
            key={circle.id}
            style={{
              padding: 20,
              marginBottom: 20,
              background: "#f4f4f4",
              borderRadius: 8,
            }}
          >
            <h3>{circle.name}</h3>
            <p>Contribution: ${circle.contribution_amount}</p>
            <p>Members: {circle.total_members}</p>
          </div>
        ))
      )}
    </div>
  );
}