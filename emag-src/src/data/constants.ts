// ثابت‌های فیزیکی SI مورد استفاده در کل آزمایشگاه
export const K_COULOMB = 8.99e9; // N·m²/C²
export const EPS0 = 8.854e-12; // F/m
export const MU0 = 4 * Math.PI * 1e-7; // T·m/A
export const C_LIGHT = 299792458; // m/s
export const ELECTRON_CHARGE = 1.602176634e-19; // C
export const ELECTRON_MASS = 9.10938e-31; // kg
export const PROTON_MASS = 1.67262e-27; // kg

export function fmt(value: number, digits = 3): string {
  if (!isFinite(value)) return "∞";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-3 || abs >= 1e5)) {
    return value.toExponential(digits - 1);
  }
  return Number(value.toPrecision(digits)).toLocaleString("en-US", {
    maximumFractionDigits: 6,
  });
}

export function fmtUnit(value: number, unit: string, digits = 3): string {
  return `${fmt(value, digits)} ${unit}`;
}

export const LEVELS = [
  {
    id: 1,
    title: "سطح ۱: بار و میدان",
    subtitle: "Charge → Electric Field → Force",
    labs: ["efield", "force"],
  },
  {
    id: 2,
    title: "سطح ۲: پتانسیل و انرژی",
    subtitle: "Potential → Voltage → Energy",
    labs: ["potential", "capacitor"],
  },
  {
    id: 3,
    title: "سطح ۳: شار و قانون گاوس",
    subtitle: "Flux → Gauss's Law",
    labs: ["gauss"],
  },
  {
    id: 4,
    title: "سطح ۴: جریان و میدان مغناطیسی",
    subtitle: "Current → Magnetic Field",
    labs: ["bfield", "biotsavart"],
  },
  {
    id: 5,
    title: "سطح ۵: نیروی مغناطیسی و حرکت ذره",
    subtitle: "Magnetic Force → Particle Motion",
    labs: ["magforce"],
  },
  {
    id: 6,
    title: "سطح ۶: القا و قانون لنز",
    subtitle: "Faraday → Lenz → Induction",
    labs: ["induction", "circuit"],
  },
  {
    id: 7,
    title: "سطح ۷: امواج ماکسول",
    subtitle: "Maxwell → Electromagnetic Waves",
    labs: ["waves"],
  },
  {
    id: 8,
    title: "سطح ۸: آنتن و تشعشع",
    subtitle: "Waves → Antennas → Radiation",
    labs: ["antenna"],
  },
] as const;
