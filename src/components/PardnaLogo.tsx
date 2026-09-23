import { Link } from "react-router-dom";

type Props = {
  to?: string;
  word?: boolean;
  dark?: boolean;
  size?: "sm" | "md" | "lg" | number;
};

export default function PardnaLogo({ to, word = false, dark = true, size = 36 }: Props) {
  const px = size === "lg" ? 44 : size === "md" ? 36 : size === "sm" ? 32 : typeof size === "number" ? size : 36;
  const color = dark ? "#fff" : "#0B0B0B";
  const mark = (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <svg width={px} height={px} viewBox="0 0 64 64" aria-label="Pardna">
        <rect width="64" height="64" rx="14" fill="#5EEAD4" />
        <path fill="#0B0B0B" d="M19 13h16c9 0 16 6.4 16 16.2S44 45.4 35 45.4H31.5V51H19V13zm13 8.2v16h3.2c4.6 0 8.3-3.3 8.3-8s-3.7-8-8.3-8H32z" />
        <path fill="#5EEAD4" d="M19 13l14 10H19z" />
      </svg>
      {word && (
        <span style={{ color, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em", marginLeft: 10 }}>
          Pardna
        </span>
      )}
    </span>
  );
  if (to === undefined) return mark;
  return (
    <Link to={to} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
      {mark}
    </Link>
  );
}