import { Link } from "react-router-dom";

type Props = {
  to?: string;
  word?: boolean;
  size?: number;
  dark?: boolean;
};

export default function Logo({ to = "/", word = true, size = 28, dark = true }: Props) {
  const color = dark ? "#fff" : "#0B0B0B";
  const inner = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <img src="/logo.jpg" alt="Pardna" width={size} height={size} style={{ borderRadius: 8 }} />
      {word && (
        <span style={{ color, fontWeight: 800, fontSize: Math.max(16, Math.round(size * 0.64)), letterSpacing: "-0.03em" }}>
          Pardna
        </span>
      )}
    </span>
  );
  if (!to) return inner;
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  );
}