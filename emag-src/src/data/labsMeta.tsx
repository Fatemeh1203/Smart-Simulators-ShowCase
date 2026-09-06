import { ComponentType } from "react";
import ElectricFieldLab from "../labs/ElectricFieldLab";
import ForceLab from "../labs/ForceLab";
import PotentialLab from "../labs/PotentialLab";
import CapacitorLab from "../labs/CapacitorLab";
import GaussLab from "../labs/GaussLab";
import MagneticFieldLab from "../labs/MagneticFieldLab";
import BiotSavartLab from "../labs/BiotSavartLab";
import MagneticForceLab from "../labs/MagneticForceLab";
import InductionLab from "../labs/InductionLab";
import CircuitLab from "../labs/CircuitLab";
import WaveLab from "../labs/WaveLab";
import AntennaLab from "../labs/AntennaLab";
import FreeExperimentLab from "../labs/FreeExperimentLab";

export interface LabMeta {
  id: string;
  title: string;
  short: string;
  icon: string;
  desc: string;
  component: ComponentType;
}

export const LABS: LabMeta[] = [
  { id: "efield", title: "میدان الکتریکی", short: "میدان E", icon: "⚡", desc: "بارها را بگذار، میدان و نیرو را ببین.", component: ElectricFieldLab },
  { id: "force", title: "نیرو و حرکت بار", short: "نیرو F", icon: "➡️", desc: "خط میدان با مسیر واقعی ذره فرق دارد!", component: ForceLab },
  { id: "potential", title: "پتانسیل و ولتاژ", short: "پتانسیل V", icon: "🧭", desc: "رابطهٔ V و E و خطوط هم‌پتانسیل.", component: PotentialLab },
  { id: "capacitor", title: "خازن", short: "خازن C", icon: "🔋", desc: "ظرفیت، بار و انرژی ذخیره‌شده.", component: CapacitorLab },
  { id: "gauss", title: "قانون گاوس", short: "شار Φ", icon: "🌐", desc: "شار و بار محصور، مستقل از شکل سطح.", component: GaussLab },
  { id: "bfield", title: "میدان مغناطیسی", short: "میدان B", icon: "🧲", desc: "سیم، آهنربا و قطب‌نمای مجازی.", component: MagneticFieldLab },
  { id: "biotsavart", title: "بیو-ساوار و آمپر", short: "سولنوئید", icon: "🌀", desc: "حلقه، چند حلقه و سولنوئید.", component: BiotSavartLab },
  { id: "magforce", title: "نیروی مغناطیسی", short: "حرکت ذره", icon: "🌀", desc: "چرا ذره دایره‌ای یا مارپیچی می‌رود؟", component: MagneticForceLab },
  { id: "induction", title: "القای الکترومغناطیسی", short: "فارادی/لنز", icon: "🔁", desc: "آهنربای متحرک، حلقه و ولتاژ القایی.", component: InductionLab },
  { id: "circuit", title: "مدار و جریان", short: "اهم/RC", icon: "🔌", desc: "قانون اهم و شارژ/دشارژ خازن.", component: CircuitLab },
  { id: "waves", title: "امواج الکترومغناطیسی", short: "موج EM", icon: "📡", desc: "رابطهٔ فرکانس و طول موج.", component: WaveLab },
  { id: "antenna", title: "آنتن و تشعشع", short: "آنتن", icon: "📶", desc: "آنتن نیم‌موج و الگوی تشعشع.", component: AntennaLab },
  { id: "free", title: "آزمایش آزاد", short: "Sandbox", icon: "🧪", desc: "هر چیزی را خودت بساز و آزمایش کن.", component: FreeExperimentLab },
];

export function getLab(id: string) {
  return LABS.find((l) => l.id === id);
}
