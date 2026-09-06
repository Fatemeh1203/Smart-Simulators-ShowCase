import { useMemo, useState } from "react";
import StationLayout, { useSettings } from "../components/StationLayout";
import { Slider, Segmented, LiveChart, DataBar, Arrow, fmt, fmtPa, Btn, Toggle, ChartPoint, QuizQ } from "../components/ui";
import { useChanged } from "../hooks/useChanged";

type Orient = "ab" | "bc" | "ac";
const init = { m: 10, Fx: 0, g: 9.8, a: 20, b: 10, c: 5, orient: "ab" as Orient };

export default function Solids() {
  const s = useSettings();
  const [st, setSt] = useState(init);
  const [chartX, setChartX] = useState<"A" | "F">("A");
  const [collected, setCollected] = useState<ChartPoint[]>([]);
  const [compare, setCompare] = useState(true);
  const up = (k: keyof typeof init, v: number | string) => setSt((o) => ({ ...o, [k]: v }));

  // physics
  const faces: Record<Orient, [number, number]> = { ab: [st.a, st.b], bc: [st.b, st.c], ac: [st.a, st.c] };
  const [w, d] = faces[st.orient];
  const A = (w / 100) * (d / 100); // m²
  const F = st.m * st.g + st.Fx;
  const P = F / A;
  const Amax = (Math.max(st.a, st.b, st.c) * [st.a, st.b, st.c].sort((x, y) => y - x)[1]) / 1e4;
  const Amin = ([st.a, st.b, st.c].sort((x, y) => x - y)[0] * [st.a, st.b, st.c].sort((x, y) => x - y)[1]) / 1e4;
  const { active, dir } = useChanged({ F, A, m: st.m, g: st.g });

  const heightFace = st.orient === "ab" ? st.c : st.orient === "bc" ? st.a : st.b;

  // heat color for pressure
  const heat = (p: number, pmax: number) => {
    const t = Math.max(0, Math.min(1, Math.log10(1 + p) / Math.log10(1 + pmax)));
    const r = Math.round(40 + 215 * t), g = Math.round(200 - 170 * t), b = Math.round(255 - 235 * t);
    return `rgb(${r},${g},${b})`;
  };
  const Pref = F / Amin; // reference max for coloring

  const note = useMemo(() => {
    if (active.includes("A")) return dir.A === "down" ? "سطح تماس کم شد → همان نیرو روی سطح کوچک‌تری پخش شد → فشار زیاد شد (مخرج کسر کوچک شد)." : "سطح تماس زیاد شد → نیرو روی سطح بزرگ‌تری پخش شد → فشار کم شد (مخرج کسر بزرگ شد).";
    if (active.includes("F")) return dir.F === "up" ? "نیروی عمودی زیاد شد → با همان سطح، فشار زیاد شد (صورت کسر بزرگ شد)." : "نیروی عمودی کم شد → فشار کم شد (صورت کسر کوچک شد).";
    return undefined;
  }, [active, dir]);

  // scene drawing
  const Block = ({ cx, baseY, wCm, dCm, hCm, p, label }: { cx: number; baseY: number; wCm: number; dCm: number; hCm: number; p: number; label: string }) => {
    const k = 4.2; // px per cm
    const W = wCm * k, H = hCm * k, D = dCm * k * 0.5;
    const x = cx - W / 2, y = baseY - H;
    const col = heat(p, Pref);
    const glow = Math.min(1, p / Pref);
    return (
      <g>
        {/* pressure footprint on surface */}
        <ellipse cx={cx} cy={baseY + 2} rx={W / 2 + 26 * glow + 6} ry={D / 2 + 14 * glow + 4} fill={col} opacity={0.18 + 0.25 * glow} />
        <ellipse cx={cx} cy={baseY + 2} rx={W / 2 + 10 * glow + 2} ry={D / 2 + 6 * glow + 2} fill={col} opacity={0.35 + 0.3 * glow} />
        {/* box faces */}
        <polygon points={`${x},${y} ${x + D},${y - D} ${x + W + D},${y - D} ${x + W},${y}`} fill="#8b9cc7" />
        <polygon points={`${x + W},${y} ${x + W + D},${y - D} ${x + W + D},${y - D + H} ${x + W},${y + H}`} fill="#4b5b85" />
        <rect x={x} y={y} width={W} height={H} fill="#6579a8" stroke="#2b365a" />
        <text x={cx} y={y + H / 2 + 4} fontSize={11} fill="#fff" textAnchor="middle" className="num">{fmt(st.m)} kg</text>
        {/* force arrow */}
        {s.showVectors && <Arrow x1={cx} y1={y - 60 - Math.min(60, F / 6)} x2={cx} y2={y - 4} color="#f87171" width={3} label={`F = ${fmt(F, 1)} N`} labelPos="start" />}
        {/* pressure arrows into the surface */}
        {s.showVectors && Array.from({ length: Math.max(2, Math.round(W / 22)) }).map((_, i) => {
          const ax = x + 10 + (i * (W - 20)) / Math.max(1, Math.round(W / 22) - 1);
          const len = 8 + 30 * glow;
          return <Arrow key={i} x1={ax} y1={baseY + 4} x2={ax} y2={baseY + 4 + len} color={col} width={2} />;
        })}
        <text x={cx} y={baseY + 62} fontSize={11} fill="#cbd5e1" textAnchor="middle">{label}</text>
        <text x={cx} y={baseY + 78} fontSize={12} fill={col} fontWeight={700} textAnchor="middle" className="num">P = {fmtPa(p)}</text>
        <text x={cx} y={baseY + 92} fontSize={10} fill="#94a3b8" textAnchor="middle" className="num">A = {fmt(wCm * dCm)} cm² = {fmt(wCm * dCm / 1e4, 4)} m²</text>
      </g>
    );
  };

  const otherFaces = (["ab", "bc", "ac"] as Orient[]).filter((o) => o !== st.orient);
  const cmpOrient = otherFaces.reduce((best, o) => (faces[o][0] * faces[o][1] !== w * d ? o : best), otherFaces[0]);
  const [cw, cd] = faces[cmpOrient];
  const cA = (cw / 100) * (cd / 100);

  const scene = (
    <svg viewBox="0 0 640 330" className="w-full h-auto select-none">
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b2540" /><stop offset="1" stopColor="#0c1224" /></linearGradient>
      </defs>
      <rect x="0" y="215" width="640" height="115" fill="url(#floor)" />
      <line x1="0" y1="215" x2="640" y2="215" stroke="#3b4d80" strokeWidth={2} />
      <text x="320" y="20" fontSize={12} fill="#94a3b8" textAnchor="middle">{compare ? "مقایسه: همان جسم، دو سطح تماس متفاوت" : "روی جسم کلیک کن تا وجه تماس تغییر کند"}</text>
      <g style={{ cursor: "pointer" }} onClick={() => up("orient", otherFaces[0])}>
        <Block cx={compare ? 190 : 320} baseY={215} wCm={w} dCm={d} hCm={heightFace} p={P} label="وضعیت فعلی (قابل تغییر)" />
      </g>
      {compare && <g style={{ cursor: "pointer" }} onClick={() => up("orient", cmpOrient)}>
        <Block cx={460} baseY={215} wCm={cw} dCm={cd} hCm={st.orient === "ab" ? (cmpOrient === "bc" ? st.a : st.b) : cmpOrient === "ab" ? st.c : cmpOrient === "bc" ? st.a : st.b} p={F / cA} label={`همان جسم روی وجه دیگر (${cmpOrient.toUpperCase()})`} />
      </g>}
      {compare && <text x="320" y="130" fontSize={13} fill="#fbbf24" textAnchor="middle" className="num">A کوچک‌تر → P بزرگ‌تر ({fmt(Math.max(P, F / cA) / Math.min(P, F / cA), 2)}×)</text>}
      {/* legend */}
      <g transform="translate(20,300)">
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => <rect key={i} x={i * 22} y={0} width={22} height={10} fill={heat(t * Pref, Pref)} />)}
        <text x={0} y={22} fontSize={9} fill="#94a3b8">کم</text><text x={110} y={22} fontSize={9} fill="#94a3b8" textAnchor="end">فشار زیاد</text>
      </g>
    </svg>
  );

  const controls = (
    <>
      <Slider label="جرم جسم" symbol="m" value={st.m} min={0.5} max={100} step={0.5} unit="kg" onChange={(v) => up("m", v)} color="#f87171" />
      <Slider label="نیروی اضافی عمودی" symbol="F extra" value={st.Fx} min={0} max={1000} step={5} unit="N" onChange={(v) => up("Fx", v)} color="#fb923c" hint="مثلاً فشار دادن با دست از بالا" />
      <Slider label="شتاب گرانش" symbol="g" value={st.g} min={1} max={25} step={0.1} unit="m/s²" onChange={(v) => up("g", v)} color="#a78bfa" hint="ماه ≈ 1.6 ، زمین ≈ 9.8 ، مشتری ≈ 24.8" />
      <div className="text-xs text-slate-400 mt-2 mb-1">ابعاد جسم (سانتی‌متر)</div>
      <Slider label="ضلع a" value={st.a} min={2} max={40} step={1} unit="cm" onChange={(v) => up("a", v)} color="#22d3ee" />
      <Slider label="ضلع b" value={st.b} min={2} max={40} step={1} unit="cm" onChange={(v) => up("b", v)} color="#22d3ee" />
      <Slider label="ضلع c" value={st.c} min={2} max={40} step={1} unit="cm" onChange={(v) => up("c", v)} color="#22d3ee" />
      <div className="text-xs text-slate-400 mb-1">وجه در تماس با سطح (جهت قرارگیری)</div>
      <Segmented value={st.orient} onChange={(v) => up("orient", v)} options={[
        { v: "ab", l: `a×b = ${st.a * st.b} cm²` }, { v: "bc", l: `b×c = ${st.b * st.c} cm²` }, { v: "ac", l: `a×c = ${st.a * st.c} cm²` }]} />
      <div className="mt-3 flex flex-col gap-2">
        <Toggle label="نمایش مقایسه‌ی دو وجه" on={compare} onChange={setCompare} />
        <div className="flex gap-1.5 flex-wrap">
          <Btn small tone="amber" onClick={() => setSt({ ...st, orient: "ab", a: 20, b: 20, c: 2 })}>حالت: صفحه پهن</Btn>
          <Btn small tone="rose" onClick={() => setSt({ ...st, orient: "bc", a: 20, b: 2, c: 2 })}>حالت: میخ</Btn>
        </div>
      </div>
    </>
  );

  const chart = (
    <>
      <div className="flex items-center justify-between mb-1">
        <Segmented value={chartX} onChange={(v) => { setChartX(v); setCollected([]); }} options={[{ v: "A", l: "P برحسب A" }, { v: "F", l: "P برحسب F" }]} />
      </div>
      {chartX === "A" ? (
        <LiveChart fn={(x) => F / x} xMin={Math.max(0.0005, Amin * 0.8)} xMax={Amax * 1.2} xLabel="A (m²)" yLabel="P (Pa)" current={{ x: A, y: P }} collected={collected} yFmt={(v) => fmtPa(v)} xFmt={(v) => fmt(v, 3)} title="با کوچک شدن A، فشار به‌شدت (به‌صورت وارون) بالا می‌رود" />
      ) : (
        <LiveChart fn={(x) => x / A} xMin={0} xMax={Math.max(200, F * 1.5)} xLabel="F (N)" yLabel="P (Pa)" current={{ x: F, y: P }} collected={collected} yFmt={(v) => fmtPa(v)} title="P با F رابطه‌ی خطی (مستقیم) دارد — شیب = 1/A" />
      )}
      <DataBar count={collected.length} onAdd={() => setCollected([...collected, chartX === "A" ? { x: A, y: P } : { x: F, y: P }])} onClear={() => setCollected([])} />
    </>
  );

  const quiz: QuizQ[] = [
    { kind: "مفهومی", q: "اگر جسم را طوری بچرخانیم که روی وجه کوچک‌ترش قرار بگیرد (بدون تغییر جرم)، فشار روی سطح چه می‌شود؟", options: ["زیاد می‌شود", "کم می‌شود", "تغییر نمی‌کند"], answer: "زیاد می‌شود", explain: "نیرو ثابت است اما سطح کم شده، پس P = F/A بزرگ‌تر می‌شود." },
    { kind: "پیش‌بینی", q: "اگر جرم را دو برابر و سطح تماس را هم دو برابر کنیم، فشار چه تغییری می‌کند؟", options: ["دو برابر", "نصف", "بدون تغییر", "چهار برابر"], answer: "بدون تغییر", explain: "صورت و مخرج هر دو ۲ برابر شدند؛ نسبت ثابت می‌ماند." },
    { kind: "محاسباتی", q: `جسمی به جرم ${fmt(st.m)} kg با g = ${fmt(st.g)} روی سطح ${fmt(w * d)} cm² قرار دارد (بدون نیروی اضافی). فشار چند پاسکال است؟`, answer: fmt(st.m * st.g / A, 0), numeric: { value: st.m * st.g / A, tol: st.m * st.g / A * 0.03, unit: "Pa" }, explain: `P = mg/A = ${fmt(st.m)}×${fmt(st.g)} / ${fmt(A, 4)} = ${fmt(st.m * st.g / A, 0)} Pa` },
  ];

  return (
    <StationLayout
      title="ایستگاه ۱ — فشار در جامدات" icon="🧱" unit="Pa = N/m²"
      concept="جسمی روی سطح قرار دارد. نیروی عمودی (وزن + نیروی اضافی) روی سطح تماس پخش می‌شود. ببین چگونه تغییر نیرو یا سطح، «شدت» اثر نیرو را تغییر می‌دهد."
      formula={<>P = F / A</>} formulaSub={<>F = mg + F<sub>extra</sub></>}
      values={[
        { label: "نیروی عمودی F", value: fmt(F, 1), unit: "N", color: "text-rose-300", flash: active.includes("F") },
        { label: "سطح تماس A", value: fmt(A, 4), unit: "m²", color: "text-cyan-300", flash: active.includes("A") },
        { label: "فشار P", value: fmtPa(P), color: "text-amber-300", flash: active.includes("A") || active.includes("F") },
        { label: "جرم m", value: st.m, unit: "kg" }, { label: "g", value: st.g, unit: "m/s²" },
      ]}
      result={<>نیروی <b className="num">{fmt(F, 1)} N</b> روی سطح <b className="num">{fmt(w * d)} cm²</b> پخش شده → فشار <b className="num">{fmtPa(P)}</b>. {compare && <>روی وجه دیگر: <b className="num">{fmtPa(F / cA)}</b>.</>}</>}
      definition={{ parts: [{ t: "فشار، مقدار " }, { t: "نیروی عمودی", k: "F" }, { t: " وارد بر " }, { t: "واحد سطح", k: "A" }, { t: " است." }], active, note }}
      scene={scene} controls={controls} chart={chart}
      levels={{
        observe: `با ${active.includes("A") ? (dir.A === "down" ? "کوچک‌تر شدن سطح تماس" : "بزرگ‌تر شدن سطح تماس") : "تغییر سطح تماس یا نیرو"}، ناحیه‌ی رنگی زیر جسم ${P > F / cA ? "پررنگ‌تر" : "کم‌رنگ‌تر"} شد و عدد فشار به ${fmtPa(P)} رسید. همان جسم روی وجه دیگر فشار ${fmtPa(F / cA)} ایجاد می‌کند.`,
        concept: "نیرو روی تمام سطح تماس تقسیم می‌شود. هرچه سطح کوچک‌تر باشد، سهم هر مترمربع از نیرو بیشتر است؛ به همین دلیل نوک میخ یا لبه‌ی چاقو با نیروی کم، فشار زیادی ایجاد می‌کند.",
        math: <div className="ltr num">P = F/A = {fmt(F, 1)} N / {fmt(A, 4)} m² = {fmtPa(P)}<br /><span className="text-xs text-slate-400">F = mg + F_extra = {fmt(st.m)}×{fmt(st.g)} + {fmt(st.Fx)} = {fmt(F, 1)} N</span></div>,
      }}
      quiz={quiz}
      onQuizRun={(i) => { if (i === 0) up("orient", (["ab", "bc", "ac"] as Orient[]).sort((x, y) => faces[x][0] * faces[x][1] - faces[y][0] * faces[y][1])[0]); if (i === 1) setSt((o) => ({ ...o, m: o.m * 2, a: o.a * 2 > 40 ? 40 : o.a * 2 })); }}
      onReset={() => { setSt(init); setCollected([]); }}
    />
  );
}
