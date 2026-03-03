export default function Security() {
  return (
    <>
      <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
        Trust & Security
      </h1>

      <div className="card">
        <h3>Escrow Protection</h3>
        <p>
          All funds are held in a protected escrow structure.
          No individual organizer has unilateral control.
        </p>
      </div>

      <div className="card">
        <h3>Contribution Transparency</h3>
        <p>
          Every contribution is logged and timestamped.
          Members can verify payment history at any time.
        </p>
      </div>

      <div className="card">
        <h3>Portable Financial Record</h3>
        <p>
          Your verified payment history builds a reputation profile
          that can unlock access to external financial services.
        </p>
      </div>
    </>
  );
}