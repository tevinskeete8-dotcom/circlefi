interface PardnaLogoProps {
  size?: number | string;
  color?: string;
  markColor?: string;
  variant?: string;
  dark?: boolean;
}

const SIZE_MAP: Record<string, number> = {
  sm: 24,
  md: 36,
  lg: 48,
};

export default function PardnaLogo({
  size = "md",
  dark = false,
  markColor,
}: PardnaLogoProps) {
  const s = typeof size === "string"
    ? (SIZE_MAP[size] ?? 36)
    : size;

  const shadowColor = markColor ?? "#006FFF";
  const borderColor = dark ? "#FFFFFF" : "#0F172A";
  const bgColor     = dark ? "#1E293B" : "#FFFFFF";

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue shadow box — offset bottom-right */}
      <rect x={18} y={22} width={78} height={78} fill={shadowColor} />
      {/* White main box with thick dark border */}
      <rect x={4} y={4} width={78} height={78} fill={bgColor} stroke={borderColor} strokeWidth={7} />
      {/* Bold serif P */}
      <text
        x="43"
        y="63"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="900"
        fontSize="58"
        fill={borderColor}
      >
        P
      </text>
    </svg>
  );
}
