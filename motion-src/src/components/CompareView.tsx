import { useEffect, useMemo, useState } from "react";
import { Params, fmt, surfaceForMu } from "../physics";
import { useSimulation } from "../useSimulation";
import LabCanvas from "./LabCanvas";
import LineChart from "./LineChart";
import { ParamControls, SimButtons, StatusPill, SurfacePicker, TimeScale } from "./Controls";

interface Props {
  initialA: Params;
  initialB: Params;
  lockControls?: boolean;
  autoStart?: boolean;
  maxTime?: number;
  header?: React.ReactNode;
  onFinished?: (a: { a: number; v: number; x: number }, b: { a: number; v: number; x: number }) => void;
}

const COLOR_A = "#6366f1";
const COLOR_B = "#f97316";

function Row({ label, a, b, unit, higherIsBetter }: { label: string; a: number; b: number; unit: string; higherIsBetter?: boolean }) {
  const diff = a - b;
  const winner = Math.abs(diff) < 1e-6 ? null : diff > 0 ? "A" : "B";
  const hl = (who: "A" | "B") =>
    winner === who && higherIsBetter !== undefined ? (who === "A" ? "bg-indigo-50 text-indigo-800" : "bg-orange-50 text-orange-800") : "";
  return (
    <tr className="border-t border-slate-100">
      <td className="py-2 text-sm font-semibold text-slate-600">{label}</td>
      <td className={`py-2 text-center num font-bold rounded ${hl("A")}`}>
        {fmt(a)} <span className="text-xs font-medium text-slate-500">{unit}</span>
      </td>
      <td className={`py-2 text-center num font-bold rounded ${hl("B")}`}>
        {fmt(b)} <span className="text-xs font-medium text-slate-500">{unit}</span>
      </td>
      <td className="py-2 text-center text-xs text-slate-500">
        {winner === null ? "برابر" : winner === "A" ? "A بیشتر" : "B بیشتر"}
      </td>
    </tr>
  );
}

export default function CompareView({ initialA, initialB, lockControls, autoStart, maxTime, header, onFinished }: Props) {
  const [pa, setPa] = useState<Params>(initialA);
  const [pb, setPb] = useState<Params>(initialB);
  const keyA = JSON.stringify(initialA);
  const keyB = JSON.stringify(initialB);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setPa(initialA), [keyA]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setPb(initialB), [keyB]);

  const list = useMemo(() => [pa, pb], [pa, pb]);
  const sim = useSimulation(list, { maxTime });
  const [sa, sb] = sim.states;
  const [ha, hb] = [sim.histories[0] ?? [], sim.histories[1] ?? []];

  useEffect(() => {
    if (autoStart) {
      const id = setTimeout(() => sim.start(), 300);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, keyA, keyB]);

  useEffect(() => {
    if (sim.status === "finished" && onFinished) {
      onFinished({ a: sa.a, v: sa.v, x: sa.x }, { a: sb.a, v: sb.v, x: sb.x });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.status]);

  const conclusion = useMemo(() => {
    const parts: string[] = [];
    const same = (x: number, y: number) => Math.abs(x - y) < 1e-6;
    if (!sa.moving && !sb.moving && sa.v === 0 && sb.v === 0) {
      return "هیچ‌کدام از دو جسم حرکت نمی‌کند؛ در هر دو، نیروی واردشده از بیشینه‌ی اصطکاک ایستایی بیشتر نیست.";
    }
    if (same(pa.force, pb.force) && same(pa.mu, pb.mu) && !same(pa.mass, pb.mass)) {
      const light = pa.mass < pb.mass ? "A" : "B";
      parts.push(
        `نیرو و سطح یکسان است ولی جرم‌ها فرق دارند. جسم سبک‌تر (${light}) شتاب بیشتری دارد؛ چون a = Fnet / m و با جرم بیشتر، هم مخرج بزرگ‌تر می‌شود و هم اصطکاک (μmg) بیشتر است.`
      );
    } else if (same(pa.mass, pb.mass) && same(pa.mu, pb.mu) && !same(pa.force, pb.force)) {
      const strong = pa.force > pb.force ? "A" : "B";
      parts.push(`جرم و سطح یکسان است. جسمی که نیروی بیشتری می‌گیرد (${strong}) شتاب بیشتری دارد؛ شتاب با نیروی خالص نسبت مستقیم دارد.`);
    } else if (same(pa.mass, pb.mass) && same(pa.force, pb.force) && !same(pa.mu, pb.mu)) {
      const smooth = pa.mu < pb.mu ? "A" : "B";
      parts.push(`تنها اصطکاک فرق دارد. روی سطح صاف‌تر (${smooth}) نیروی خالص بزرگ‌تر و شتاب بیشتر است.`);
    }
    parts.push(`شتاب A = ${fmt(sa.a)} m/s² و شتاب B = ${fmt(sb.a)} m/s².`);
    return parts.join(" ");
  }, [pa, pb, sa, sb]);

  return (
    <div className="space-y-4">
      {header}
      {!lockControls && (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { t: "جسم A", p: pa, set: setPa, c: COLOR_A, bg: "border-indigo-200" },
            { t: "جسم B", p: pb, set: setPb, c: COLOR_B, bg: "border-orange-200" },
          ].map((o) => (
            <div key={o.t} className={`rounded-2xl border-2 ${o.bg} bg-white p-4 shadow-sm space-y-4`}>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded" style={{ background: o.c }} />
                <h3 className="text-base font-extrabold text-slate-800">{o.t}</h3>
              </div>
              <SurfacePicker mu={o.p.mu} onPick={(_, mu) => o.set({ ...o.p, mu })} />
              <ParamControls params={o.p} onChange={o.set} compact accent={o.c} />
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800">حرکت هم‌زمان دو جسم</h3>
          <StatusPill status={sim.status} />
        </div>
        <LabCanvas
          lanes={[
            { state: sa, params: pa, color: COLOR_A, label: "A", trail: ha.map((h) => h.x), surface: surfaceForMu(pa.mu) },
            { state: sb, params: pb, color: COLOR_B, label: "B", trail: hb.map((h) => h.x), surface: surfaceForMu(pb.mu) },
          ]}
          surface="wood"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SimButtons status={sim.status} onStart={sim.start} onPause={sim.pause} onResume={sim.resume} onReset={sim.reset} />
          <TimeScale value={sim.timeScale} onChange={sim.setTimeScale} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-extrabold text-slate-800">
            جدول مقایسه <span className="num text-xs font-medium text-slate-500">(t = {fmt(sa.t)} s)</span>
          </h3>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-500">
                <th className="text-right py-1 font-semibold">کمیت</th>
                <th className="py-1 font-bold text-indigo-600">جسم A</th>
                <th className="py-1 font-bold text-orange-600">جسم B</th>
                <th className="py-1 font-semibold">نتیجه</th>
              </tr>
            </thead>
            <tbody>
              <Row label="جرم" a={pa.mass} b={pb.mass} unit="kg" />
              <Row label="نیروی واردشده" a={pa.force} b={pb.force} unit="N" />
              <Row label="اصطکاک" a={Math.abs(sa.friction)} b={Math.abs(sb.friction)} unit="N" />
              <Row label="نیروی خالص" a={sa.net} b={sb.net} unit="N" higherIsBetter />
              <Row label="شتاب" a={sa.a} b={sb.a} unit="m/s²" higherIsBetter />
              <Row label="سرعت" a={sa.v} b={sb.v} unit="m/s" higherIsBetter />
              <Row label="جابه‌جایی" a={sa.x} b={sb.x} unit="m" higherIsBetter />
            </tbody>
          </table>
          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-sm leading-7 text-slate-700">
            <span className="font-extrabold text-indigo-700">نتیجه‌گیری: </span>
            {conclusion}
          </div>
        </div>
        <div className="grid gap-4">
          <LineChart
            title="سرعت بر حسب زمان"
            yUnit="m/s"
            height={180}
            series={[
              { name: "A", color: COLOR_A, points: ha.map((h) => ({ x: h.t, y: h.v })) },
              { name: "B", color: COLOR_B, points: hb.map((h) => ({ x: h.t, y: h.v })) },
            ]}
          />
          <LineChart
            title="جابه‌جایی بر حسب زمان"
            yUnit="m"
            height={180}
            series={[
              { name: "A", color: COLOR_A, points: ha.map((h) => ({ x: h.t, y: h.x })) },
              { name: "B", color: COLOR_B, points: hb.map((h) => ({ x: h.t, y: h.x })) },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
