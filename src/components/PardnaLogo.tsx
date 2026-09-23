import { Link } from "react-router-dom";

type Props = {
  to?: string;
  word?: boolean;
  dark?: boolean;
  size?: "sm" | "md" | "lg" | number;
};

export default function PardnaLogo({ to = "/", word = false, dark = true, size = 40 }: Props) {
  const px = size === "lg" ? 44 : size === "md" ? 36 : size === "sm" ? 32 : typeof size === "number" ? size : 40;
  const color = dark ? "#fff" : "#0B0B0B";
  const inner = (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <img src="/logo.png" alt="Pardna" width={px} height={px} style={{ display: "block", borderRadius: 10 }} />
      {word && (
        <span style={{ color, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em", marginLeft: 10 }}>
          Pardna
        </span>
      )}
    </span>
  );
  if (!to) return inner;
  return (
    <Link to={to} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
      {inner}
    </Link>
  );
}