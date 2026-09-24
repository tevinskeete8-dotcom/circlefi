import { Link } from "react-router-dom";

type Props = {
  to?: string;
  word?: boolean;
  dark?: boolean;
  size?: "sm" | "md" | "lg" | number;
};

export default function PardnaLogo({ to, word = false, size = 36 }: Props) {
  const px = size === "lg" ? 44 : size === "md" ? 36 : size === "sm" ? 28 : typeof size === "number" ? size : 36;
  const mark = word ? (
    <img src="/PardnaLogo.png" alt="Pardna" style={{ height: px, width: "auto", display: "block" }} />
  ) : (
    <img
      src="/Favicon.png"
      alt="Pardna"
      width={px}
      height={px}
      style={{ display: "block", borderRadius: 8 }}
    />
  );
  if (to === undefined) return mark;
  return (
    <Link to={to} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
      {mark}
    </Link>
  );
}