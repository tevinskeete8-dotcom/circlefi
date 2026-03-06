// PardnaLogo — boxed P mark + Cormorant Garamond italic "ardna"
// Usage:
//   <PardnaLogo />              full wordmark, light bg
//   <PardnaLogo dark />         full wordmark, dark bg
//   <PardnaLogo iconOnly />     P box only (sidebar/dashboard)
//   <PardnaLogo size="sm" />    sm | md (default) | lg

type LogoProps = {
  dark?: boolean;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { box: 28, border: 1.5, font: "1.05rem", ardna: "1.3rem", shadow: 3 },
  md: { box: 38, border: 2,   font: "1.45rem", ardna: "1.85rem", shadow: 4 },
  lg: { box: 52, border: 2.5, font: "2rem",    ardna: "2.55rem", shadow: 5 },
};

export default function PardnaLogo({ dark = false, iconOnly = false, size = "md" }: LogoProps) {
  const s = SIZES[size];
  const fg = dark ? "#FFFFFF" : "#0F172A";
  const shadowBg = dark ? "rgba(255,255,255,0.12)" : "#1D4ED8";

  const boxStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: s.box,
    height: s.box,
    border: `${s.border}px solid ${fg}`,
    position: "relative",
    flexShrink: 0,
  };

  const shadowStyle: React.CSSProperties = {
    position: "absolute",
    top: s.shadow,
    left: s.shadow,
    right: -s.shadow,
    bottom: -s.shadow,
    background: shadowBg,
    zIndex: 0,
  };

  const pStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 900,
    fontSize: s.font,
    color: fg,
    position: "relative",
    zIndex: 1,
    lineHeight: 1,
    userSelect: "none",
  };

  const ardnaStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontStyle: "italic",
    fontWeight: 700,
    fontSize: s.ardna,
    color: fg,
    lineHeight: 1,
    letterSpacing: "-0.01em",
    userSelect: "none",
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
      <div style={boxStyle}>
        <div style={shadowStyle} />
        <span style={pStyle}>P</span>
      </div>
      {!iconOnly && (
        <span style={ardnaStyle}>ardna</span>
      )}
    </div>
  );
}
