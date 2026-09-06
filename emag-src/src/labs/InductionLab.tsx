import { useEffect, useRef, useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { Button, EquationBox, Pill, Slider, Stat } from "../components/ui";
import { LineGraph } from "../components/Graph";
import { PredictQuestion } from "../components/Predict";
import { fmt } from "../data/constants";

export default function InductionLab() {
  const [magnetX, setMagnetX] = useState(80);
  const [moving, setMoving] = useState(false);
  const [dir, setDir] = useState(1);
  const [speed, setSpeed] = useState(80); // px/s
  const [moment, setMoment] = useState(8);
  const [loopArea, setLoopArea] = useState(1);
  const [turns, setTurns] = useState(20);
  const [history, setHistory] = useState<{ t: number; emf: number; flux: number }[]>([]);
  const tRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);
  const prevFluxRef = useRef(0);

  const loopX = 380;
  const loopHalfH = 60 * Math.sqrt(loopArea);

  function fluxThroughLoop(mx: number) {
    // شار مفهومی: تابعی از فاصلهٔ آهنربا تا حلقه که با فاصله کاهش می‌یابد (شبیه میدان دوقطبی)
    const d = Math.max(Math.abs(loopX - mx) / 60, 0.15);
    const B = (moment * 3) / Math.pow(d, 3);
    return B * loopArea * turns;
  }

  useEffect(() => {
    let last = performance.now();
    function tick(t: number) {
      const dt = (t - last) / 1000;
      last = t;
      if (moving) {
        setMagnetX((x) => {
          let nx = x + dir * speed * dt;
          if (nx > 620) {
            nx = 620;
            setMoving(false);
          }
          if (nx < 20) {
            nx = 20;
            setMoving(false);
          }
          return nx;
        });
      }
      tRef.current += dt;
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [moving, dir, speed]);

  const flux = fluxThroughLoop(magnetX);
  const dt = 1 / 60;
  const dFlux = flux - prevFluxRef.current;
  const emf = -dFlux / dt;

  useEffect(() => {
    setHistory((h) => {
      const nh = [...h, { t: tRef.current, emf, flux }].slice(-200);
      return nh;
    });
    prevFluxRef.current = flux;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magnetX]);

  const current = emf / 50; // فرض مقاومت حلقه = 50 اهم برای نمایش آمپرمتر
  const inducedCW = current > 0.001;
  const inducedCCW = current < -0.001;

  return (
    <LabLayout
      title="🔁 آزمایشگاه القای الکترومغناطیسی"
      levelTag="سطح ۶ — Faraday → Lenz → Induction"
      subtitle="آهنربا را به سمت حلقه حرکت بده یا دور کن. ببین چگونه تغییر شار باعث ولتاژ و جریان القایی می‌شود، نه خودِ شار."
      simulation={
        <svg viewBox="0 0 700 300" className="w-full rounded-xl bg-slate-950">
          {/* rail */}
          <line x1={20} y1={150} x2={620} y2={150} stroke="#1e293b" strokeWidth={2} />
          {/* magnet */}
          <g>
            <rect x={magnetX - 34} y={128} width={34} height={44} fill="#ef4444" rx={4} />
            <text x={magnetX - 17} y={155} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">N</text>
            <rect x={magnetX} y={128} width={34} height={44} fill="#3b82f6" rx={4} />
            <text x={magnetX + 17} y={155} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">S</text>
          </g>
          {/* loop */}
          <ellipse cx={loopX} cy={150} rx={26} ry={loopHalfH} fill="none" stroke="#f59e0b" strokeWidth={4} />
          <text x={loopX} y={150 - loopHalfH - 12} textAnchor="middle" fontSize={10} fill="#94a3b8">حلقهٔ سیم ({turns} دور)</text>
          {/* induced current direction indicator */}
          {(inducedCW || inducedCCW) && (
            <text x={loopX} y={155} textAnchor="middle" fontSize={20} fill="#22d3ee">
              {inducedCW ? "↻" : "↺"}
            </text>
          )}
          {/* galvanometer */}
          <g transform="translate(560,60)">
            <circle r={34} fill="#0f172a" stroke="#64748b" strokeWidth={2} />
            <line x1={0} y1={0} x2={Math.cos(Math.PI / 2 - Math.max(-1, Math.min(1, current)) * 1.2) * 26} y2={-Math.sin(Math.PI / 2 - Math.max(-1, Math.min(1, current)) * 1.2) * 26} stroke="#f43f5e" strokeWidth={2.5} />
            <text y={50} textAnchor="middle" fontSize={9} fill="#94a3b8">آمپرمتر</text>
          </g>
          <line x1={loopX + 26} y1={150} x2={594} y2={94} stroke="#475569" strokeWidth={1.5} />
          <line x1={loopX + 20} y1={180} x2={550} y2={90} stroke="#475569" strokeWidth={1.5} opacity={0} />
        </svg>
      }
      parameters={
        <>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => { setDir(1); setMoving(true); }}>حرکت به سمت حلقه ▶</Button>
            <Button variant="default" onClick={() => { setDir(-1); setMoving(true); }}>◀ دور شدن از حلقه</Button>
            <Button variant="ghost" onClick={() => setMoving(false)}>توقف (شار ثابت)</Button>
          </div>
          <Slider label="سرعت حرکت آهنربا" value={speed} min={20} max={300} step={10} unit="px/s" onChange={setSpeed} color="rose" />
          <Slider label="قدرت آهنربا" value={moment} min={2} max={20} step={1} onChange={setMoment} color="amber" />
          <Slider label="مساحت حلقه" value={loopArea} min={0.3} max={3} step={0.1} onChange={setLoopArea} color="sky" />
          <Slider label="تعداد دورهای حلقه N" value={turns} min={1} max={80} step={1} onChange={setTurns} color="emerald" />
        </>
      }
      measurements={
        <>
          <Stat label="شار مغناطیسی گذرنده از حلقه Φ_B" value={fmt(flux, 3)} unit="Wb (نسبی)" color="amber" />
          <Stat label="ولتاژ (نیروی محرکه) القایی ε" value={fmt(emf, 3)} unit="V (نسبی)" color="sky" />
          <Stat label="جریان القایی I=ε/R" value={fmt(current, 3)} unit="A (نسبی)" color="emerald" />
          <Pill color={moving ? "sky" : "amber"}>{moving ? "شار در حال تغییر است ⇒ ولتاژ القا می‌شود" : "آهنربا ساکن است ⇒ شار ثابت ⇒ ولتاژ صفر"}</Pill>
        </>
      }
      equation={
        <div className="space-y-2">
          <EquationBox>Φ_B = ∫ B·dA</EquationBox>
          <EquationBox>ε = −N·dΦ_B/dt</EquationBox>
          <p className="text-center text-xs text-slate-400">علامت منفی (قانون لنز) نشان می‌دهد جریان القایی طوری جهت می‌گیرد که با تغییر شار مخالفت کند، نه این‌که آن را تقویت کند.</p>
        </div>
      }
      graph={<LineGraph points={history.slice(-60).map((h) => ({ x: h.t, y: h.emf }))} xLabel="زمان (s)" yLabel="ε (V نسبی)" />}
      extra={
        <>
          <PredictQuestion
            question="اگر آهنربا را ساکن نگه‌داریم اما نزدیک حلقه باشد، ولتاژ القایی چقدر است؟"
            options={["حداکثر مقدار، چون شار زیاد است", "صفر، چون شار تغییر نمی‌کند", "متوسط", "بستگی به قطبیت دارد"]}
            correctIndex={1}
            explanation="طبق قانون فارادی، ولتاژ القایی فقط به نرخ تغییر شار بستگی دارد، نه به مقدار مطلق شار. آهنربای ساکن، حتی اگر شار زیادی ایجاد کند، ولتاژی القا نمی‌کند."
          />
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/10 p-4">
            <h3 className="mb-2 text-sm font-bold text-cyan-300">⚖️ قانون لنز به زبان ساده</h3>
            <p className="text-sm leading-7 text-slate-300">
              وقتی آهنربا به حلقه نزدیک می‌شود، شار روبه‌افزایش است؛ جریان القایی جهتی می‌گیرد که میدان مغناطیسی خودش با قطب مشابه آهنربا روبه‌رو شود و از نزدیک‌شدن بیشتر «جلوگیری» کند (دافعه). وقتی آهنربا دور می‌شود، جریان القایی جهت عکس می‌گیرد تا با ایجاد جاذبه، از کاهش شار «جلوگیری» کند. این مخالفت با تغییر، نتیجهٔ مستقیم بقای انرژی است — در غیر این‌صورت می‌شد بدون هیچ کاری انرژی نامحدود تولید کرد.
            </p>
          </div>
        </>
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          <li>ولتاژ القایی فقط به «نرخ تغییر شار» بستگی دارد، نه به مقدار مطلق شار یا میدان.</li>
          <li>آهنربای ساکن (حتی نزدیک حلقه) هیچ جریانی القا نمی‌کند چون Φ_B ثابت است.</li>
          <li>سرعت حرکت آهنربا مستقیماً روی اندازهٔ ولتاژ القایی اثر می‌گذارد: حرکت سریع‌تر یعنی dΦ/dt بزرگ‌تر یعنی ولتاژ بیشتر.</li>
          <li>قانون لنز (علامت منفی) تضمین می‌کند جریان القایی همیشه با علتِ به‌وجودآورندهٔ خودش (تغییر شار) مخالفت کند — نتیجهٔ بقای انرژی.</li>
        </ul>
      }
      misconceptions={[
        "شار مغناطیسی زیاد به‌تنهایی ولتاژ القا نمی‌کند؛ فقط تغییر شار (dΦ/dt) القاکننده است.",
        "افزایش میدان B همیشه به‌معنی افزایش شار نیست — جهت میدان نسبت به سطح و مساحت سطح هم مهم‌اند (Φ=B·A·cosθ).",
        "جریان القایی خودش میدانی تولید می‌کند که با تغییر شار مخالفت می‌کند، نه این‌که هم‌جهت با میدان اصلی باشد.",
        "قانون لنز نقض بقای انرژی نیست، بلکه مستقیماً نتیجهٔ آن است.",
      ]}
    />
  );
}
