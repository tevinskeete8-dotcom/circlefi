import React from "react";

interface PardnaLogoProps {
  variant?: "full" | "mark";
  size?: number;
  color?: string;
  dark?: boolean;
}

export default function PardnaLogo({
  variant = "full",
  size = 36,
  color,
  dark = false,
}: PardnaLogoProps) {
  const textColor = color ?? (dark ? "#FFFFFF" : "#0F172A");
  const shadowColor = "#006FFF";
  const borderColor = dark ? "#FFFFFF" : "#0F172A";
  const bgColor = dark ? "#1E293B" : "#FFFFFF";

  // Mark: thick-bordered white box with P, electric blue shadow offset bottom-right
  const Mark = ({ s }: { s: number }) => {
    const offset = s * 0.18;  // shadow offset
    const boxSize = s * 0.78; // main box size
    const borderW = s * 0.07; // border thickness

    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Blue shadow box — offset bottom-right */}
        <rect
          x={18}
          y={22}
          width={78}
          height={78}
          fill={shadowColor}
        />
        {/* White main box with thick dark border */}
        <rect
          x={4}
          y={4}
          width={78}
          height={78}
          fill={bgColor}
          stroke={borderColor}
          strokeWidth={7}
        />
        {/* P letter — bold serif, centered in box */}
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
  };

  return <Mark s={size} />;
}
