import { useMemo, useState } from "react";
import { Params, SurfaceKey, fmt, surfaceForMu } from "../physics";
import { useSimulation } from "../useSimulation";
import LabCanvas from "./LabCanvas";
import DataPanel from "./DataPanel";
import LineChart from "./LineChart";
import { ParamControls, SimButtons, StatusPill, SurfacePicker, TimeScale } from "./Controls";

interface Props {
  params: Params;
  onParamsChange: (p: Params) => void;
  header?: React.ReactNode;
  onRunFinished?: (result: { a: number; v: number; x: number; t: number; moving: boolean }) => void;
}

export function explain(p: Params, s: { moving: boolean; frictionMax: number; net: number; a: number; v: number }) {
  const F = p.force;
  const fmax = s.frictionMax;
  if (!s.moving && s.v === 0) {
    if (F === 0)
      return {
        tone: "slate",
        title: "هیچ نیرویی وارد نمی‌شود",
        text: "نیروی واردشده صفر است و جسم ساکن می‌ماند. برای حرکت، باید نیرویی بزرگ‌تر از بیشینه‌ی اصطکاک ایستایی وارد کنی.",
      };
    return {
      tone: "red",
      title: "اصطکاک ایستایی برنده شد!",
      text: `نیروی واردشده (${fmt(F, 0)} N) از بیشینه‌ی اصطکاک ایستایی (μN = ${fmt(fmax, 1)} N) بیشتر نیست؛ اصطکاک دقیقاً با نیروی تو برابری می‌کند، نیروی خالص صفر است و جسم تکان نمی‌خورد. یا نیرو را بیشتر کن، یا جرم/ضریب اصطکاک را کم کن.`,
    };
  }
  if (s.net > 0.01)
    return {
      tone: "green",
      title: "نیروی خالص مثبت ← شتاب مثبت",
      text: `نیروی واردشده (${fmt(F, 0)} N) از اصطکاک جنبشی (${fmt(fmax, 1)} N) بزرگ‌تر است. نیروی خالص ${fmt(s.net, 1)} N است و طبق قانون دوم نیوتن جسم با شتاب a = ${fmt(s.net, 1)} ÷ ${p.mass} = ${fmt(s.a)} m/s² تندتر می‌شود.`,
    };
  if (s.net < -0.01)
    return {
      tone: "amber",
      title: "نیروی خالص منفی ← جسم کند می‌شود",
      text: `اصطکاک (${fmt(fmax, 1)} N) از نیروی واردشده (${fmt(F, 0)} N) بزرگ‌تر است. نیروی خالص در خلاف جهت حرکت است (${fmt(s.net, 1)} N) و جسم با شتاب ${fmt(s.a)} m/s² کند می‌شود تا بایستد.`,
    };
  return {
    tone: "sky",
    title: "نیروی خالص صفر ← سرعت ثابت",
    text: `نیروی واردشده و اصطکاک دقیقاً برابرند؛ پس نیروی خالص و شتاب صفرند و جسم با سرعت ثابت ${fmt(s.v)} m/s حرکت می‌کند (قانون اول نیوتن).`,
  };
}

const toneClass: Record<string, string> = {
  slate: "border-slate-200 bg-slate-50 text-slate-700",
  red: "border-red-200 bg-red-50 text-red-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  sky: "border-sky-200 bg-sky-50 text-sky-800",
};

export default function LabView({ params, onParamsChange, header }: Props) {
  const list = useMemo(() => [params], [params]);
  const sim = useSimulation(list);
  const s = sim.states[0];
  const hist = sim.histories[0] ?? [];
  const [showForces, setShowForces] = useState(true);
  const [showNet, setShowNet] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const surface: SurfaceKey = surfaceForMu(params.mu);
  const info = explain(params, s);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* control panel */}
      <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-800">پنل کنترل</h3>
          <StatusPill status={sim.status} />
        </div>
        <SurfacePicker mu={params.mu} onPick={(_, mu) => onParamsChange({ ...params, mu })} />
        <ParamControls params={params} onChange={onParamsChange} />
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-500">نمایش</p>
          <div className="flex flex-wrap gap-2">
            {[
              { l: "فلش نیروها", v: showForces, f: setShowForces },
              { l: "نیروی خالص", v: showNet, f: setShowNet },
              { l: "مسیر حرکت", v: showTrail, f: setShowTrail },
            ].map((o) => (
              <button
                key={o.l}
                onClick={() => o.f(!o.v)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                  o.v ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {o.v ? "✓ " : ""}
                {o.l}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-600 space-y-1">
          <p className="font-bold text-slate-700">فرمول‌های به‌کاررفته</p>
          <p className="num" dir="ltr">N = m × g = {params.mass} × 9.81 = {fmt(s.normal, 1)} N</p>
          <p className="num" dir="ltr">f = μ × N = {params.mu} × {fmt(s.normal, 1)} = {fmt(s.frictionMax, 1)} N</p>
          <p className="num" dir="ltr">Fnet = F − f = {fmt(params.force, 0)} − {fmt(Math.abs(s.friction), 1)} = {fmt(s.net, 1)} N</p>
          <p className="num" dir="ltr">a = Fnet / m = {fmt(s.net, 1)} / {params.mass} = {fmt(s.a)} m/s²</p>
        </div>
      </aside>

      {/* lab area */}
      <section className="space-y-4 min-w-0">
        {header}
        <DataPanel state={s} params={params} />
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-3">
          <LabCanvas
            lanes={[{ state: s, params, color: "#6366f1", trail: hist.map((h) => h.x) }]}
            surface={surface}
            showForces={showForces}
            showNet={showNet}
            showTrail={showTrail}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SimButtons status={sim.status} onStart={sim.start} onPause={sim.pause} onResume={sim.resume} onReset={sim.reset} />
            <TimeScale value={sim.timeScale} onChange={sim.setTimeScale} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <span><i className="inline-block h-2 w-4 rounded bg-green-600 align-middle ml-1" />نیروی واردشده</span>
            <span><i className="inline-block h-2 w-4 rounded bg-red-600 align-middle ml-1" />اصطکاک</span>
            <span><i className="inline-block h-2 w-4 rounded bg-blue-600 align-middle ml-1" />وزن</span>
            <span><i className="inline-block h-2 w-4 rounded bg-sky-500 align-middle ml-1" />نیروی نرمال</span>
            <span><i className="inline-block h-2 w-4 rounded bg-yellow-500 align-middle ml-1" />نیروی خالص</span>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 text-sm leading-7 ${toneClass[info.tone]}`}>
          <p className="font-extrabold">💡 {info.title}</p>
          <p>{info.text}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <LineChart
            title="سرعت بر حسب زمان (v–t)"
            yUnit="m/s"
            series={[{ name: "سرعت", color: "#0891b2", points: hist.map((h) => ({ x: h.t, y: h.v })) }]}
          />
          <LineChart
            title="نیروی خالص بر حسب زمان (Fnet–t)"
            yUnit="N"
            series={[{ name: "نیروی خالص", color: "#ca8a04", points: hist.map((h) => ({ x: h.t, y: h.net })) }]}
          />
        </div>
      </section>
    </div>
  );
}
