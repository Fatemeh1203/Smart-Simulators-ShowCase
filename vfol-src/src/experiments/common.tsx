import type { Model, NoiseFlags } from "../lib/store";
import { gauss } from "../lib/physics";
import { bi } from "../lib/i18n";

export const noisy = (v: number, frac: number, model: Model, on = true) => (model === "experimental" && on ? v * (1 + frac * gauss()) : v);
export const noisyAdd = (v: number, sigma: number, model: Model, on = true) => (model === "experimental" && on ? v + sigma * gauss() : v);
export const B = bi;
export type NF = NoiseFlags;
export const commonErrors = [
  bi("Instrument calibration and resolution limits (power meter ±0.1 dB, OSA RBW).", "کالیبراسیون و حد تفکیک دستگاه‌ها (توان‌سنج ±0.1 dB، RBW طیف‌سنج)."),
  bi("Connector cleanliness and alignment variability.", "تمیزی و هم‌راستایی کانکتورها."),
  bi("Source power drift and temperature dependence.", "رانش توان منبع و وابستگی به دما."),
  bi("Model assumptions (weak guidance, scalar approximation, ideal geometry).", "فرضیات مدل (هدایت ضعیف، تقریب اسکالر، هندسه ایده‌آل)."),
];
