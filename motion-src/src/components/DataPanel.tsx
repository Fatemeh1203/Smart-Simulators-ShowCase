import { BodyState, Params, fmt } from "../physics";

function Stat({
  label,
  value,
  unit,
  color,
  sub,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="num text-lg font-extrabold text-slate-900">{value}</span>
        <span className="num text-xs font-semibold text-slate-500">{unit}</span>
      </div>
      {sub && <div className="mt-0.5 text-[10px] text-slate-400 num">{sub}</div>}
    </div>
  );
}

export default function DataPanel({ state: s, params: p }: { state: BodyState; params: Params }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="نیروی واردشده" value={fmt(p.force, 0)} unit="N" color="#16a34a" />
        <Stat
          label="نیروی اصطکاک"
          value={fmt(Math.abs(s.friction), 1)}
          unit="N"
          color="#dc2626"
          sub={`μN = ${fmt(s.frictionMax, 1)} N`}
        />
        <Stat label="نیروی نرمال" value={fmt(s.normal, 1)} unit="N" color="#0ea5e9" sub="N = m·g" />
        <Stat label="نیروی وزن" value={fmt(s.weight, 1)} unit="N" color="#2563eb" sub="W = m·g" />
        <Stat label="نیروی خالص" value={fmt(s.net, 1)} unit="N" color="#eab308" sub="F − f" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="شتاب" value={fmt(s.a)} unit="m/s²" color="#a855f7" sub="a = Fnet / m" />
        <Stat label="سرعت" value={fmt(s.v)} unit="m/s" color="#0891b2" />
        <Stat label="جابه‌جایی" value={fmt(s.x)} unit="m" color="#f97316" />
        <Stat label="زمان" value={fmt(s.t)} unit="s" color="#64748b" />
        <div
          className={`rounded-xl border px-3 py-2.5 shadow-sm flex flex-col justify-center ${
            s.moving ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-slate-50"
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500">وضعیت جسم</div>
          <div className={`mt-1 flex items-center gap-2 text-base font-extrabold ${s.moving ? "text-emerald-700" : "text-slate-700"}`}>
            <span className={`h-3 w-3 rounded-full ${s.moving ? "bg-emerald-500 pulse-soft" : "bg-slate-400"}`} />
            {s.moving ? "در حال حرکت" : "ساکن"}
          </div>
        </div>
      </div>
    </div>
  );
}
