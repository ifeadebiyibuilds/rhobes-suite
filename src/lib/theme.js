// Shared design tokens — pulled out of App.js so Login/Tailor Portal/etc.
// can use the same dark-gold look without duplicating the palette.
export const C = {
  bg: "#0e0f11",
  surface: "#16181c",
  surfaceAlt: "#1c1f24",
  border: "#252830",
  gold: "#c9a84c",
  goldDim: "#a07830",
  goldBg: "rgba(201,168,76,0.10)",
  text: "#e8e2d4",
  muted: "#6b7280",
  green: "#34d399",
  red: "#f87171",
  blue: "#60a5fa",
  purple: "#a78bfa",
  orange: "#fb923c",
};

export const fmt = (n) => "₦" + Number(n || 0).toLocaleString();
