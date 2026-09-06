import { useEffect, useMemo, useRef, useState } from "react";
import StationLayout, { useSettings } from "../components/StationLayout";
import { Slider, Segmented, LiveChart, DataBar, Arrow, Digital, fmt, ChartPoint, QuizQ, useClock, Toggle } from "../components/ui";
import { useChanged } from "../hooks/useChanged";
import { svgPoint, LIQUIDS } from "../utils/svg";

const MATS: Record<string, { name: string; rho: number; color: string }> = {
  wood: { name: "چوب", rho: 600, color: "#b45309" }, plastic: { name: "پلاستیک", rho: 950, color: "#f472b6" },
  aluminum: { name: "آلومینیوم", rho: 2700, color: "#cbd5e1" }, iron: { name: "آهن", rho: 7870, color: "#64748b" }, custom: { name: "دلخواه", rho: 1200, color: "#34d399" },
};
const init = { mat: "wood", rhoObj: 600, V: 2, liquid: "water", rhoF: 1000, g: 9.8, sub: 0.5, held: true };

export default function Archimedes() {
  const s = useSettings();
  const t = useClock(s.paused, s.slow);
  const [st, setSt] = useState(init);
  const [collected, setCollected] = useState<ChartPoint[]>([]);
  const [chartX, setChartX] = useState<"V" | "sub" | "rho">("sub");
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef(false);
  const up = (k: keyof typeof init, v: number | string | boolean) => setSt((o) => ({ ...o, [k]: v }));

  const Vm3 = st.V / 1000; // liters → m³
  const m = st.rhoObj * Vm3;
  const W = m * st.g;
  // equilibrium state when released
  const state: "sink" | "suspend" | "float" = st.rhoObj > st.rhoF * 1.005 ? "sink" : st.rhoObj < st.rhoF * 0.995 ? "float" : "suspend";
  const freeSub = state === "float" ? st.rhoObj / st.rhoF : 1;
  const sub = st.held ? st.sub : freeSub;
  const Vd = Vm3 * sub;
  const Fb = st.rhoF * st.g * Vd;
  const T = st.held ? Math.max(0, W - Fb) : 0; // spring scale reading (apparent weight)
  const N = !st.held && state === "sink" ? W - Fb : 0;
  const { active, dir } = useChanged({ sub, rhoObj: st.rhoObj, rhoF: st.rhoF, V: st.V });
  const liq = LIQUIDS[st.liquid];

  // geometry
  const TX = 90, TY = 60, TW = 260, TH = 250; const waterY = TY + 40;
  const side = 40 + Math.cbrt(st.V) * 18;
  // object top y such that submerged fraction = sub; bottom must not exceed tank bottom
  const targetTop = st.held ? waterY - side * (1 - sub) : state === "sink" ? TY + TH - side - 4 : waterY - side * (1 - freeSub) + (state === "suspend" ? 60 : 0);
  const [objTop, setObjTop] = useState(targetTop);
  const lastT = useRef(t);
  useEffect(() => { const dt = t - lastT.current; lastT.current = t; setObjTop((y) => y + (targetTop - y) * Math.min(1, dt * (st.held ? 10 : 2.5))); }, [t, targetTop, st.held]);
  const objCx = TX + TW / 2;

  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !st.held) return;
    const p = svgPoint(e, svgRef.current);
    const topY = p.y - side / 2;
    const f = (waterY - topY) / side; // submerged fraction from top position
    up("sub", Math.round(Math.max(0, Math.min(1, f)) * 100) / 100);
  };

  const vecScale = 60 / Math.max(W, 1);
  const note = useMemo(() => {
    if (active.includes("sub")) return dir.sub === "up" ? "جسم بیشتر فرو رفت → حجم مایع جابه‌جاشده بیشتر شد → نیروی شناوری زیاد و وزن ظاهری (عدد نیروسنج) کم شد." : "جسم بالا آمد → حجم جابه‌جاشده کمتر شد → نیروی شناوری کم و وزن ظاهری زیاد شد.";
    if (active.includes("rhoF")) return dir.rhoF === "up" ? "مایع چگال‌تر شد → همان حجم جابه‌جاشده وزن بیشتری دارد → نیروی شناوری بیشتر شد." : "مایع سبک‌تر شد → نیروی شناوری کمتر شد.";
    if (active.includes("rhoObj")) return "چگالی جسم تغییر کرد → وزن جسم تغییر کرد ولی نیروی شناوری (که فقط به مایع و حجم جابه‌جاشده وابسته است) تغییر نکرد → وضعیت شناوری با مقایسه‌ی ρ_obj و ρ_fluid تعیین می‌شود.";
    if (active.includes("V")) return "حجم جسم تغییر کرد → هم وزن و هم نیروی شناوری به یک نسبت تغییر کردند.";
    return undefined;
  }, [active, dir]);

  const mat = MATS[st.mat];
  const scene = (
    <svg ref={svgRef} viewBox="0 0 640 340" className="w-full h-auto select-none touch-none" onPointerMove={onMove} onPointerUp={() => (drag.current = false)}>
      <defs><clipPath id="arcClip"><rect x={TX} y={waterY} width={TW} height={TY + TH - waterY} /></clipPath></defs>
      {/* tank */}
      <rect x={TX} y={TY} width={TW} height={TH} fill="#0d1428" stroke="#5b6fa3" strokeWidth={3} rx={4} />
      <rect x={TX} y={waterY} width={TW} height={TY + TH - waterY} fill={liq.color} />
      <path d={`M${TX},${waterY} ${Array.from({ length: 14 }).map((_, i) => `L${TX + (i * TW) / 13},${waterY + Math.sin(t * 2.5 + i) * 2}`).join(" ")}`} stroke={liq.top} strokeWidth={2} fill="none" />
      {/* displaced volume indicator on the right (spout) */}
      <rect x={TX + TW + 10} y={TY + TH - 90} width={50} height={90} fill="#0d1428" stroke="#5b6fa3" strokeWidth={2} rx={3} />
      <rect x={TX + TW + 12} y={TY + TH - 2 - 86 * Math.min(1, Vd / (10 / 1000))} width={46} height={86 * Math.min(1, Vd / (10 / 1000))} fill={liq.color.replace(/[\d.]+\)$/, "0.9)")} />
      <text x={TX + TW + 35} y={TY + TH + 14} fontSize={9} fill="#cbd5e1" textAnchor="middle">مایع جابه‌جاشده</text>
      <text x={TX + TW + 35} y={TY + TH + 26} fontSize={10} fill="#fbbf24" textAnchor="middle" className="num">{fmt(Vd * 1000, 2)} L</text>
      {/* spring scale */}
      {st.held && <>
        <rect x={objCx - 12} y={8} width={24} height={40} rx={4} fill="#1e293b" stroke="#94a3b8" />
        <line x1={objCx} y1={48} x2={objCx} y2={objTop} stroke="#94a3b8" strokeWidth={2} strokeDasharray="3 2" />
        <text x={objCx} y={32} fontSize={8} fill="#a7f3d0" textAnchor="middle" className="num">{fmt(T, 1)}N</text>
      </>}
      {/* object */}
      <g style={{ cursor: st.held ? "grab" : "default" }} onPointerDown={(e) => { if (st.held) { drag.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); } }}>
        <rect x={objCx - side / 2} y={objTop} width={side} height={side} rx={4} fill={mat.color} stroke="#0b1224" strokeWidth={2} />
        <rect x={objCx - side / 2} y={Math.max(objTop, waterY)} width={side} height={Math.max(0, objTop + side - Math.max(objTop, waterY))} rx={2} fill={liq.color} opacity={0.6} clipPath="url(#arcClip)" />
        <text x={objCx} y={objTop + side / 2 + 4} fontSize={10} fill="#fff" textAnchor="middle" className="num">{fmt(m, 2)} kg</text>
      </g>
      {/* vectors */}
      {s.showVectors && <>
        <Arrow x1={objCx - side / 2 - 30} y1={objTop + side / 2} x2={objCx - side / 2 - 30} y2={objTop + side / 2 + W * vecScale + 4} color="#f87171" width={3} label={`W=${fmt(W, 1)}N`} />
        {Fb > 0.01 && <Arrow x1={objCx + side / 2 + 30} y1={objTop + side / 2} x2={objCx + side / 2 + 30} y2={objTop + side / 2 - Fb * vecScale - 4} color="#34d399" width={3} label={`Fb=${fmt(Fb, 1)}N`} />}
        {T > 0.01 && <Arrow x1={objCx + 10} y1={objTop - 4} x2={objCx + 10} y2={objTop - 4 - T * vecScale - 4} color="#a78bfa" width={3} label={`T=${fmt(T, 1)}N`} />}
        {N > 0.01 && <Arrow x1={objCx} y1={objTop + side + 4} x2={objCx} y2={objTop + side + 4 - N * vecScale - 4} color="#fbbf24" width={3} label={`N=${fmt(N, 1)}N`} labelPos="start" />}
        {/* pressure arrows on bottom face larger than top face */}
        {objTop + side > waterY && [-0.3, 0, 0.3].map((f, i) => <Arrow key={i} x1={objCx + f * side} y1={Math.min(objTop + side + 26 + (objTop + side - waterY) * 0.1, TY + TH - 2)} x2={objCx + f * side} y2={objTop + side + 6} color="#22d3ee" width={1.5} />)}
        {objTop > waterY && [-0.3, 0, 0.3].map((f, i) => <Arrow key={i} x1={objCx + f * side} y1={objTop - 20 - (objTop - waterY) * 0.1} x2={objCx + f * side} y2={objTop - 6} color="#22d3ee" width={1.5} />)}
      </>}
      <foreignObject x={420} y={20} width={210} height={310}>
        <div className="flex flex-col gap-2 items-center" dir="rtl">
          <div className={`text-xs px-2 py-1 rounded-lg border w-full text-center ${state === "sink" ? "border-rose-400/50 bg-rose-500/10 text-rose-200" : state === "float" ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200" : "border-amber-400/50 bg-amber-500/10 text-amber-200"}`}>
            {state === "sink" ? "🔻 ρ_obj > ρ_fluid → جسم غرق می‌شود" : state === "float" ? `🟢 ρ_obj < ρ_fluid → شناور (${fmt(freeSub * 100, 0)}% زیر آب)` : "🟡 ρ_obj = ρ_fluid → معلق"}
          </div>
          <Digital label="نیروی شناوری Fb" value={`${fmt(Fb, 2)} N`} color="#86efac" />
          <Digital label="وزن W" value={`${fmt(W, 2)} N`} color="#fca5a5" />
          <Digital label={st.held ? "وزن ظاهری (نیروسنج)" : "نیروی سطح/بند"} value={`${fmt(st.held ? T : N, 2)} N`} color="#c4b5fd" />
          <div className="text-[10px] text-slate-300 leading-5 text-center glass p-1.5 num">وزن مایع جابه‌جاشده = ρ_f·g·V_d = {fmt(st.rhoF)}×{fmt(st.g)}×{fmt(Vd, 5)} = {fmt(Fb, 2)} N = Fb ✔</div>
        </div>
      </foreignObject>
    </svg>
  );

  const controls = (
    <>
      <div className="text-xs text-slate-400 mb-1">جنس جسم</div>
      <Segmented value={st.mat} onChange={(k) => setSt((o) => ({ ...o, mat: k, rhoObj: k === "custom" ? o.rhoObj : MATS[k].rho }))} options={Object.entries(MATS).map(([k, v]) => ({ v: k, l: v.name }))} />
      <div className="h-2" />
      <Slider label="چگالی جسم" symbol="ρ_obj" value={st.rhoObj} min={100} max={12000} step={10} unit="kg/m³" onChange={(v) => setSt((o) => ({ ...o, rhoObj: v, mat: "custom" }))} color="#f472b6" />
      <Slider label="حجم جسم" symbol="V" value={st.V} min={0.2} max={10} step={0.1} unit="L" onChange={(v) => up("V", v)} color="#22d3ee" hint={`جرم = ρV = ${fmt(m, 2)} kg`} />
      <Slider label="جرم جسم (چگالی تغییر می‌کند)" symbol="m" value={Math.round(m * 100) / 100} min={0.05} max={50} step={0.05} unit="kg" onChange={(v) => setSt((o) => ({ ...o, rhoObj: Math.round(v / Vm3), mat: "custom" }))} color="#f87171" />
      <div className="text-xs text-slate-400 mb-1">مایع</div>
      <Segmented value={st.liquid} onChange={(k) => setSt((o) => ({ ...o, liquid: k, rhoF: k === "custom" ? o.rhoF : LIQUIDS[k].rho }))} options={Object.entries(LIQUIDS).map(([k, v]) => ({ v: k, l: v.name }))} />
      <div className="h-2" />
      <Slider label="چگالی مایع" symbol="ρ_fluid" value={st.rhoF} min={500} max={14000} step={10} unit="kg/m³" onChange={(v) => setSt((o) => ({ ...o, rhoF: v, liquid: "custom" }))} color="#fbbf24" />
      <Slider label="شتاب گرانش" symbol="g" value={st.g} min={1} max={25} step={0.1} unit="m/s²" onChange={(v) => up("g", v)} color="#a78bfa" />
      <Toggle label={st.held ? "جسم به نیروسنج آویزان است (بکش ↕)" : "جسم رها شده — تعادل طبیعی"} on={st.held} onChange={(v) => up("held", v)} />
      {st.held && <div className="mt-2"><Slider label="کسر فرورفته در مایع" symbol="V_d/V" value={st.sub} min={0} max={1} step={0.01} unit="" onChange={(v) => up("sub", v)} color="#34d399" /></div>}
    </>
  );

  const chart = (
    <>
      <Segmented value={chartX} onChange={(v) => { setChartX(v); setCollected([]); }} options={[{ v: "sub", l: "Fb برحسب عمق فرورفتن" }, { v: "V", l: "Fb برحسب V_d" }, { v: "rho", l: "Fb برحسب ρ_fluid" }]} />
      <div className="h-1" />
      {chartX === "sub" && <LiveChart fn={(x) => st.rhoF * st.g * Vm3 * Math.min(1, x)} xMin={0} xMax={1} xLabel="کسر فرورفته" yLabel="Fb (N)" current={{ x: sub, y: Fb }} collected={collected} extraLines={[{ fn: () => W, color: "#f87171", label: "W وزن" }]} title="Fb تا غوطه‌وری کامل خطی زیاد می‌شود؛ جایی که Fb = W جسم شناور می‌ماند" />}
      {chartX === "V" && <LiveChart fn={(x) => st.rhoF * st.g * x / 1000} xMin={0} xMax={10} xLabel="V_displaced (L)" yLabel="Fb (N)" current={{ x: Vd * 1000, y: Fb }} collected={collected} title={`شیب = ρ_f·g = ${fmt(st.rhoF * st.g, 0)} N/m³`} />}
      {chartX === "rho" && <LiveChart fn={(x) => x * st.g * Vd} xMin={0} xMax={14000} xLabel="ρ_fluid (kg/m³)" yLabel="Fb (N)" current={{ x: st.rhoF, y: Fb }} collected={collected} extraLines={[{ fn: () => W, color: "#f87171", label: "W وزن" }]} title="با حجم جابه‌جاشده‌ی ثابت، Fb با چگالی مایع خطی است" />}
      <DataBar count={collected.length} onAdd={() => setCollected([...collected, chartX === "sub" ? { x: sub, y: Fb } : chartX === "V" ? { x: Vd * 1000, y: Fb } : { x: st.rhoF, y: Fb }])} onClear={() => setCollected([])} />
    </>
  );

  const quiz: QuizQ[] = [
    { kind: "مفهومی", q: "دو جسم هم‌حجم از آهن و چوب کاملاً زیر آب نگه داشته شده‌اند. نیروی شناوری کدام بیشتر است؟", options: ["آهن", "چوب", "برابرند"], answer: "برابرند", explain: "Fb فقط به حجم جابه‌جاشده و چگالی مایع بستگی دارد، نه جنس جسم." },
    { kind: "پیش‌بینی", q: `اگر همین جسم (ρ=${fmt(st.rhoObj)}) را در جیوه (ρ=13600) رها کنیم چه می‌شود؟`, options: ["غرق می‌شود", "شناور می‌ماند", "معلق می‌ماند"], answer: st.rhoObj > 13600 ? "غرق می‌شود" : "شناور می‌ماند", explain: "مقایسه‌ی چگالی جسم با چگالی مایع، وضعیت شناوری را تعیین می‌کند." },
    { kind: "محاسباتی", q: `نیروی شناوری بر جسمی با حجم ${fmt(st.V)} L که ${fmt(sub * 100, 0)}% آن در ${liq.name} (ρ=${fmt(st.rhoF)} ، g=${fmt(st.g)}) فرو رفته چند نیوتون است؟`, answer: fmt(Fb, 2), numeric: { value: Fb, tol: Fb * 0.03 + 0.05, unit: "N" }, explain: `Fb = ρ_f g V_d = ${fmt(st.rhoF)}×${fmt(st.g)}×${fmt(Vd, 5)} = ${fmt(Fb, 2)} N` },
  ];

  return (
    <StationLayout
      title="ایستگاه ۷ — اصل ارشمیدس و شناوری" icon="🚢" unit="N"
      concept="جسمی را با نیروسنج در مایع پایین ببر. عدد نیروسنج کم می‌شود؛ مایع نیرویی رو به بالا وارد می‌کند. این نیرو از کجا می‌آید و اندازه‌اش چقدر است؟"
      formula={<>F_b = ρ_fluid · g · V_displaced</>} formulaSub={<>وزن ظاهری = W − F_b</>}
      values={[
        { label: "ρ جسم", value: st.rhoObj, unit: "kg/m³", color: "text-pink-300", flash: active.includes("rhoObj") },
        { label: "ρ مایع", value: st.rhoF, unit: "kg/m³", color: "text-amber-300", flash: active.includes("rhoF") },
        { label: "V جسم", value: st.V, unit: "L", flash: active.includes("V") },
        { label: "V جابه‌جاشده", value: fmt(Vd * 1000, 2), unit: "L", color: "text-cyan-300", flash: active.includes("sub") },
        { label: "وزن W", value: fmt(W, 2), unit: "N", color: "text-rose-300" },
        { label: "F_b", value: fmt(Fb, 2), unit: "N", color: "text-emerald-300" },
        { label: "وزن ظاهری", value: fmt(T, 2), unit: "N", color: "text-violet-300" },
      ]}
      result={<>{fmt(Vd * 1000, 2)} لیتر {liq.name} جابه‌جا شد (وزن آن <b className="num">{fmt(Fb, 2)} N</b>) و نیروسنج به‌جای <b className="num">{fmt(W, 2)} N</b> عدد <b className="num">{fmt(T, 2)} N</b> را نشان داد؛ اختلاف دقیقاً برابر وزن مایع جابه‌جاشده است. {state === "sink" ? "چون ρ_obj > ρ_fluid، جسم رها شده غرق می‌شود." : state === "float" ? `چون ρ_obj < ρ_fluid، جسم رها شده با ${fmt(freeSub * 100, 0)}% حجم زیر سطح شناور می‌ماند.` : "چون ρ_obj = ρ_fluid، جسم رها شده معلق می‌ماند."}</>}
      definition={{ parts: [{ t: "به هر جسم غوطه‌ور در شاره، نیروی بالاسویی وارد می‌شود که اندازه‌اش برابر " }, { t: "وزن شاره‌ی جابه‌جاشده", k: "sub" }, { t: " است؛ یعنی به " }, { t: "چگالی شاره", k: "rhoF" }, { t: " و " }, { t: "حجم فرورفته", k: "V" }, { t: " بستگی دارد، نه به " }, { t: "چگالی جسم", k: "rhoObj" }, { t: "." }], active, note }}
      scene={scene} controls={controls} chart={chart}
      levels={{
        observe: `با فرو بردن ${fmt(sub * 100, 0)}% از جسم در ${liq.name}، ${fmt(Vd * 1000, 2)} لیتر مایع بیرون ریخت و عدد نیروسنج از ${fmt(W, 2)} N به ${fmt(T, 2)} N کاهش یافت.`,
        concept: "فشار مایع با عمق زیاد می‌شود، پس فشار روی سطح زیرین جسم بیشتر از سطح بالایی است. برآیند این نیروهای فشاری، نیرویی رو به بالا (شناوری) است که اندازه‌اش دقیقاً وزن مایعی است که جای آن را جسم گرفته.",
        math: <div className="ltr num">F_b = ρ_f g V_d = {fmt(st.rhoF)} × {fmt(st.g)} × {fmt(Vd, 5)} = {fmt(Fb, 2)} N<br />W_apparent = W − F_b = {fmt(W, 2)} − {fmt(Fb, 2)} = {fmt(T, 2)} N<br />{state === "float" && <>شناور: F_b = W ⇒ V_d/V = ρ_obj/ρ_f = {fmt(freeSub, 2)}</>}</div>,
      }}
      quiz={quiz}
      onQuizRun={(i) => { if (i === 1) setSt((o) => ({ ...o, liquid: "mercury", rhoF: 13600, held: false })); if (i === 0) setSt((o) => ({ ...o, sub: 1, held: true })); }}
      onReset={() => { setSt(init); setCollected([]); }}
    />
  );
}
