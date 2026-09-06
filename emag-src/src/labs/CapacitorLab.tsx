import { useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { EquationBox, Slider, Stat } from "../components/ui";
import { LineGraph } from "../components/Graph";
import { DiscoveryPanel, Trial } from "../components/Discovery";
import { PredictQuestion } from "../components/Predict";
import { EPS0, fmt } from "../data/constants";

const DIELECTRICS = [
  { name: "خلأ / هوا", k: 1 },
  { name: "کاغذ", k: 3.5 },
  { name: "شیشه", k: 5.5 },
  { name: "میکا", k: 6 },
  { name: "آب مقطر", k: 80 },
];

export default function CapacitorLab() {
  const [areaCm2, setAreaCm2] = useState(100); // cm^2
  const [dMm, setDMm] = useState(4); // mm
  const [voltage, setVoltage] = useState(9);
  const [dielIdx, setDielIdx] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [probeD, setProbeD] = useState(4);

  const A = areaCm2 * 1e-4; // m^2
  const d = dMm * 1e-3; // m
  const epsR = DIELECTRICS[dielIdx].k;
  const C = (EPS0 * epsR * A) / d;
  const Q = C * voltage;
  const Efield = voltage / d;
  const U = 0.5 * C * voltage * voltage;

  const gapPx = 30 + dMm * 14;
  const nCharges = Math.min(24, Math.max(4, Math.round(Math.abs(Q) * 5e11)));

  return (
    <LabLayout
      title="🔋 آزمایشگاه خازن صفحه‌ای"
      levelTag="سطح ۲ — Potential → Voltage → Energy"
      subtitle="مساحت صفحات، فاصله و دی‌الکتریک را تغییر بده و ببین ظرفیت، بار ذخیره‌شده، میدان و انرژی چطور تغییر می‌کنند."
      simulation={
        <svg viewBox="0 0 640 320" className="w-full rounded-xl bg-slate-950">
          <g transform={`translate(${320 - gapPx / 2 - 10}, 60)`}>
            <rect x={-10} y={0} width={10} height={200} fill="#94a3b8" />
            {Array.from({ length: nCharges }).map((_, i) => (
              <text key={i} x={-5} y={16 + i * (190 / nCharges)} textAnchor="middle" fontSize={14} fontWeight={800} fill="#f43f5e">
                +
              </text>
            ))}
          </g>
          <g transform={`translate(${320 + gapPx / 2}, 60)`}>
            <rect x={0} y={0} width={10} height={200} fill="#94a3b8" />
            {Array.from({ length: nCharges }).map((_, i) => (
              <text key={i} x={5} y={16 + i * (190 / nCharges)} textAnchor="middle" fontSize={14} fontWeight={800} fill="#3b82f6">
                −
              </text>
            ))}
          </g>
          {/* dielectric slab */}
          {dielIdx > 0 && (
            <rect
              x={320 - gapPx / 2 + 4}
              y={64}
              width={gapPx - 8}
              height={192}
              fill="#a78bfa"
              opacity={0.18}
              stroke="#a78bfa"
              strokeDasharray="4 3"
            />
          )}
          {/* field lines */}
          {Array.from({ length: 8 }).map((_, i) => {
            const y = 75 + i * 24;
            return (
              <line
                key={i}
                x1={320 - gapPx / 2 + 2}
                y1={y}
                x2={320 + gapPx / 2 - 2}
                y2={y}
                stroke="#38bdf8"
                strokeWidth={1.6}
                markerEnd="url(#cap-arrow)"
                opacity={0.8}
              />
            );
          })}
          <defs>
            <marker id="cap-arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
            </marker>
          </defs>
          <text x={320} y={44} textAnchor="middle" fontSize={11} fill="#94a3b8">
            فاصلهٔ صفحات d = {fmt(dMm, 3)} mm — دی‌الکتریک: {DIELECTRICS[dielIdx].name}
          </text>
          <text x={320} y={290} textAnchor="middle" fontSize={11} fill="#94a3b8">
            مساحت هر صفحه A = {fmt(areaCm2, 3)} cm²
          </text>
        </svg>
      }
      parameters={
        <>
          <Slider label="مساحت صفحات A" value={areaCm2} min={20} max={400} step={5} unit="cm²" onChange={setAreaCm2} color="sky" />
          <Slider label="فاصلهٔ صفحات d" value={dMm} min={0.5} max={15} step={0.1} unit="mm" onChange={setDMm} color="cyan" />
          <Slider label="ولتاژ باتری V" value={voltage} min={0} max={24} step={0.5} unit="V" onChange={setVoltage} color="amber" />
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300">جنس دی‌الکتریک (ε<sub>r</sub>)</span>
            <div className="flex flex-wrap gap-1.5">
              {DIELECTRICS.map((d2, i) => (
                <button
                  key={d2.name}
                  onClick={() => setDielIdx(i)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                    i === dielIdx ? "bg-violet-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {d2.name} (ε<sub>r</sub>={d2.k})
                </button>
              ))}
            </div>
          </div>
        </>
      }
      measurements={
        <>
          <Stat label="ظرفیت خازن C" value={fmt(C * 1e12, 3)} unit="pF" color="sky" />
          <Stat label="بار ذخیره‌شده Q" value={fmt(Q * 1e9, 3)} unit="nC" color="rose" />
          <Stat label="میدان بین صفحات E≈V/d" value={fmt(Efield, 3)} unit="V/m" color="cyan" />
          <Stat label="انرژی ذخیره‌شده U" value={fmt(U * 1e6, 3)} unit="µJ" color="emerald" />
        </>
      }
      equation={
        <div className="space-y-2">
          <EquationBox>C = ε·A / d</EquationBox>
          <EquationBox>Q = C·V</EquationBox>
          <EquationBox>U = ½·C·V²</EquationBox>
        </div>
      }
      graph={
        <LineGraph
          points={[{ x: voltage, y: U * 1e6 }]}
          curve={Array.from({ length: 30 }, (_, i) => {
            const v = (i / 29) * 24;
            return { x: v, y: 0.5 * C * v * v * 1e6 };
          })}
          xLabel="ولتاژ V (Volt)"
          yLabel="انرژی U (µJ)"
        />
      }
      extra={
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PredictQuestion
              question="اگر فاصلهٔ صفحات d را دو برابر کنیم (بقیه ثابت)، ظرفیت C چه می‌شود؟"
              options={["دو برابر می‌شود", "نصف می‌شود", "ثابت می‌ماند", "چهار برابر می‌شود"]}
              correctIndex={1}
              explanation="چون C با ۱/d رابطه دارد، دوبرابر کردن d باعث نصف‌شدن C می‌شود. اسلایدر d را امتحان کن."
            />
            <PredictQuestion
              question="اگر یک دی‌الکتریک با ε_r=5 بین صفحات بگذاریم، ظرفیت چند برابر می‌شود؟"
              options={["بدون تغییر", "۵ برابر", "نصف", "۲۵ برابر"]}
              correctIndex={1}
              explanation="C با ε_r نسبت مستقیم دارد، بنابراین دقیقاً ۵ برابر می‌شود؛ چون مولکول‌های دی‌الکتریک قطبیده شده و میدان خالص را کاهش می‌دهند و اجازه می‌دهند بار بیشتری در همان ولتاژ ذخیره شود."
            />
          </div>
          <DiscoveryPanel
            title="کشف رابطهٔ C و d"
            question="فاصلهٔ صفحات را تغییر بده و ثبت کن تا ببینی C چگونه با d تغییر می‌کند."
            xLabel="d (mm)"
            yLabel="C (pF)"
            trials={trials}
            onRecord={() => {
              const dd = probeD * 1e-3;
              const c = (EPS0 * epsR * A) / dd;
              setTrials((t) => [...t, { x: probeD, y: c * 1e12, label: `d=${probeD.toFixed(1)}mm` }]);
            }}
            onClear={() => setTrials([])}
            formula="C ∝ 1/d  ⇒  C = εA/d"
            hint="اگر d را دو برابر کنی، C باید دقیقاً نصف شود — این را در نمودار بررسی کن."
          >
            <Slider label="فاصلهٔ فرضی برای ثبت" value={probeD} min={0.5} max={15} step={0.1} unit="mm" onChange={setProbeD} color="violet" />
          </DiscoveryPanel>
        </>
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          <li>ظرفیت خازن فقط به هندسه (مساحت و فاصله) و جنس دی‌الکتریک بستگی دارد، نه به ولتاژ اعمالی.</li>
          <li>با ولتاژ ثابت، افزایش C باعث ذخیرهٔ بار بیشتر (Q=CV) می‌شود.</li>
          <li>انرژی ذخیره‌شده با مجذور ولتاژ رشد می‌کند (U ∝ V²)، پس دوبرابر کردن ولتاژ انرژی را چهار برابر می‌کند.</li>
          <li>دی‌الکتریک با کاهش میدان خالص بین صفحات، اجازه می‌دهد بار بیشتری با همان ولتاژ ذخیره شود.</li>
        </ul>
      }
      misconceptions={[
        "ظرفیت خازن به ولتاژ اعمالی بستگی ندارد؛ V فقط تعیین می‌کند چقدر بار در آن ظرفیت ذخیره می‌شود.",
        "میدان بین صفحات با فاصله از صفحات تغییر نمی‌کند (در تقریب صفحات موازی بزرگ)؛ فقط با d کل رابطه دارد نه فاصلهٔ محلی.",
        "افزایش دی‌الکتریک به معنی افزایش میدان نیست، بلکه دی‌الکتریک میدان خالص را کاهش می‌دهد ولی ظرفیت را افزایش می‌دهد.",
        "خازن کاملاً شارژ شده جریان DC پایدار را از خود عبور نمی‌دهد؛ فقط در حالت گذرا (شارژ/دشارژ) جریان برقرار است.",
      ]}
    />
  );
}
