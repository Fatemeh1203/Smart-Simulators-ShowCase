import { useEffect, useRef, useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { Button, EquationBox, Slider, Stat } from "../components/ui";
import { LineGraph } from "../components/Graph";
import { DiscoveryPanel, Trial } from "../components/Discovery";
import { PredictQuestion } from "../components/Predict";
import { fmt } from "../data/constants";

export default function CircuitLab() {
  const [mode, setMode] = useState<"ohm" | "rc">("ohm");

  // --- Ohm's law state ---
  const [ohmV, setOhmV] = useState(9);
  const [ohmR, setOhmR] = useState(300);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [probeV, setProbeV] = useState(9);

  // --- RC circuit state ---
  const [rcV, setRcV] = useState(9);
  const [rcRk, setRcRk] = useState(10); // kΩ
  const [rcCu, setRcCu] = useState(220); // µF
  const [charging, setCharging] = useState(true);
  const [running, setRunning] = useState(true);
  const [tau, setTau] = useState(0);
  const [vStart, setVStart] = useState(0);
  const [history, setHistory] = useState<{ tau: number; v: number }[]>([]);
  const rafRef = useRef<number | undefined>(undefined);

  const R = rcRk * 1000;
  const C = rcCu * 1e-6;
  const RC = R * C;

  const ohmI = ohmV / ohmR;

  useEffect(() => {
    let last = performance.now();
    function tick(t: number) {
      const dt = (t - last) / 1000;
      last = t;
      if (running) {
        setTau((tt) => Math.min(tt + dt, 6));
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [running]);

  const Vc = charging ? vStart + (rcV - vStart) * (1 - Math.exp(-tau)) : vStart * Math.exp(-tau);

  useEffect(() => {
    setHistory((h) => [...h.filter((p) => p.tau < tau), { tau, v: Vc }].slice(-200));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tau]);

  function toggleSwitch(next: boolean) {
    setVStart(Vc);
    setCharging(next);
    setTau(0);
    setHistory([]);
  }

  const plateFillPct = Math.min(100, Math.max(0, (Vc / rcV) * 100));

  return (
    <LabLayout
      title="🔌 آزمایشگاه مدار و میدان الکتریکی"
      levelTag="سطح ۶ — جمع‌بندی: مدار، بار، میدان و القا"
      subtitle="ارتباط بین بار، ولتاژ، مقاومت و خازن را در یک مدار واقعی ببین — از قانون اهم تا شارژ و دشارژ خازن."
      headerExtra={
        <div className="flex gap-2">
          <Button active={mode === "ohm"} onClick={() => setMode("ohm")}>مدار مقاومتی (اهم)</Button>
          <Button active={mode === "rc"} onClick={() => setMode("rc")}>مدار RC</Button>
        </div>
      }
      simulation={
        mode === "ohm" ? (
          <svg viewBox="0 0 640 260" className="w-full rounded-xl bg-slate-950">
            <rect x={80} y={60} width={480} height={140} fill="none" stroke="#334155" strokeWidth={2} rx={8} />
            <g transform="translate(80,100)">
              <line x1={0} y1={30} x2={20} y2={30} stroke="#94a3b8" strokeWidth={3} />
              <line x1={20} y1={10} x2={20} y2={50} stroke="#f59e0b" strokeWidth={4} />
              <line x1={26} y1={20} x2={26} y2={40} stroke="#f59e0b" strokeWidth={2.5} />
              <text x={13} y={5} fontSize={10} fill="#f59e0b">+</text>
              <text x={30} y={65} fontSize={10} fill="#94a3b8">باتری V={fmt(ohmV, 2)}V</text>
            </g>
            {/* resistor zigzag */}
            <polyline points="300,100 310,80 325,120 340,80 355,120 370,80 380,100" fill="none" stroke="#38bdf8" strokeWidth={3} />
            <text x={340} y={65} textAnchor="middle" fontSize={10} fill="#38bdf8">R = {fmt(ohmR, 3)} Ω</text>
            {/* ammeter */}
            <circle cx={480} cy={100} r={20} fill="#0f172a" stroke="#facc15" strokeWidth={2} />
            <text x={480} y={104} textAnchor="middle" fontSize={10} fill="#facc15">A</text>
            <text x={480} y={135} textAnchor="middle" fontSize={10} fill="#94a3b8">{fmt(ohmI * 1000, 3)} mA</text>
            {/* wires */}
            <line x1={100} y1={100} x2={300} y2={100} stroke="#64748b" strokeWidth={2} />
            <line x1={380} y1={100} x2={460} y2={100} stroke="#64748b" strokeWidth={2} />
            <line x1={500} y1={100} x2={560} y2={100} stroke="#64748b" strokeWidth={2} />
            <line x1={560} y1={100} x2={560} y2={180} stroke="#64748b" strokeWidth={2} />
            <line x1={560} y1={180} x2={100} y2={180} stroke="#64748b" strokeWidth={2} />
            <line x1={100} y1={180} x2={100} y2={130} stroke="#64748b" strokeWidth={2} />
            {/* voltmeter across R */}
            <circle cx={340} cy={170} r={16} fill="#0f172a" stroke="#22d3ee" strokeWidth={2} />
            <text x={340} y={174} textAnchor="middle" fontSize={9} fill="#22d3ee">V</text>
            <line x1={310} y1={110} x2={324} y2={162} stroke="#22d3ee" strokeWidth={1} strokeDasharray="3 2" />
            <line x1={370} y1={110} x2={356} y2={162} stroke="#22d3ee" strokeWidth={1} strokeDasharray="3 2" />
          </svg>
        ) : (
          <svg viewBox="0 0 640 260" className="w-full rounded-xl bg-slate-950">
            <text x={320} y={20} textAnchor="middle" fontSize={10} fill="#64748b">t / RC = {fmt(tau, 3)}   (RC = {fmt(RC, 3)} s)</text>
            <line x1={80} y1={130} x2={200} y2={130} stroke="#64748b" strokeWidth={2} />
            <g transform="translate(80,100)">
              <line x1={-30} y1={30} x2={0} y2={30} stroke="#94a3b8" strokeWidth={0} />
              <line x1={0} y1={10} x2={0} y2={50} stroke="#f59e0b" strokeWidth={4} />
              <line x1={6} y1={20} x2={6} y2={40} stroke="#f59e0b" strokeWidth={2.5} />
              <text x={16} y={65} fontSize={10} fill="#f59e0b">V={fmt(rcV, 2)}V</text>
            </g>
            {/* switch */}
            <circle cx={200} cy={130} r={4} fill="#94a3b8" />
            <line x1={200} y1={130} x2={charging ? 250 : 240} y2={charging ? 110 : 155} stroke="#facc15" strokeWidth={3} />
            <circle cx={250} cy={110} r={4} fill="#94a3b8" />
            <text x={225} y={95} fontSize={9} fill="#facc15" textAnchor="middle">شارژ</text>
            <text x={225} y={172} fontSize={9} fill="#94a3b8" textAnchor="middle">دشارژ</text>
            <line x1={250} y1={110} x2={330} y2={110} stroke="#64748b" strokeWidth={2} />
            {/* resistor */}
            <polyline points="330,110 340,95 355,125 370,95 385,125 400,95 410,110" fill="none" stroke="#38bdf8" strokeWidth={3} />
            <text x={370} y={80} textAnchor="middle" fontSize={10} fill="#38bdf8">R={fmt(rcRk, 3)}kΩ</text>
            <line x1={410} y1={110} x2={480} y2={110} stroke="#64748b" strokeWidth={2} />
            {/* capacitor */}
            <line x1={480} y1={80} x2={480} y2={140} stroke="#f43f5e" strokeWidth={4} />
            <line x1={496} y1={80} x2={496} y2={140} stroke="#3b82f6" strokeWidth={4} />
            <text x={488} y={155} textAnchor="middle" fontSize={10} fill="#94a3b8">C={fmt(rcCu, 3)}µF</text>
            <rect x={480} y={80} width={16} height={Math.max(2, 60 * (plateFillPct / 100))} fill="#facc15" opacity={0.35} />
            <line x1={496} y1={110} x2={560} y2={110} stroke="#64748b" strokeWidth={2} />
            <line x1={560} y1={110} x2={560} y2={200} stroke="#64748b" strokeWidth={2} />
            <line x1={560} y1={200} x2={80} y2={200} stroke="#64748b" strokeWidth={2} />
            <line x1={80} y1={200} x2={80} y2={130} stroke="#64748b" strokeWidth={2} />
            {/* voltmeter */}
            <circle cx={530} cy={155} r={18} fill="#0f172a" stroke="#22d3ee" strokeWidth={2} />
            <text x={530} y={159} textAnchor="middle" fontSize={9} fill="#22d3ee">V</text>
            <text x={530} y={185} textAnchor="middle" fontSize={10} fill="#94a3b8">{fmt(Vc, 3)}V</text>
          </svg>
        )
      }
      parameters={
        mode === "ohm" ? (
          <>
            <Slider label="ولتاژ باتری V" value={ohmV} min={1} max={24} step={0.5} unit="V" onChange={setOhmV} color="amber" />
            <Slider label="مقاومت R" value={ohmR} min={10} max={2000} step={10} unit="Ω" onChange={setOhmR} color="sky" />
          </>
        ) : (
          <>
            <Slider label="ولتاژ باتری V" value={rcV} min={1} max={24} step={0.5} unit="V" onChange={setRcV} color="amber" />
            <Slider label="مقاومت R" value={rcRk} min={1} max={100} step={1} unit="kΩ" onChange={setRcRk} color="sky" />
            <Slider label="ظرفیت خازن C" value={rcCu} min={10} max={1000} step={10} unit="µF" onChange={setRcCu} color="rose" />
            <div className="flex gap-2">
              <Button variant={charging ? "primary" : "default"} onClick={() => toggleSwitch(true)}>بستن کلید (شارژ)</Button>
              <Button variant={!charging ? "danger" : "default"} onClick={() => toggleSwitch(false)}>باز کردن کلید (دشارژ)</Button>
              <Button variant="ghost" onClick={() => setRunning((r) => !r)}>{running ? "⏸" : "▶"}</Button>
            </div>
          </>
        )
      }
      measurements={
        mode === "ohm" ? (
          <>
            <Stat label="جریان مدار I=V/R" value={fmt(ohmI * 1000, 3)} unit="mA" color="emerald" />
            <Stat label="توان مصرفی P=VI" value={fmt(ohmV * ohmI, 3)} unit="W" color="rose" />
          </>
        ) : (
          <>
            <Stat label="ولتاژ لحظه‌ای خازن V_C(t)" value={fmt(Vc, 3)} unit="V" color="sky" />
            <Stat label="ثابت زمانی مدار τ=RC" value={fmt(RC, 3)} unit="s" color="amber" />
            <Stat label="بار لحظه‌ای Q=CV_C" value={fmt(Vc * C * 1e6, 3)} unit="µC" color="rose" />
          </>
        )
      }
      equation={
        mode === "ohm" ? (
          <EquationBox>V = I·R</EquationBox>
        ) : (
          <div className="space-y-2">
            <EquationBox>V_C(t) = V(1 − e^(−t/RC))  [شارژ]</EquationBox>
            <EquationBox>V_C(t) = V₀·e^(−t/RC)  [دشارژ]</EquationBox>
          </div>
        )
      }
      graph={
        mode === "ohm" ? (
          <LineGraph
            points={[{ x: ohmV, y: ohmI * 1000 }]}
            curve={Array.from({ length: 20 }, (_, i) => {
              const Vv = 1 + (i / 19) * 23;
              return { x: Vv, y: (Vv / ohmR) * 1000 };
            })}
            xLabel="ولتاژ V (Volt)"
            yLabel="جریان I (mA)"
          />
        ) : (
          <LineGraph points={history.map((h) => ({ x: h.tau, y: h.v }))} xLabel="t / RC" yLabel="V_C (Volt)" />
        )
      }
      extra={
        mode === "ohm" ? (
          <>
            <PredictQuestion
              question="اگر مقاومت R را دو برابر کنیم (ولتاژ ثابت)، جریان مدار چه تغییری می‌کند؟"
              options={["دو برابر می‌شود", "نصف می‌شود", "ثابت می‌ماند", "چهار برابر می‌شود"]}
              correctIndex={1}
              explanation="طبق I=V/R، دوبرابر شدن R باعث نصف‌شدن I می‌شود؛ رابطهٔ جریان و مقاومت عکس است."
            />
            <DiscoveryPanel
              title="کشف رابطهٔ خطی V و I (قانون اهم)"
              question="ولتاژ فرضی را تغییر بده و ثبت کن. آیا نمودار I برحسب V یک خط راست از مبدأ است؟"
              xLabel="V (Volt)"
              yLabel="I (mA)"
              trials={trials}
              onRecord={() => setTrials((t) => [...t, { x: probeV, y: (probeV / ohmR) * 1000, label: `V=${probeV}V` }])}
              onClear={() => setTrials([])}
              formula="I ∝ V  ⇒  V = IR"
              hint="شیب این خط راست برابر با ۱/R است."
            >
              <Slider label="ولتاژ فرضی" value={probeV} min={1} max={24} step={0.5} unit="V" onChange={setProbeV} color="violet" />
            </DiscoveryPanel>
          </>
        ) : (
          <PredictQuestion
            question="بعد از گذشت یک ثابت زمانی (t=RC) از شروع شارژ، ولتاژ خازن چند درصد ولتاژ باتری است؟"
            options={["50٪", "63٪", "37٪", "100٪"]}
            correctIndex={1}
            explanation="چون 1-e^(-1) ≈ 0.63، پس بعد از یک ثابت زمانی، خازن حدود ۶۳٪ شارژ کامل می‌شود. با دکمهٔ ⏸ در t/RC=1 توقف کن و بررسی کن."
          />
        )
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          {mode === "ohm" ? (
            <>
              <li>قانون اهم (V=IR) یک رابطهٔ تجربی خطی بین ولتاژ و جریان برای موادِ اهمی است، نه یک قانون بنیادین فیزیک مثل قوانین ماکسول.</li>
              <li>مقاومت با جلوگیری از عبور آزاد بار، انرژی الکتریکی را به گرما تبدیل می‌کند (P=VI).</li>
            </>
          ) : (
            <>
              <li>خازن هیچ‌گاه آنی شارژ یا دشارژ نمی‌شود؛ فرایند نمایی است و ثابت زمانی τ=RC سرعت آن را تعیین می‌کند.</li>
              <li>افزایش R یا C باعث افزایش τ (کندتر شدن شارژ/دشارژ) می‌شود چون مقاومت جریان را محدود و خازن ظرفیت بیشتری برای ذخیره دارد.</li>
              <li>در حالت پایدار (t≫RC)، جریان از خازن کاملاً شارژ‌شده در مدار DC صفر می‌شود.</li>
            </>
          )}
        </ul>
      }
      misconceptions={[
        "قانون اهم برای همهٔ عناصر برقرار نیست؛ فقط برای مواد و قطعات «اهمی» (مثل مقاومت‌های معمولی) صادق است.",
        "جریان الکتریکی به‌معنای «حرکت میدان» از یک نقطه به نقطهٔ دیگر نیست؛ جریان یعنی حرکت بارهای واقعی (الکترون‌ها) در مدار.",
        "خازن در مدار DC پایدار مانند یک سیم رفتار نمی‌کند؛ برعکس، در حالت کاملاً شارژ‌شده مثل مدار باز (بدون عبور جریان) عمل می‌کند.",
        "افزایش ولتاژ باتری به‌تنهایی سرعت شارژ‌شدن خازن (ثابت زمانی τ) را تغییر نمی‌دهد؛ فقط ولتاژ نهایی خازن را تغییر می‌دهد.",
      ]}
    />
  );
}
