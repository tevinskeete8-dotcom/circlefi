import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Circle = {
  id: string;
  name: string;
  contribution_amount: number;
  total_members: number;
  organizer_id: string;
};

export default function Dashboard() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCircles() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      const { data, error } = await supabase
        .from("circles")
        .select("*")
        .eq("organizer_id", userId);

      if (error) {
        console.error(error);
      } else {
        setCircles(data ?? []);
      }

      setLoading(false);
    }

    fetchCircles();
  }, []);

  if (loading) {
    return <div style={{ paddingTop: 60 }}>Loading dashboard...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: 28, marginBottom: 24 }}>
        Dashboard Overview
      </h2>

      {circles.length === 0 ? (
        <div className="card">
          <h3>No circles yet</h3>
          <p style={{ marginTop: 8, color: "var(--text-secondary)" }}>
            Create your first savings circle to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="card-grid">
            {circles.map((circle) => {
              const totalPool =
                circle.contribution_amount * circle.total_members;

              return (
                <div className="card" key={circle.id}>
                  <h3 style={{ marginBottom: 12 }}>{circle.name}</h3>

                  <p style={{ color: "var(--text-secondary)" }}>
                    Contribution per member
                  </p>
                  <h2 style={{ marginBottom: 16 }}>
                    ${circle.contribution_amount}
                  </h2>

                  <p style={{ color: "var(--text-secondary)" }}>
                    Total Members
                  </p>
                  <h3 style={{ marginBottom: 16 }}>
                    {circle.total_members}
                  </h3>

                  <p style={{ color: "var(--text-secondary)" }}>
                    Total Pool
                  </p>
                  <h2>${totalPool}</h2>
                </div>
              );
            })}
          </div>

          <button
            className="primary-btn"
            style={{ marginTop: 40 }}
          >
            Create New Circle
          </button>
        </>
      )}
    </div>
  );
}