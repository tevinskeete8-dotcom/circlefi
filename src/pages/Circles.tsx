export default function Circles() {
  return (
    <>
      <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
        Active Circles
      </h1>

      <div className="card">
        <h3>Familia Unida</h3>
        <p>$300 per member · 4 members</p>
        <p>Round 2 of 4</p>
      </div>

      <div className="card">
        <h3>Create New Circle</h3>
        <p>
          Launch a digitally protected ROSCA for your community.
        </p>
        <button className="primary-btn">
          Start New Circle
        </button>
      </div>
    </>
  );
}