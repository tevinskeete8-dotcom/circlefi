import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/onboarding.css";

// ── Types ─────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5 | 6;

// ── Step components ───────────────────────────────────────────────────

function StepWelcome({ name, setName }: { name: string; setName: (v: string) => void }) {
  return (
    <div className="ob-step">
      <div className="ob-step-icon" style={{ background: "#F0EAFA" }}>👋</div>
      <h2 className="ob-step-title">Welcome to Jouvay</h2>
      <p className="ob-step-sub">
        You're joining a movement that's been helping communities build wealth
        together for generations. Let's get you set up — what should we call you?
      </p>
      <div className="ob-field">
        <label>Your first name</label>
        <input
          className="ob-input"
          type="text"
          placeholder="e.g. Amara"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
    </div>
  );
}

function StepROSCA() {
  const items = [
    { icon: "👥", title: "A group saves together", desc: "A fixed number of trusted members each contribute the same amount every month." },
    { icon: "🔄", title: "One member wins each round", desc: "The full pool is paid out to one member per cycle, rotating until everyone has received it." },
    { icon: "🤝", title: "Built on trust", desc: "Traditionally done informally — Jouvay adds accountability, automation, and credit reporting." },
  ];
  return (
    <div className="ob-step">
      <div className="ob-step-icon" style={{ background: "#FDF3E3" }}>🌍</div>
      <h2 className="ob-step-title">How savings circles work</h2>
      <p className="ob-step-sub">
        ROSCAs — Rotating Savings and Credit Associations — are one of the oldest
        financial tools in the world. Known as Susu, Tanda, Sou-Sou, and dozens
        of other names across cultures.
      </p>
      <div className="ob-cards">
        {items.map((item) => (
          <div className="ob-info-card" key={item.title}>
            <div className="ob-info-icon">{item.icon}</div>
            <div>
              <p className="ob-info-title">{item.title}</p>
              <p className="ob-info-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepEscrow() {
  const pillars = [
    { icon: "🏦", color: "#F0EAFA", title: "FDIC-Protected Escrow",       desc: "All circle funds are held in custodial escrow — not by Jouvay or any individual member." },
    { icon: "⚡", color: "#FDF3E3", title: "Stripe Treasury Infrastructure", desc: "Payments run through Stripe Treasury — regulated infrastructure, not a bank." },
    { icon: "🔐", color: "#F0EDFF", title: "KYC / AML Verified",           desc: "Every member is identity-verified before they can join or contribute to a circle." },
    { icon: "🔄", color: "#F0EAFA", title: "Automated Payouts",            desc: "No organizer can hold or redirect funds. Payouts release automatically on schedule." },
  ];
  return (
    <div className="ob-step">
      <div className="ob-step-icon" style={{ background: "#F0EAFA" }}>🛡</div>
      <h2 className="ob-step-title">Your money is protected</h2>
      <p className="ob-step-sub">
        Jouvay is structured as payments + escrow infrastructure — not a bank.
        That means your money is safer here than in a traditional informal circle.
      </p>
      <div className="ob-pillars">
        {pillars.map((p) => (
          <div className="ob-pillar" key={p.title}>
            <div className="ob-pillar-icon" style={{ background: p.color }}>{p.icon}</div>
            <div>
              <p className="ob-pillar-title">{p.title}</p>
              <p className="ob-pillar-desc">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCreateCircle({
  circleName, setCircleName,
  amount, setAmount,
  members, setMembers,
  circleId,
  onCreate,
  loading,
  error,
}: {
  circleName: string; setCircleName: (v: string) => void;
  amount: string;     setAmount:     (v: string) => void;
  members: string;    setMembers:    (v: string) => void;
  circleId: string | null;
  onCreate: () => void;
  loading: boolean;
  error: string;
}) {
  const pool     = Number(amount) * Number(members);
  const hasCircle = !!circleId;

  return (
    <div className="ob-step">
      <div className="ob-step-icon" style={{ background: "#F0EAFA" }}>⬡</div>
      <h2 className="ob-step-title">Create your first circle</h2>
      <p className="ob-step-sub">
        You can always create more later — but let's get your first one started now.
        You'll be the organizer.
      </p>

      {error && <div className="ob-error">⚠ {error}</div>}

      {hasCircle ? (
        <div className="ob-success-card">
          <div className="ob-success-icon">✓</div>
          <div>
            <p className="ob-success-title">"{circleName}" created!</p>
            <p className="ob-success-desc">
              ${Number(amount).toLocaleString()} / member · ${pool.toLocaleString()} pool · {members} members
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="ob-fields">
            <div className="ob-field">
              <label>Circle name</label>
              <input className="ob-input" type="text" placeholder='e.g. "Familia Unida"'
                value={circleName} onChange={(e) => setCircleName(e.target.value)} />
            </div>
            <div className="ob-row">
              <div className="ob-field">
                <label>Monthly contribution ($)</label>
                <input className="ob-input" type="number" placeholder="e.g. 200"
                  value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="ob-field">
                <label>Total members</label>
                <input className="ob-input" type="number" placeholder="e.g. 6"
                  value={members} onChange={(e) => setMembers(e.target.value)} />
              </div>
            </div>
          </div>

          {amount && members && Number(amount) > 0 && Number(members) > 0 && (
            <div className="ob-preview">
              <div className="ob-preview-item">
                <span>Monthly pool</span>
                <strong>${pool.toLocaleString()}</strong>
              </div>
              <div className="ob-preview-item">
                <span>Payout per member</span>
                <strong>${pool.toLocaleString()}</strong>
              </div>
              <div className="ob-preview-item">
                <span>Cycle length</span>
                <strong>{members} months</strong>
              </div>
            </div>
          )}

          <button className="ob-action-btn" onClick={onCreate} disabled={loading || !circleName || !amount || !members}>
            {loading ? <span className="spinner" /> : "Create circle →"}
          </button>
        </>
      )}
    </div>
  );
}

function StepInvite({ circleName, circleId }: { circleName: string; circleId: string | null }) {
  const [copied, setCopied] = useState(false);
  const inviteLink = circleId
    ? `${window.location.origin}/app/circles/${circleId}`
    : `${window.location.origin}/signup`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ob-step">
      <div className="ob-step-icon" style={{ background: "#FDF3E3" }}>📨</div>
      <h2 className="ob-step-title">Invite your members</h2>
      <p className="ob-step-sub">
        {circleName
          ? `Share the link below to invite trusted people to "${circleName}". They'll need to create a Jouvay account first.`
          : "Share this link with your trusted circle members. They'll need to create a Jouvay account to join."}
      </p>

      <div className="ob-invite-box">
        <div className="ob-invite-link">{inviteLink}</div>
        <button className="ob-copy-btn" onClick={handleCopy}>
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>

      <div className="ob-invite-tips">
        <p className="ob-invite-tips-label">💡 Tips for a strong circle</p>
        <ul>
          <li>Invite people you trust personally — family, close friends, colleagues.</li>
          <li>Make sure everyone understands the contribution schedule before joining.</li>
          <li>Start with a smaller group (4–8 people) for your first circle.</li>
        </ul>
      </div>
    </div>
  );
}

function StepReputation({ name }: { name: string }) {
  const items = [
    { icon: "⟡", color: "#6B3FA0", label: "Pay on time",          desc: "Every on-schedule contribution raises your score." },
    { icon: "◉", color: "#C9963A", label: "Join more circles",    desc: "Participating in multiple circles builds your reputation." },
    { icon: "◈", color: "#7B5EA7", label: "Complete full cycles", desc: "Finishing a full rotation gives the strongest credit signal." },
  ];

  return (
    <div className="ob-step">
      <div className="ob-step-icon" style={{ background: "#F0EDFF" }}>📊</div>
      <h2 className="ob-step-title">Build your financial reputation</h2>
      <p className="ob-step-sub">
        {name ? `Every contribution you make, ${name}, ` : "Every contribution you make "}
        is recorded and used to build your Jouvay Reputation Score — a credit
        identity for people traditional banks overlook.
      </p>

      <div className="ob-rep-score">
        <svg width="100" height="100" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="#6B3FA0" strokeWidth="8"
            strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * 0.75}`}
            transform="rotate(-90 60 60)" />
        </svg>
        <div className="ob-rep-score-inner">
          <span className="ob-rep-score-num">0</span>
          <span className="ob-rep-score-sub">Starting score</span>
        </div>
      </div>

      <div className="ob-cards">
        {items.map((item) => (
          <div className="ob-info-card" key={item.label}>
            <div className="ob-info-icon" style={{ color: item.color, fontSize: "1.2rem" }}>{item.icon}</div>
            <div>
              <p className="ob-info-title">{item.label}</p>
              <p className="ob-info-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="ob-rep-note">
        🏦 Your score is used to qualify for embedded microloans and alternative credit products — coming soon.
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="ob-progress">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`ob-progress-dot ${i < step ? "ob-progress-dot--done" : i === step - 1 ? "ob-progress-dot--active" : ""}`}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();

  const [step, setStep]           = useState<Step>(1);
  const [name, setName]           = useState("");
  const [circleName, setCircleName] = useState("");
  const [amount, setAmount]       = useState("");
  const [members, setMembers]     = useState("");
  const [circleId, setCircleId]   = useState<string | null>(null);
  const [creating, setCreating]   = useState(false);
  const [createError, setCreateError] = useState("");

  const TOTAL = 6;

  const handleCreateCircle = async () => {
    if (!circleName || !amount || !members) return;
    setCreating(true); setCreateError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setCreateError("Not logged in."); setCreating(false); return; }

    const { data, error } = await supabase.from("circles").insert({
      name: circleName,
      organizer_id: session.user.id,
      contribution_amount: Number(amount),
      total_members: Number(members),
    }).select().single();

    if (error) { setCreateError(error.message); }
    else       { setCircleId(data.id); }
    setCreating(false);
  };

  const markOnboardingDone = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Store in localStorage keyed by user id so it's per-user
      localStorage.setItem(`jouvay_onboarded_${session.user.id}`, "true");
    }
  };

  const handleNext = async () => {
    if (step < TOTAL) {
      setStep((s) => (s + 1) as Step);
    } else {
      await markOnboardingDone();
      navigate("/app");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 4) return !!circleId; // must create circle before proceeding
    return true;
  };

  const nextLabel = () => {
    if (step === TOTAL) return "Go to dashboard →";
    if (step === 5) return "Almost done →";
    return "Continue →";
  };

  return (
    <div className="ob-page">
      <div className="ob-card">

        {/* Header */}
        <div className="ob-card-header">
          <div className="ob-logo">
            <div className="ob-logo-mark">C</div>
            <span>Jouvay</span>
          </div>
          <ProgressBar step={step} total={TOTAL} />
          <div className="ob-step-count">{step} of {TOTAL}</div>
        </div>

        {/* Step content */}
        <div className="ob-card-body">
          {step === 1 && <StepWelcome name={name} setName={setName} />}
          {step === 2 && <StepROSCA />}
          {step === 3 && <StepEscrow />}
          {step === 4 && (
            <StepCreateCircle
              circleName={circleName} setCircleName={setCircleName}
              amount={amount}         setAmount={setAmount}
              members={members}       setMembers={setMembers}
              circleId={circleId}
              onCreate={handleCreateCircle}
              loading={creating}
              error={createError}
            />
          )}
          {step === 5 && <StepInvite circleName={circleName} circleId={circleId} />}
          {step === 6 && <StepReputation name={name} />}
        </div>

        {/* Footer nav */}
        <div className="ob-card-footer">
          {step > 1 ? (
            <button className="ob-back-btn" onClick={handleBack}>← Back</button>
          ) : (
            <div />
          )}
          <button
            className="ob-next-btn"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {nextLabel()}
          </button>
        </div>

      </div>

      {/* Skip for users who want to explore on their own */}
      <button
        className="ob-skip"
        onClick={async () => { await markOnboardingDone(); navigate("/app"); }}
      >
        Skip setup
      </button>
    </div>
  );
}