import { Link } from "react-router-dom";

type Props = {
  to?: string;
  word?: boolean;
  dark?: boolean;
  size?: "sm" | "md" | "lg" | number;
};

export default function PardnaLogo({ to = "/", word = true, dark = true, size = "sm" }: Props) {
  const px = size === "lg" ? 36 : size === "md" ? 32 : typeof size === "number" ? size : 28;
  const color = dark ? "#fff" : "#0B0B0B";
  const inner = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <img src="/logo.jpg" alt="Pardna" width={px} height={px} style={{ borderRadius: 8 }} />
      {word && (
        <span style={{ color, fontWeight: 800, fontSize: Math.max(16, Math.round(px * 0.64)), letterSpacing: "-0.03em" }}>
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