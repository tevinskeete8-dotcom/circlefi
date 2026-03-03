import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";

type Circle = {
  id: string;
  name: string;
  contribution_amount: number;
  total_members: number;
  organizer_id: string;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCircles() {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("circles")
        .select("*")
        .eq("organizer_id", user.id);

      if (error) {
        console.error("Error fetching circles:", error);
      } else {
        setCircles(data ?? []);
      }

      setLoading(false);
    }

    fetchCircles();
  }, [user]);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>CircleFi Platform</h1>

      {circles.length === 0 ? (
        <p>No circles found.</p>
      ) : (
        circles.map((circle) => (
          <div
            key={circle.id}
            style={{
              marginBottom: 24,
              padding: 20,
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          >
            <h3>{circle.name}</h3>
            <p>Contribution: ${circle.contribution_amount}</p>
            <p>Total Members: {circle.total_members}</p>
          </div>
        ))
      )}
    </div>
  );
}