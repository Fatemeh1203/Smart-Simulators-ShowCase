import { useMemo, useState } from "react";
import { Zap, Cable, Boxes, Radio, Trash2, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, XCircle, Gauge, Send } from "lucide-react";
import { useStore } from "../lib/store";
import { Panel, Slider, Select, Stat, Badge, Button, Callout, fmt, sci } from "../components/ui";
import { XYChart, AreaSpectrum } from "../components/Chart";
import * as P from "../lib/physics";
import { cn } from "../utils/cn";

export type BlockKind = "source" | "fiber" | "connector" | "splice" | "mechsplice" | "coupler" | "splitter" | "circulator" | "isolator" | "switch" | "filter" | "attenuator" | "polarizer" | "polcontroller" | "fbg" | "awg" | "mux" | "demux" | "edfa" | "raman" | "receiver";
export interface Block { id: string; kind: BlockKind; p: Record<string, number | string> }

const CAT: { id: string; icon: React.ReactNode; en: string; fa: string; items: { kind: BlockKind; en: string; fa: string; p: Record<string, number | string> }[] }[] = [
  { id: "src", icon: <Zap size={13} />, en: "Optical Sources", fa: "منابع نوری", items: [
    { kind: "source", en: "LED", fa: "LED", p: { type: "led", lambda: 850, power: -13, linewidth: 40, bitRate: 0.1 } },
    { kind: "source", en: "Fabry–Perot Laser", fa: "لیزر فابری–پرو", p: { type: "fp", lambda: 1310, power: 0, linewidth: 2, bitRate: 1 } },
    { kind: "source", en: "DFB Laser", fa: "لیزر DFB", p: { type: "dfb", lambda: 1550, power: 3, linewidth: 0.1, bitRate: 10 } },
    { kind: "source", en: "Tunable Laser", fa: "لیزر قابل تنظیم", p: { type: "tunable", lambda: 1550, power: 6, linewidth: 0.01, bitRate: 10 } },
    { kind: "source", en: "Pulse Source", fa: "منبع پالسی", p: { type: "pulse", lambda: 1550, power: 10, linewidth: 0.5, bitRate: 40 } },
  ] },
  { id: "fib", icon: <Cable size={13} />, en: "Optical Fiber", fa: "فیبر نوری", items: [
    { kind: "fiber", en: "Single-Mode G.652", fa: "تک‌مود G.652", p: { type: "smf", length: 20 } },
    { kind: "fiber", en: "Multimode 50/125 (GI)", fa: "چندمود 50/125", p: { type: "mmf50", length: 0.3 } },
    { kind: "fiber", en: "Multimode 62.5/125 (SI)", fa: "چندمود 62.5/125", p: { type: "mmf62", length: 0.3 } },
    { kind: "fiber", en: "Dispersion-Shifted G.653", fa: "DSF G.653", p: { type: "dsf", length: 20 } },
    { kind: "fiber", en: "NZ-DSF G.655", fa: "NZ-DSF G.655", p: { type: "nzdsf", length: 20 } },
    { kind: "fiber", en: "PM Fiber", fa: "فیبر حافظ قطبش", p: { type: "pmf", length: 0.01 } },
    { kind: "fiber", en: "Photonic Crystal Fiber", fa: "فیبر بلور فوتونی", p: { type: "pcf", length: 0.1 } },
    { kind: "fiber", en: "DCF (compensating)", fa: "DCF (جبران‌ساز)", p: { type: "dcf", length: 3 } },
  ] },
  { id: "cmp", icon: <Boxes size={13} />, en: "Optical Components", fa: "قطعات نوری", items: [
    { kind: "connector", en: "Connector", fa: "کانکتور", p: { loss: 0.4 } }, { kind: "splice", en: "Fusion Splice", fa: "اسپلایس فیوژن", p: { loss: 0.08 } }, { kind: "mechsplice", en: "Mechanical Splice", fa: "اسپلایس مکانیکی", p: { loss: 0.3 } },
    { kind: "coupler", en: "Coupler", fa: "کوپلر", p: { ratio: 50 } }, { kind: "splitter", en: "Splitter 1:N", fa: "اسپلیتر 1:N", p: { N: 8 } }, { kind: "circulator", en: "Circulator", fa: "سیرکولاتور", p: { loss: 0.8 } }, { kind: "isolator", en: "Isolator", fa: "ایزولاتور", p: { loss: 0.5 } },
    { kind: "switch", en: "Optical Switch", fa: "سوئیچ نوری", p: { loss: 1 } }, { kind: "filter", en: "Filter", fa: "فیلتر", p: { center: 1550, bw: 1, loss: 1 } }, { kind: "attenuator", en: "Attenuator", fa: "تضعیف‌کننده", p: { att: 5 } },
    { kind: "polarizer", en: "Polarizer", fa: "پلاریزر", p: { loss: 0.5 } }, { kind: "polcontroller", en: "Polarization Controller", fa: "کنترل‌کننده قطبش", p: { loss: 0.3 } }, { kind: "fbg", en: "Fiber Bragg Grating", fa: "توری براگ", p: { lambdaB: 1550, bw: 0.3, R: 90 } },
    { kind: "awg", en: "AWG", fa: "AWG", p: { loss: 4 } }, { kind: "mux", en: "WDM Mux", fa: "مالتی‌پلکسر WDM", p: { loss: 3 } }, { kind: "demux", en: "WDM Demux", fa: "دی‌مالتی‌پلکسر", p: { loss: 3 } },
    { kind: "edfa", en: "EDFA", fa: "EDFA", p: { gain: 20, nf: 5 } }, { kind: "raman", en: "Raman Amplifier", fa: "تقویت‌کننده رامان", p: { gain: 10, nf: 1 } },
  ] },
  { id: "rx", icon: <Radio size={13} />, en: "Optical Receivers", fa: "گیرنده‌های نوری", items: [
    { kind: "receiver", en: "PIN Photodiode", fa: "فتودیود PIN", p: { type: "pin", sens: -19, overload: 0, bw: 10 } },
    { kind: "receiver", en: "APD", fa: "APD", p: { type: "apd", sens: -28, overload: -6, bw: 10 } },
    { kind: "receiver", en: "Balanced Receiver", fa: "گیرنده متعادل", p: { type: "balanced", sens: -24, overload: -3, bw: 20 } },
    { kind: "receiver", en: "Coherent Receiver", fa: "گیرنده همدوس", p: { type: "coherent", sens: -38, overload: 0, bw: 32 } },
  ] },
];
export const itemMeta = (kind: BlockKind, type?: string | number) => { for (const c of CAT) for (const it of c.items) if (it.kind === kind && (type === undefined || it.p.type === type)) return it; return CAT[2].items[0]; };

export interface ChainResult { nodes: { id: string; label: string; power: number; osnr: number }[]; issues: { level: "error" | "warn" | "ok"; en: string; fa: string }[]; Prx: number; osnr: number; ber: number; totalLoss: number; length: number; lambda: number; margin: number; dispersionUI: number; bitRate: number; feasible: boolean; hasSource: boolean; hasRx: boolean; spectrum: { x: number; y: number }[]; }

export function simulateChain(chain: Block[], model: string): ChainResult {
  const issues: ChainResult["issues"] = [];
  const nodes: ChainResult["nodes"] = [];
  const src = chain.find((b) => b.kind === "source"), rx = chain.find((b) => b.kind === "receiver");
  const n = (v: number | string | undefined, d = 0) => (typeof v === "number" ? v : d);
  if (!src) issues.push({ level: "error", en: "No optical source — the bench needs a transmitter first.", fa: "منبع نوری وجود ندارد — میز ابتدا به فرستنده نیاز دارد." });
  if (!rx) issues.push({ level: "error", en: "No receiver at the end of the chain.", fa: "گیرنده‌ای در انتهای زنجیره نیست." });
  if (src && chain.indexOf(src) !== 0) issues.push({ level: "error", en: "Wrong connection: components placed before the source receive no light.", fa: "اتصال اشتباه: قطعات قبل از منبع نوری دریافت نمی‌کنند." });
  if (rx && chain.indexOf(rx) !== chain.length - 1) issues.push({ level: "error", en: "Wrong connection: components after the receiver are dead-ended.", fa: "اتصال اشتباه: قطعات بعد از گیرنده به بن‌بست می‌رسند." });
  if (chain.filter((b) => b.kind === "source").length > 1) issues.push({ level: "error", en: "Multiple sources in series — use a WDM mux/coupler topology instead.", fa: "چند منبع سری — به‌جای آن از توپولوژی mux/کوپلر WDM استفاده کنید." });
  const lambda = n(src?.p.lambda, 1550), lw = n(src?.p.linewidth, 0.1), bitRate = n(src?.p.bitRate, 10);
  let power = n(src?.p.power, 0);
  const aseMw = { v: 0 }; // accumulated ASE in 0.1nm (mW)
  let dispAcc = 0, length = 0, totalLoss = 0, modalLimited = false, unpolarized = src?.p.type === "led";
  nodes.push({ id: src?.id ?? "s", label: "Tx", power, osnr: 99 });
  for (const b of chain) {
    if (b.kind === "source") continue;
    const before = power;
    switch (b.kind) {
      case "fiber": {
        const L = n(b.p.length, 1); length += L; const t = String(b.p.type);
        let alpha = P.attenuationSpectrum(lambda, 0.5, model === "ideal" ? "ideal" : "realistic");
        if (t === "mmf50" || t === "mmf62") { alpha = lambda < 1000 ? 2.5 : 0.8; const dtNs = P.modalDispersion(1.48, t === "mmf62" ? 1.46 : 1.4775, L, t === "mmf50" ? "graded" : "step"); const bwMHz = 440 / dtNs; if (bwMHz < bitRate * 1000 * 0.7) { modalLimited = true; issues.push({ level: "error", en: `Modal dispersion limit: ${t} over ${L} km supports ≈ ${bwMHz.toFixed(0)} MHz < ${bitRate} Gb/s.`, fa: `حد پاشندگی مودی: ${t} روی ${L} km فقط ≈ ${bwMHz.toFixed(0)} MHz را پشتیبانی می‌کند < ${bitRate} Gb/s.` }); } if (lambda > 1400) issues.push({ level: "warn", en: "Unsuitable fiber: multimode fiber at 1550 nm is uncommon; use SMF for long-haul.", fa: "فیبر نامناسب: فیبر چندمود در ۱۵۵۰ nm رایج نیست؛ برای مسافت بلند از SMF استفاده کنید." }); }
        else if (t === "pcf") alpha = 5; else if (t === "dcf") alpha = 0.5; else if (t === "pmf") alpha = 1;
        if ((t === "smf" || t === "dsf" || t === "nzdsf") && lambda < 1260) { const V = P.vNumber(4.1, lambda, 0.12); if (V > 2.405) issues.push({ level: "warn", en: `Unsuitable wavelength: SMF is multimode at ${lambda} nm (V = ${V.toFixed(2)} > 2.405) → modal noise.`, fa: `طول موج نامناسب: SMF در ${lambda} nm چندمود است (V = ${V.toFixed(2)} > 2.405) ← نویز مودی.` }); }
        if (power > 17) issues.push({ level: "warn", en: `Excessive power: ${power.toFixed(1)} dBm launched into fiber → SBS/SPM nonlinear impairments.`, fa: `توان بیش از حد: ${power.toFixed(1)} dBm به فیبر تزریق شده ← اختلالات غیرخطی SBS/SPM.` });
        const D = t === "dcf" ? -80 : t === "mmf50" || t === "mmf62" || t === "pcf" || t === "pmf" ? 0 : P.fiberDispersion(t as "smf" | "dsf" | "nzdsf", lambda);
        dispAcc += D * L; power -= alpha * L; totalLoss += alpha * L; break; }
      case "connector": case "splice": case "mechsplice": case "circulator": case "isolator": case "switch": case "polcontroller": case "awg": case "mux": case "demux": {
        let l = n(b.p.loss, 0.5); if (model === "experimental" && (b.kind === "connector" || b.kind === "mechsplice")) l += 0.1; power -= l; totalLoss += l; break; }
      case "polarizer": { const l = n(b.p.loss, 0.5) + (unpolarized ? 3 : 0); unpolarized = false; power -= l; totalLoss += l; break; }
      case "attenuator": { power -= n(b.p.att, 5); totalLoss += n(b.p.att, 5); break; }
      case "coupler": { const l = -10 * Math.log10(n(b.p.ratio, 50) / 100) + 0.3; power -= l; totalLoss += l; break; }
      case "splitter": { const l = 10 * Math.log10(n(b.p.N, 8)) + 1; power -= l; totalLoss += l; break; }
      case "filter": { const c = n(b.p.center, 1550), bw = n(b.p.bw, 1); const l = n(b.p.loss, 1); if (Math.abs(lambda - c) > bw / 2) { power -= 40; totalLoss += 40; issues.push({ level: "error", en: `Wavelength mismatch: ${lambda} nm is outside the filter passband ${c} ± ${bw / 2} nm.`, fa: `عدم تطابق طول موج: ${lambda} nm خارج از گذرباند فیلتر ${c} ± ${bw / 2} nm است.` }); } else { power -= l; totalLoss += l; if (bw < (bitRate * 1e9 * lambda * lambda * 1e-18) / P.C * 1e9 * 2) issues.push({ level: "warn", en: "Bandwidth limitation: filter passband narrower than the modulated signal spectrum.", fa: "محدودیت پهنای باند: گذرباند فیلتر از طیف سیگنال مدوله‌شده باریک‌تر است." }); } break; }
      case "fbg": { const lb = n(b.p.lambdaB, 1550), bw = n(b.p.bw, 0.3), R = n(b.p.R, 90) / 100; if (Math.abs(lambda - lb) < bw / 2) { const l = -10 * Math.log10(1 - R + 1e-6); power -= l; totalLoss += l; issues.push({ level: "warn", en: `FBG reflects ${(R * 100).toFixed(0)}% at λ_B = ${lb} nm — the signal is inside the stop-band (transmission −${l.toFixed(1)} dB).`, fa: `FBG در λ_B = ${lb} nm حدود ${(R * 100).toFixed(0)}٪ بازتاب می‌کند — سیگنال داخل نوار توقف است (عبور −${l.toFixed(1)} dB).` }); } else { power -= 0.1; totalLoss += 0.1; } break; }
      case "edfa": case "raman": {
        const g = n(b.p.gain, 20), nf = n(b.p.nf, 5);
        if (b.kind === "edfa" && (lambda < 1525 || lambda > 1570)) { issues.push({ level: "error", en: `Wavelength mismatch: EDFA gain band is 1525–1570 nm; no gain at ${lambda} nm.`, fa: `عدم تطابق طول موج: باند بهره EDFA برابر ۱۵۲۵–۱۵۷۰ nm است؛ در ${lambda} nm بهره‌ای نیست.` }); power -= 2; totalLoss += 2; break; }
        if (power > -3) issues.push({ level: "warn", en: `Amplifier saturation: input ${power.toFixed(1)} dBm > −3 dBm — gain compresses.`, fa: `اشباع تقویت‌کننده: ورودی ${power.toFixed(1)} dBm > −3 dBm — بهره فشرده می‌شود.` });
        const gEff = Math.min(g, 23 - power); const G = P.dBm2mW(gEff); const hnu = P.H * P.C / (lambda * 1e-9) * 12.5e9 * 1e3;
        aseMw.v = aseMw.v * G + (P.dBm2mW(nf) * G - 1) / 2 * 2 * hnu; power += gEff; break; }
      case "receiver": break;
    }
    const osnr = aseMw.v > 0 ? 10 * Math.log10(P.dBm2mW(power) / aseMw.v) : 99;
    nodes.push({ id: b.id, label: itemMeta(b.kind, b.p.type)[ "en" ], power, osnr });
    void before;
  }
  const Prx = power; const osnr = aseMw.v > 0 ? 10 * Math.log10(P.dBm2mW(Prx) / aseMw.v) : 99;
  let margin = NaN, ber = NaN, dispersionUI = 0;
  if (rx) {
    const sens = n(rx.p.sens, -20), overload = n(rx.p.overload, 0), rbw = n(rx.p.bw, 10);
    margin = Prx - sens;
    if (Prx < sens) issues.push({ level: "error", en: `Excessive loss: received ${Prx.toFixed(1)} dBm is below sensitivity ${sens} dBm (margin ${margin.toFixed(1)} dB).`, fa: `افت توان بیش از حد: توان دریافتی ${Prx.toFixed(1)} dBm کمتر از حساسیت ${sens} dBm است (حاشیه ${margin.toFixed(1)} dB).` });
    else if (margin < 3) issues.push({ level: "warn", en: `Low margin: only ${margin.toFixed(1)} dB above sensitivity (aim ≥ 3 dB).`, fa: `حاشیه کم: فقط ${margin.toFixed(1)} dB بالاتر از حساسیت (هدف ≥ 3 dB).` });
    if (Prx > overload) issues.push({ level: "error", en: `Receiver saturation: ${Prx.toFixed(1)} dBm exceeds overload ${overload} dBm — add an attenuator.`, fa: `اشباع گیرنده: ${Prx.toFixed(1)} dBm از حد اضافه‌بار ${overload} dBm بیشتر است — تضعیف‌کننده اضافه کنید.` });
    if (rbw < 0.7 * bitRate) issues.push({ level: "error", en: `Bandwidth limitation: receiver ${rbw} GHz < 0.7 × ${bitRate} Gb/s.`, fa: `محدودیت پهنای باند: گیرنده ${rbw} GHz < 0.7 × ${bitRate} Gb/s.` });
    const dl = Math.max(lw, (bitRate * 1e9 * Math.pow(lambda * 1e-9, 2)) / P.C * 1e9);
    dispersionUI = Math.abs(dispAcc) * dl * bitRate * 1e-3;
    if (rx.p.type !== "coherent" && dispersionUI > 0.25) issues.push({ level: "error", en: `Dispersion limitation: |D·L|·Δλ·B = ${(dispersionUI * 100).toFixed(0)}% of the bit period (> 25%). Reduce length/Δλ, add DCF, or use coherent detection.`, fa: `محدودیت پاشندگی: |D·L|·Δλ·B = ${(dispersionUI * 100).toFixed(0)}٪ بازه بیت (> ۲۵٪). طول/Δλ را کم کنید، DCF بیفزایید یا از آشکارسازی همدوس استفاده کنید.` });
    if (osnr < 12 + 10 * Math.log10(bitRate / 10)) issues.push({ level: "error", en: `OSNR too low: ${osnr.toFixed(1)} dB (need ≈ ${(12 + 10 * Math.log10(bitRate / 10)).toFixed(0)} dB for ${bitRate} Gb/s).`, fa: `OSNR بسیار کم: ${osnr.toFixed(1)} dB (برای ${bitRate} Gb/s حدود ${(12 + 10 * Math.log10(bitRate / 10)).toFixed(0)} dB لازم است).` });
    const rxType = rx.p.type === "coherent" ? "coherent" : rx.p.type === "apd" ? "apd" : "pin";
    const perf = P.receiverPerformance({ type: rxType as P.RxType, PrDbm: Prx, R: 0.9, M: 10, x: 0.7, bwGHz: 0.75 * bitRate, Id: 5, T: 300, RL: rxType === "pin" ? 500 : 50, extinction: 10, format: "nrz" });
    const qOsnr = osnr < 90 ? Math.sqrt(P.dBm2mW(osnr) * 12.5 / (bitRate * 0.75)) : Infinity;
    const Q = Math.min(perf.Q, qOsnr) * (modalLimited ? 0.3 : 1) * (dispersionUI > 0.25 && rx.p.type !== "coherent" ? 0.4 : 1);
    ber = P.berFromQ(Q);
  }
  if (!issues.length) issues.push({ level: "ok", en: "No physical issues detected — link is valid.", fa: "هیچ مشکل فیزیکی یافت نشد — لینک معتبر است." });
  const spectrum = src ? P.sourceSpectrum({ type: (src.p.type as "led") ?? "dfb", lambda, power: Prx, linewidthNm: lw, modFreqGHz: bitRate, modDepth: 0.8, model: "ideal", noiseFloor: aseMw.v > 0 ? P.mW2dBm(aseMw.v) : -70 }) : [];
  return { nodes, issues, Prx, osnr, ber, totalLoss, length, lambda, margin, dispersionUI, bitRate, feasible: !issues.some((i) => i.level === "error"), hasSource: !!src, hasRx: !!rx, spectrum };
}

const paramDefs: Record<string, { key: string; en: string; fa: string; min: number; max: number; step: number; unit?: string }[]> = {
  source: [{ key: "lambda", en: "Wavelength", fa: "طول موج", min: 800, max: 1650, step: 1, unit: "nm" }, { key: "power", en: "Optical power", fa: "توان نوری", min: -20, max: 20, step: 0.5, unit: "dBm" }, { key: "linewidth", en: "Linewidth", fa: "پهنای خط", min: 0.001, max: 60, step: 0.001, unit: "nm" }, { key: "bitRate", en: "Bit rate / modulation", fa: "نرخ بیت / مدولاسیون", min: 0.1, max: 100, step: 0.1, unit: "Gb/s" }],
  fiber: [{ key: "length", en: "Length", fa: "طول", min: 0.001, max: 200, step: 0.001, unit: "km" }],
  connector: [{ key: "loss", en: "Loss", fa: "تلفات", min: 0.1, max: 2, step: 0.05, unit: "dB" }], splice: [{ key: "loss", en: "Loss", fa: "تلفات", min: 0.01, max: 0.5, step: 0.01, unit: "dB" }], mechsplice: [{ key: "loss", en: "Loss", fa: "تلفات", min: 0.1, max: 1, step: 0.05, unit: "dB" }],
  coupler: [{ key: "ratio", en: "Through ratio", fa: "نسبت عبور", min: 1, max: 99, step: 1, unit: "%" }], splitter: [{ key: "N", en: "Ports N", fa: "تعداد پورت N", min: 2, max: 64, step: 1 }],
  circulator: [{ key: "loss", en: "Insertion loss", fa: "تلفات درج", min: 0.3, max: 2, step: 0.1, unit: "dB" }], isolator: [{ key: "loss", en: "Insertion loss", fa: "تلفات درج", min: 0.2, max: 2, step: 0.1, unit: "dB" }], switch: [{ key: "loss", en: "Insertion loss", fa: "تلفات درج", min: 0.3, max: 3, step: 0.1, unit: "dB" }],
  filter: [{ key: "center", en: "Center λ", fa: "λ مرکزی", min: 800, max: 1650, step: 0.1, unit: "nm" }, { key: "bw", en: "Passband", fa: "گذرباند", min: 0.1, max: 50, step: 0.1, unit: "nm" }, { key: "loss", en: "Insertion loss", fa: "تلفات درج", min: 0.2, max: 5, step: 0.1, unit: "dB" }],
  attenuator: [{ key: "att", en: "Attenuation", fa: "تضعیف", min: 0, max: 40, step: 0.5, unit: "dB" }], polarizer: [{ key: "loss", en: "Loss", fa: "تلفات", min: 0.2, max: 2, step: 0.1, unit: "dB" }], polcontroller: [{ key: "loss", en: "Loss", fa: "تلفات", min: 0.1, max: 1, step: 0.1, unit: "dB" }],
  fbg: [{ key: "lambdaB", en: "Bragg λ", fa: "λ براگ", min: 1200, max: 1650, step: 0.1, unit: "nm" }, { key: "bw", en: "Bandwidth", fa: "پهنای باند", min: 0.05, max: 5, step: 0.05, unit: "nm" }, { key: "R", en: "Reflectivity", fa: "بازتاب", min: 1, max: 99.9, step: 0.1, unit: "%" }],
  awg: [{ key: "loss", en: "Insertion loss", fa: "تلفات درج", min: 2, max: 8, step: 0.1, unit: "dB" }], mux: [{ key: "loss", en: "Insertion loss", fa: "تلفات درج", min: 1, max: 6, step: 0.1, unit: "dB" }], demux: [{ key: "loss", en: "Insertion loss", fa: "تلفات درج", min: 1, max: 6, step: 0.1, unit: "dB" }],
  edfa: [{ key: "gain", en: "Gain", fa: "بهره", min: 5, max: 35, step: 0.5, unit: "dB" }, { key: "nf", en: "Noise figure", fa: "عدد نویز", min: 3, max: 8, step: 0.1, unit: "dB" }], raman: [{ key: "gain", en: "On-off gain", fa: "بهره", min: 3, max: 20, step: 0.5, unit: "dB" }, { key: "nf", en: "Eff. noise figure", fa: "عدد نویز مؤثر", min: -2, max: 5, step: 0.1, unit: "dB" }],
  receiver: [{ key: "sens", en: "Sensitivity", fa: "حساسیت", min: -45, max: -10, step: 0.5, unit: "dBm" }, { key: "overload", en: "Overload", fa: "اضافه‌بار", min: -15, max: 10, step: 0.5, unit: "dBm" }, { key: "bw", en: "Bandwidth", fa: "پهنای باند", min: 0.1, max: 70, step: 0.1, unit: "GHz" }],
};

const kindColor: Record<BlockKind, string> = { source: "from-amber-400 to-orange-500", fiber: "from-sky-400 to-blue-600", receiver: "from-emerald-400 to-teal-600", edfa: "from-violet-400 to-purple-600", raman: "from-violet-400 to-fuchsia-600", connector: "from-slate-400 to-slate-600", splice: "from-slate-400 to-slate-600", mechsplice: "from-slate-400 to-slate-600", coupler: "from-cyan-400 to-cyan-600", splitter: "from-cyan-400 to-cyan-600", circulator: "from-pink-400 to-rose-600", isolator: "from-pink-400 to-rose-600", switch: "from-pink-400 to-rose-600", filter: "from-lime-400 to-green-600", attenuator: "from-red-400 to-rose-600", polarizer: "from-indigo-400 to-indigo-600", polcontroller: "from-indigo-400 to-indigo-600", fbg: "from-lime-400 to-emerald-600", awg: "from-teal-400 to-cyan-600", mux: "from-teal-400 to-cyan-600", demux: "from-teal-400 to-cyan-600" };

export const defaultChain = (): Block[] => [
  { id: "b1", kind: "source", p: { type: "dfb", lambda: 1550, power: 3, linewidth: 0.1, bitRate: 10 } }, { id: "b2", kind: "connector", p: { loss: 0.4 } }, { id: "b3", kind: "fiber", p: { type: "smf", length: 40 } }, { id: "b4", kind: "splice", p: { loss: 0.08 } }, { id: "b5", kind: "fiber", p: { type: "smf", length: 40 } }, { id: "b6", kind: "connector", p: { loss: 0.4 } }, { id: "b7", kind: "receiver", p: { type: "apd", sens: -28, overload: -6, bw: 10 } },
];

export function FreeLab({ chain, setChain }: { chain: Block[]; setChain: (c: Block[]) => void }) {
  const { lang, t, model, assignments, activeAssignment, addSubmission, setActiveAssignment } = useStore();
  const [sel, setSel] = useState<string | null>(chain[2]?.id ?? null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const res = useMemo(() => simulateChain(chain, model), [chain, model]);
  const assignment = assignments.find((a) => a.id === activeAssignment);
  const disabled = new Set(assignment?.disabled ?? []);
  const addAt = (kind: BlockKind, p: Record<string, number | string>, idx?: number) => { const b: Block = { id: Math.random().toString(36).slice(2, 8), kind, p: { ...p } }; const c = [...chain]; c.splice(idx ?? chain.length, 0, b); setChain(c); setSel(b.id); };
  const move = (id: string, dir: -1 | 1) => { const i = chain.findIndex((b) => b.id === id); const j = i + dir; if (j < 0 || j >= chain.length) return; const c = [...chain]; [c[i], c[j]] = [c[j], c[i]]; setChain(c); };
  const remove = (id: string) => { setChain(chain.filter((b) => b.id !== id)); if (sel === id) setSel(null); };
  const update = (id: string, k: string, v: number | string) => setChain(chain.map((b) => (b.id === id ? { ...b, p: { ...b.p, [k]: v } } : b)));
  const cur = chain.find((b) => b.id === sel);
  const onDrop = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOver(null); const raw = e.dataTransfer.getData("text/plain"); if (!raw) return; const d = JSON.parse(raw) as { kind: BlockKind; p: Record<string, number | string>; moveId?: string }; if (d.moveId) { const i = chain.findIndex((b) => b.id === d.moveId); if (i < 0) return; const c = [...chain]; const [it] = c.splice(i, 1); c.splice(idx > i ? idx - 1 : idx, 0, it); setChain(c); } else addAt(d.kind, d.p, idx); };
  const grade = () => {
    if (!assignment) return;
    const metrics: Record<string, number> = { Prx: res.Prx, length: res.length, lambda: res.lambda, margin: res.margin, osnr: res.osnr, log10BER: Math.log10(Math.max(res.ber, 1e-30)), totalLoss: res.totalLoss, bitRate: res.bitRate, components: chain.length, errors: res.issues.filter((i) => i.level === "error").length };
    const details = assignment.constraints.map((c) => { const v = metrics[c.key]; const pass = c.op === ">=" ? v >= c.value : c.op === "<=" ? v <= c.value : Math.abs(v - c.value) <= Math.abs(c.value) * 0.02 + 1e-9; return { label: `${c.label}: ${c.key} ${c.op} ${c.value} (${Number.isFinite(v) ? v.toFixed(2) : "—"})`, pass }; });
    const passRatio = details.length ? details.filter((d) => d.pass).length / details.length : 1;
    const score = Math.round(passRatio * 70 + (res.feasible ? 30 : Math.max(0, 30 - metrics.errors * 10)));
    addSubmission({ id: Math.random().toString(36).slice(2, 8), assignmentId: assignment.id, time: new Date().toISOString(), design: chain, metrics, score, details });
    alert((lang === "fa" ? "طراحی ارسال شد. نمره: " : "Design submitted. Score: ") + score + "/100");
  };
  const powerData = res.nodes.map((nd, i) => ({ x: i, P: +nd.power.toFixed(2) }));
  return (
    <div className="space-y-4">
      {assignment && (
        <Callout tone="info" title={<span className="flex items-center justify-between w-full"><span>📋 {assignment.title}</span><button className="text-[10px] underline" onClick={() => setActiveAssignment(null)}>{t("clear")}</button></span>}>
          <div className="mb-2">{assignment.description}</div>
          <div className="flex flex-wrap gap-1.5 mb-2">{assignment.constraints.map((c, i) => <Badge key={i} tone="violet">{c.label}: {c.key} {c.op} {c.value}</Badge>)}{assignment.timeLimit > 0 && <Badge tone="warn">⏱ {assignment.timeLimit} min</Badge>}</div>
          <Button size="sm" onClick={grade}><Send size={12} />{t("submit")}</Button>
        </Callout>
      )}
      <div className="grid lg:grid-cols-4 gap-4">
        <Panel title={t("equipmentPanel")} icon={<Boxes size={14} />} className="lg:row-span-2 max-h-[720px] overflow-y-auto scrollbar-thin">
          <div className="text-[10px] muted mb-2">{t("dragHint")}</div>
          {CAT.map((c) => (
            <div key={c.id} className="mb-3">
              <div className="text-[11px] font-semibold flex items-center gap-1.5 mb-1.5 text-brand-500">{c.icon}{lang === "fa" ? c.fa : c.en}</div>
              <div className="grid grid-cols-1 gap-1">
                {c.items.map((it, i) => { const dis = disabled.has(it.kind) || disabled.has(String(it.p.type)); return (
                  <button key={i} draggable={!dis} disabled={dis} onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ kind: it.kind, p: it.p }))} onClick={() => addAt(it.kind, it.p, it.kind === "source" ? 0 : it.kind === "receiver" ? chain.length : Math.max(1, chain.length - (res.hasRx ? 1 : 0)))} className={cn("text-start text-[11px] px-2 py-1.5 rounded-lg border border-line hover:border-brand-400 hover:bg-brand-500/5 transition flex items-center gap-2 cursor-grab active:cursor-grabbing", dis && "opacity-40 cursor-not-allowed")}>
                    <span className={cn("w-2 h-2 rounded-sm bg-gradient-to-br", kindColor[it.kind])} />{lang === "fa" ? it.fa : it.en}
                  </button>
                ); })}
              </div>
            </div>
          ))}
        </Panel>
        <Panel title={t("opticalSetup")} icon={<Cable size={14} />} className="lg:col-span-3" right={<Badge tone={res.feasible ? "good" : "bad"}>{res.feasible ? t("feasible") : t("infeasible")}</Badge>}>
          <div className="flex items-stretch gap-0 overflow-x-auto scrollbar-thin py-3 min-h-[120px] ltr" onDragOver={(e) => e.preventDefault()}>
            {chain.length === 0 && <div onDragOver={(e) => { e.preventDefault(); setDragOver(0); }} onDrop={(e) => onDrop(e, 0)} className="flex-1 border-2 border-dashed border-line rounded-xl flex items-center justify-center text-xs muted">{t("dragHint")}</div>}
            {chain.map((b, i) => { const meta = itemMeta(b.kind, b.p.type); const node = res.nodes[i]; return (
              <div key={b.id} className="flex items-center">
                <div onDragOver={(e) => { e.preventDefault(); setDragOver(i); }} onDragLeave={() => setDragOver(null)} onDrop={(e) => onDrop(e, i)} className={cn("w-4 h-20 self-center rounded transition-colors", dragOver === i ? "bg-brand-500/40 w-8" : "")} />
                <div draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ kind: b.kind, p: b.p, moveId: b.id }))} onClick={() => setSel(b.id)} className={cn("relative w-[92px] shrink-0 rounded-xl p-2 text-white cursor-pointer bg-gradient-to-br shadow-md transition-transform hover:-translate-y-0.5", kindColor[b.kind], sel === b.id && "ring-2 ring-offset-2 ring-brand-500 ring-offset-transparent")}>
                  <div className="text-[10px] font-semibold leading-tight h-7 overflow-hidden">{lang === "fa" ? meta.fa : meta.en}</div>
                  <div className="num text-[9px] opacity-90 mt-1">{b.kind === "fiber" ? `${b.p.length} km` : b.kind === "source" ? `${b.p.lambda} nm` : b.kind === "receiver" ? `${b.p.sens} dBm` : b.kind === "edfa" || b.kind === "raman" ? `+${b.p.gain} dB` : b.kind === "splitter" ? `1:${b.p.N}` : b.kind === "fbg" ? `${b.p.lambdaB} nm` : b.kind === "attenuator" ? `−${b.p.att} dB` : b.p.loss !== undefined ? `−${b.p.loss} dB` : ""}</div>
                  {node && <div className="num text-[9px] mt-1 bg-black/25 rounded px-1 inline-block">{node.power.toFixed(1)} dBm</div>}
                </div>
                {i < chain.length - 1 && <svg width="26" height="20" className="shrink-0"><line x1="0" y1="10" x2="26" y2="10" stroke={res.nodes[i]?.power > -60 ? "#f59e0b" : "#64748b"} strokeWidth="2.5" className="flow" /></svg>}
              </div>
            ); })}
            {chain.length > 0 && <div onDragOver={(e) => { e.preventDefault(); setDragOver(chain.length); }} onDragLeave={() => setDragOver(null)} onDrop={(e) => onDrop(e, chain.length)} className={cn("min-w-[40px] flex-1 h-20 self-center rounded-xl border-2 border-dashed border-line/60 transition-colors", dragOver === chain.length && "bg-brand-500/20 border-brand-400")} />}
          </div>
          <div className="text-[10px] muted">{lang === "fa" ? "Source → Fiber → Components → Receiver. برای ویرایش روی یک بلوک کلیک کنید؛ برای جابه‌جایی بکشید." : "Source → Fiber → Components → Receiver. Click a block to edit; drag to reorder."}</div>
        </Panel>
        <Panel title={t("parameters")} icon={<Gauge size={14} />} className="lg:col-span-1">
          {!cur ? <div className="text-xs muted py-6 text-center">{lang === "fa" ? "یک قطعه را انتخاب کنید" : "Select a component"}</div> : (
            <div className="space-y-3">
              <div className="flex items-center justify-between"><Badge>{lang === "fa" ? itemMeta(cur.kind, cur.p.type).fa : itemMeta(cur.kind, cur.p.type).en}</Badge><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => move(cur.id, -1)}><ChevronLeft size={12} /></Button><Button size="sm" variant="ghost" onClick={() => move(cur.id, 1)}><ChevronRight size={12} /></Button><Button size="sm" variant="danger" onClick={() => remove(cur.id)}><Trash2 size={12} /></Button></div></div>
              {cur.kind === "source" && <Select label={lang === "fa" ? "نوع" : "Type"} value={String(cur.p.type)} onChange={(v) => update(cur.id, "type", v)} options={CAT[0].items.map((it) => ({ value: String(it.p.type), label: lang === "fa" ? it.fa : it.en }))} />}
              {cur.kind === "fiber" && <Select label={lang === "fa" ? "نوع" : "Type"} value={String(cur.p.type)} onChange={(v) => update(cur.id, "type", v)} options={CAT[1].items.map((it) => ({ value: String(it.p.type), label: lang === "fa" ? it.fa : it.en }))} />}
              {cur.kind === "receiver" && <Select label={lang === "fa" ? "نوع" : "Type"} value={String(cur.p.type)} onChange={(v) => { const it = CAT[3].items.find((x) => x.p.type === v)!; setChain(chain.map((b) => (b.id === cur.id ? { ...b, p: { ...it.p } } : b))); }} options={CAT[3].items.map((it) => ({ value: String(it.p.type), label: lang === "fa" ? it.fa : it.en }))} />}
              {(paramDefs[cur.kind] ?? []).map((pd) => <Slider key={pd.key} label={lang === "fa" ? pd.fa : pd.en} value={Number(cur.p[pd.key] ?? pd.min)} min={pd.min} max={pd.max} step={pd.step} unit={pd.unit} onChange={(v) => update(cur.id, pd.key, v)} fmt={(v) => (pd.step < 0.01 ? v.toFixed(3) : v % 1 === 0 ? String(v) : v.toFixed(2))} />)}
            </div>
          )}
        </Panel>
        <Panel title={t("warnings")} icon={<AlertTriangle size={14} />} className="lg:col-span-2">
          <ul className="space-y-1.5 text-xs">{res.issues.map((is, i) => <li key={i} className={cn("flex gap-2 items-start rounded-lg px-2.5 py-1.5", is.level === "error" ? "bg-rose-500/10 text-rose-600 dark:text-rose-300" : is.level === "warn" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")}>{is.level === "error" ? <XCircle size={14} className="shrink-0 mt-0.5" /> : is.level === "warn" ? <AlertTriangle size={14} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={14} className="shrink-0 mt-0.5" />}<span>{lang === "fa" ? is.fa : is.en}</span></li>)}</ul>
        </Panel>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title={t("instruments")} icon={<Gauge size={14} />}>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Power meter (Rx)" value={fmt(res.Prx, 2)} unit="dBm" tone="brand" sub={`${(P.dBm2mW(res.Prx) * 1000).toPrecision(3)} µW`} /><Stat label={lang === "fa" ? "تلفات کل" : "Total loss"} value={fmt(res.totalLoss, 2)} unit="dB" />
            <Stat label={lang === "fa" ? "حاشیه" : "Margin"} value={fmt(res.margin, 2)} unit="dB" tone={res.margin >= 3 ? "good" : res.margin >= 0 ? "warn" : "bad"} /><Stat label="OSNR" value={res.osnr > 90 ? "∞" : fmt(res.osnr, 1)} unit="dB" />
            <Stat label="BER (est.)" value={sci(res.ber)} tone={res.ber < 1e-9 ? "good" : res.ber < 1e-3 ? "warn" : "bad"} /><Stat label={lang === "fa" ? "پاشندگی" : "Dispersion"} value={fmt(res.dispersionUI * 100, 0)} unit="% UI" tone={res.dispersionUI < 0.25 ? "good" : "bad"} />
            <Stat label={lang === "fa" ? "طول کل" : "Total length"} value={fmt(res.length, 2)} unit="km" /><Stat label="λ / B" value={`${res.lambda} nm / ${res.bitRate} G`} />
          </div>
        </Panel>
        <Panel title={lang === "fa" ? "توان در طول مسیر" : "Power along the path"}><XYChart data={powerData} series={[{ key: "P", name: "P (dBm)" }]} xLabel="node" yLabel="dBm" height={200} brush={false} refY={chain.find((b) => b.kind === "receiver") ? [{ y: Number(chain.find((b) => b.kind === "receiver")!.p.sens), label: "sens" }] : []} /></Panel>
        <Panel title="OSA @ receiver">{res.spectrum.length ? <AreaSpectrum data={res.spectrum} xLabel="λ (nm)" yLabel="dBm" height={200} yDomain={[-75, 20]} /> : <div className="text-xs muted py-8 text-center">—</div>}</Panel>
      </div>
    </div>
  );
}
