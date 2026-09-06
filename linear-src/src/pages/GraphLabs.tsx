import { useEffect, useMemo, useState } from "react";
import { CoordinatePlane, MiniGraph, eqOfPoints } from "../components/CoordinatePlane";
import { Btn, Card, Formula, Frac, I, Icon, Insight, Tag } from "../components/UI";
import { useApp } from "../context";
import { matchCards } from "../data";
import {
  equationFromMB,
  formatNum,
  fracPair,
  intercept,
  kindLabel,
  lineY,
  parseEquation,
  relation,
  round,
  slope,
  slopeKind,
  toFa,
} from "../math";
import type { Point } from "../types";
import lab3d from "../assets/lab-3d.jpg";

const A = (x: number, y: number): Point => ({ id: "A", x, y, label: "A", color: "#22d3ee" });
const B = (x: number, y: number): Point => ({ id: "B", x, y, label: "B", color: "#a78bfa" });

function Toolbar({
  grid,
  setGrid,
  onReset,
  extra,
}: {
  grid: boolean;
  setGrid: (v: boolean) => void;
  onReset: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Btn variant="soft" onClick={() => setGrid(!grid)} className="!py-2 text-xs">
        <Icon d={I.grid} className="h-4 w-4" />
        {grid ? "شبکه روشن" : "شبکه خاموش"}
      </Btn>
      <Btn variant="soft" onClick={onReset} className="!py-2 text-xs">
        <Icon d={I.reset} className="h-4 w-4" />
        بازنشانی
      </Btn>
      {extra}
    </div>
  );
}

function Info({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] p-3">
      <div className="text-[11px] text-[var(--text-mute)]">{label}</div>
      <div className="mt-1 font-bold ltr text-right">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-[var(--text-mute)]">{sub}</div>}
    </div>
  );
}

export function PlaneLab() {
  const { addXp, earnBadge } = useApp();
  const [pts, setPts] = useState<Point[]>([A(2, 3), B(-3, 1)]);
  const [grid, setGrid] = useState(true);
  const [n, setN] = useState(2);
  useEffect(() => {
    if (n >= 6) earnBadge("line-hunter");
  }, [n, earnBadge]);
  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <Card className="min-h-[420px] p-3 md:min-h-[520px]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-bold">آزمایشگاه صفحه مختصات</h2>
          <Toolbar
            grid={grid}
            setGrid={setGrid}
            onReset={() => setPts([A(2, 3), B(-3, 1)])}
            extra={
              <Btn
                variant="soft"
                className="!py-2 text-xs"
                onClick={() => {
                  const id = String.fromCharCode(65 + pts.length);
                  const colors = ["#22d3ee", "#a78bfa", "#f472b6", "#34d399", "#fbbf24"];
                  setPts([...pts, { id, x: 0, y: 0, label: id, color: colors[pts.length % colors.length] }]);
                  setN((x) => x + 1);
                  addXp(8, "نقطه جدید روی صفحه");
                }}
              >
                <Icon d={I.plus} className="h-4 w-4" />
                نقطه
              </Btn>
            }
          />
        </div>
        <div className="h-[360px] md:h-[460px]">
          <CoordinatePlane points={pts} onPointsChange={setPts} showGrid={grid} />
        </div>
      </Card>
      <div className="space-y-3">
        <Card>
          <h3 className="font-bold">نقاط</h3>
          <p className="mt-1 text-sm text-[var(--text-mute)]">هر نقطه را بکش. مختصات همان لحظه به‌روز می‌شود.</p>
          <div className="mt-3 space-y-2">
            {pts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl bg-[var(--bg-soft)] px-3 py-2 text-sm">
                <span className="font-bold" style={{ color: p.color }}>
                  {p.label}
                </span>
                <span className="ltr">
                  ({formatNum(p.x)}, {formatNum(p.y)})
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Insight text="اول x را بخوان (چپ و راست)، بعد y را (بالا و پایین). مبدأ همان (0, 0) است." />
      </div>
    </div>
  );
}

export function SlopeLab() {
  const { setMission, mission, addXp } = useApp();
  const [pts, setPts] = useState<Point[]>([A(-2, -1), B(3, 2)]);
  const [grid, setGrid] = useState(true);
  const [tri, setTri] = useState(true);
  const a = pts[0],
    b = pts[1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const m = slope(a.x, a.y, b.x, b.y);
  const kind = slopeKind(m);
  const fr = fracPair(dy, dx);

  useEffect(() => {
    if (kind === "pos" && !mission.pos) {
      setMission({ pos: true });
      addXp(20, "شیب مثبت پیدا شد");
    }
    if (kind === "neg" && !mission.neg) {
      setMission({ neg: true });
      addXp(20, "شیب منفی پیدا شد");
    }
    if (kind === "zero" && !mission.zero) {
      setMission({ zero: true });
      addXp(20, "شیب صفر پیدا شد");
    }
  }, [kind]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
      <Card className="p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">آزمایشگاه شیب</h2>
          <Toolbar
            grid={grid}
            setGrid={setGrid}
            onReset={() => setPts([A(-2, -1), B(3, 2)])}
            extra={
              <>
                <Btn variant="soft" className="!py-2 text-xs" onClick={() => setTri(!tri)}>
                  مثلث شیب {tri ? "روشن" : "خاموش"}
                </Btn>
                <Btn variant="soft" className="!py-2 text-xs" onClick={() => setPts([A(-3, -2), B(3, 2)])}>
                  مثبت
                </Btn>
                <Btn variant="soft" className="!py-2 text-xs" onClick={() => setPts([A(-3, 3), B(3, -1)])}>
                  منفی
                </Btn>
                <Btn variant="soft" className="!py-2 text-xs" onClick={() => setPts([A(-3, 1), B(3, 1)])}>
                  صفر
                </Btn>
                <Btn variant="soft" className="!py-2 text-xs" onClick={() => setPts([A(2, -3), B(2, 3)])}>
                  عمودی
                </Btn>
              </>
            }
          />
        </div>
        <div className="h-[380px] md:h-[480px]">
          <CoordinatePlane
            points={pts}
            onPointsChange={setPts}
            showGrid={grid}
            showTriangle={tri}
            triangleFrom={["A", "B"]}
            lines={[{ id: "l", a: "A", b: "B", color: "#818cf8" }]}
          />
        </div>
      </Card>
      <div className="space-y-3">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-bold">محاسبه زنده</h3>
            <Tag tone={kind === "pos" ? "ok" : kind === "neg" ? "danger" : kind === "zero" ? "warn" : "mute"}>{kindLabel(kind)}</Tag>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Info label="نقطه A" value={`(${formatNum(a.x)}, ${formatNum(a.y)})`} />
            <Info label="نقطه B" value={`(${formatNum(b.x)}, ${formatNum(b.y)})`} />
            <Info label="Δx" value={formatNum(dx)} sub="تغییر افقی" />
            <Info label="Δy" value={formatNum(dy)} sub="تغییر عمودی" />
          </div>
          <div className="mt-4 rounded-2xl bg-indigo-500/10 p-3 text-center">
            <div className="text-xs text-[var(--text-mute)]">شیب = تغییرات y ÷ تغییرات x</div>
            <div className="mt-2 flex items-center justify-center gap-2 text-xl font-black">
              <span className="formula">m</span>=
              {fr.undef ? (
                <span>تعریف‌نشده</span>
              ) : (
                <Frac n={fr.n} d={fr.d} />
              )}
              {!fr.undef && <span className="text-sm font-semibold text-[var(--text-mute)]">= {formatNum(m ?? 0)}</span>}
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold">چهار حالت شیب</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {[
              ["مثبت", "صعود از چپ به راست", "ok"],
              ["منفی", "نزول از چپ به راست", "danger"],
              ["صفر", "خط افقی", "warn"],
              ["تعریف‌نشده", "خط عمودی", "mute"],
            ].map(([t, d, tone]) => (
              <div key={t} className="rounded-2xl border border-[var(--line)] p-2">
                <Tag tone={tone as "ok"}>{t}</Tag>
                <div className="mt-1 text-[var(--text-mute)]">{d}</div>
              </div>
            ))}
          </div>
        </Card>
        <Insight text="نقاط را آن‌قدر جابه‌جا کن تا هر چهار حالت را با چشم ببینی. فرمول بعد از دیدن معنا پیدا می‌کند." />
      </div>
    </div>
  );
}

export function EquationLab() {
  const { earnBadge, addXp } = useApp();
  const [m, setM] = useState(1);
  const [b, setB] = useState(2);
  const [grid, setGrid] = useState(true);
  const pts: Point[] = [
    { id: "P", x: 0, y: b, label: "b", color: "#fbbf24" },
    { id: "Q", x: 2, y: m * 2 + b, label: "", color: "#22d3ee" },
  ];
  useEffect(() => {
    if (Math.abs(m - 2) < 0.05 && Math.abs(b - 1) < 0.05) {
      earnBadge("eq-pro");
      addXp(12, "کشف y = 2x + 1");
    }
  }, [m, b]);
  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
      <Card className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">از معادله تا نمودار</h2>
          <Toolbar grid={grid} setGrid={setGrid} onReset={() => { setM(1); setB(2); }} />
        </div>
        <div className="h-[360px] md:h-[460px]">
          <CoordinatePlane
            points={pts}
            readOnly
            showGrid={grid}
            showCoords={false}
            lines={[{ id: "l", a: "P", m, intercept: b, color: "#818cf8" }]}
          />
        </div>
      </Card>
      <div className="space-y-3">
        <Card>
          <div className="text-center">
            <div className="text-xs text-[var(--text-mute)]">معادله زنده</div>
            <div className="mt-2 text-3xl font-black">
              <Formula className="!bg-transparent !px-0 text-3xl">{equationFromMB(m, b)}</Formula>
            </div>
          </div>
          <label className="mt-5 block text-sm">
            <div className="mb-1 flex justify-between">
              <span>شیب m</span>
              <span className="ltr font-bold">{formatNum(m)}</span>
            </div>
            <input type="range" min={-5} max={5} step={0.1} value={m} onChange={(e) => setM(Number(e.target.value))} className="w-full" />
          </label>
          <label className="mt-4 block text-sm">
            <div className="mb-1 flex justify-between">
              <span>عرض از مبدأ b</span>
              <span className="ltr font-bold">{formatNum(b)}</span>
            </div>
            <input type="range" min={-6} max={6} step={0.1} value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full" />
          </label>
          <p className="mt-4 text-sm leading-7 text-[var(--text-mute)]">
            به ازای هر ۱ واحد افزایش x، مقدار y به اندازه {formatNum(m)} واحد {m >= 0 ? "افزایش" : "کاهش"} می‌یابد. خط محور y را در{" "}
            <span className="ltr">(0, {formatNum(b)})</span> قطع می‌کند.
          </p>
        </Card>
        <Insight text="m خط را می‌چرخاند. b خط را بدون چرخش بالا و پایین می‌برد. این دو را جدا از هم حس کن." />
      </div>
    </div>
  );
}

export function GraphToEqLab() {
  const [pts, setPts] = useState<Point[]>([A(0, 1), B(3, 4)]);
  const [grid, setGrid] = useState(true);
  const a = pts[0],
    b = pts[1];
  const m = slope(a.x, a.y, b.x, b.y);
  const bb = intercept(m, a.x, a.y);
  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
      <Card className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">از نمودار تا معادله</h2>
          <Toolbar grid={grid} setGrid={setGrid} onReset={() => setPts([A(0, 1), B(3, 4)])} />
        </div>
        <div className="h-[360px] md:h-[460px]">
          <CoordinatePlane
            points={pts}
            onPointsChange={setPts}
            showGrid={grid}
            showTriangle
            lines={[{ id: "l", a: "A", b: "B", color: "#22d3ee" }]}
          />
        </div>
      </Card>
      <div className="space-y-3">
        <Card>
          <h3 className="font-bold">سیستم معادله را می‌نویسد</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div>شیب = {m === null ? "تعریف‌نشده" : formatNum(m)}</div>
            <div>عرض از مبدأ = {bb === null ? "—" : formatNum(bb)}</div>
          </div>
          <div className="mt-4 rounded-2xl bg-cyan-500/10 p-4 text-center text-2xl font-black">
            <span className="formula">{eqOfPoints(a, b)}</span>
          </div>
        </Card>
        <Insight text="خط را جابه‌جا کن و ببین معادله خودش را با تو هماهنگ می‌کند." />
      </div>
    </div>
  );
}

export function TwoPointLab() {
  const { earnBadge } = useApp();
  const [pts, setPts] = useState<Point[]>([A(1, 2), B(4, 8)]);
  const [grid, setGrid] = useState(true);
  const [step, setStep] = useState(1);
  const a = pts[0],
    b = pts[1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const m = slope(a.x, a.y, b.x, b.y);
  const bb = intercept(m, a.x, a.y);
  useEffect(() => {
    if (step >= 5) earnBadge("solver");
  }, [step, earnBadge]);
  void bb;
  const steps = [
    { t: "محاسبه Δx و Δy", body: `Δx = ${formatNum(b.x)} − ${formatNum(a.x)} = ${formatNum(dx)} · Δy = ${formatNum(b.y)} − ${formatNum(a.y)} = ${formatNum(dy)}` },
    { t: "محاسبه شیب", body: m === null ? "Δx = 0 پس شیب تعریف نشده است." : `m = ${formatNum(dy)} / ${formatNum(dx)} = ${formatNum(m)}` },
    { t: "فرم خط", body: "y = mx + b" },
    { t: "جایگذاری یک نقطه", body: m === null ? "معادله به صورت x = ثابت است." : `${formatNum(a.y)} = (${formatNum(m)})(${formatNum(a.x)}) + b` },
    { t: "معادله نهایی", body: eqOfPoints(a, b) },
  ];
  return (
    <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
      <Card className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">شبیه‌ساز دو نقطه</h2>
          <Toolbar grid={grid} setGrid={setGrid} onReset={() => { setPts([A(1, 2), B(4, 8)]); setStep(1); }} />
        </div>
        <div className="h-[340px] md:h-[440px]">
          <CoordinatePlane points={pts} onPointsChange={setPts} showGrid={grid} showTriangle lines={[{ id: "l", a: "A", b: "B", color: "#f472b6" }]} />
        </div>
      </Card>
      <div className="space-y-3">
        <Card>
          <h3 className="font-bold">حل مرحله‌ای</h3>
          <div className="mt-3 space-y-2">
            {steps.map((s, i) => (
              <button
                key={s.t}
                onClick={() => setStep(i + 1)}
                className={`w-full rounded-2xl border p-3 text-right text-sm transition ${
                  step >= i + 1 ? "border-indigo-400/40 bg-indigo-500/10" : "border-[var(--line)] opacity-50"
                }`}
              >
                <div className="text-[11px] text-[var(--text-mute)]">مرحله {toFa(i + 1)}</div>
                <div className="font-bold">{s.t}</div>
                {step >= i + 1 && <div className="mt-1 ltr text-right text-[var(--text-soft)]">{s.body}</div>}
              </button>
            ))}
          </div>
          {step < 5 && (
            <Btn className="mt-3 w-full" onClick={() => setStep((x) => Math.min(5, x + 1))}>
              مرحله بعد
            </Btn>
          )}
        </Card>
      </div>
    </div>
  );
}

export function ExploreLab() {
  const [pts, setPts] = useState<Point[]>([A(-2, 1), B(3, 2)]);
  const [grid, setGrid] = useState(true);
  const [raw, setRaw] = useState("y=2x+1");
  const [mb, setMb] = useState<{ m: number; b: number } | null>({ m: 2, b: 1 });
  const a = pts[0],
    b = pts[1];
  const m = slope(a.x, a.y, b.x, b.y);
  const bb = intercept(m, a.x, a.y);
  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
      <Card className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">کاوش آزاد</h2>
          <Toolbar grid={grid} setGrid={setGrid} onReset={() => setPts([A(-2, 1), B(3, 2)])} />
        </div>
        <div className="h-[360px] md:h-[460px]">
          <CoordinatePlane
            points={pts}
            onPointsChange={setPts}
            showGrid={grid}
            showTriangle
            lines={[
              { id: "ab", a: "A", b: "B", color: "#818cf8" },
              ...(mb ? [{ id: "eq", a: "A", m: mb.m, intercept: mb.b, color: "#22d3ee", dashed: true }] : []),
            ]}
          />
        </div>
      </Card>
      <div className="space-y-3">
        <Card>
          <h3 className="font-bold">خط نقاط</h3>
          <div className="mt-2 text-lg font-black">
            <span className="formula">{eqOfPoints(a, b)}</span>
          </div>
          <div className="mt-2 text-sm text-[var(--text-mute)]">
            شیب {m === null ? "تعریف‌نشده" : formatNum(m)} · b = {bb === null ? "—" : formatNum(bb)}
          </div>
        </Card>
        <Card>
          <h3 className="font-bold">ورود معادله</h3>
          <input
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="focus-ring mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-2 ltr"
            placeholder="y=2x+1"
          />
          <Btn
            className="mt-3 w-full"
            onClick={() => {
              const p = parseEquation(raw);
              setMb(p);
            }}
          >
            رسم معادله
          </Btn>
          {mb && (
            <p className="mt-2 text-sm">
              خط چین: <span className="formula">{equationFromMB(mb.m, mb.b)}</span>
            </p>
          )}
        </Card>
        <Insight text="خط بنفش از دو نقطه ساخته شده و خط چین از معادله. ببین کی روی هم می‌افتند." />
      </div>
    </div>
  );
}

export function CompareLab() {
  const [m, setM] = useState(2);
  const [b, setB] = useState(1);
  const xs = [-2, -1, 0, 1, 2, 3];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="font-bold">معادله</h3>
        <div className="mt-3 text-center text-3xl font-black">
          <span className="formula">{equationFromMB(m, b)}</span>
        </div>
        <label className="mt-5 block text-sm">
          m = {formatNum(m)}
          <input className="mt-2 w-full" type="range" min={-4} max={4} step={0.1} value={m} onChange={(e) => setM(+e.target.value)} />
        </label>
        <label className="mt-3 block text-sm">
          b = {formatNum(b)}
          <input className="mt-2 w-full" type="range" min={-4} max={4} step={0.1} value={b} onChange={(e) => setB(+e.target.value)} />
        </label>
      </Card>
      <Card className="h-[280px] p-2">
        <CoordinatePlane
          readOnly
          showCoords={false}
          points={[{ id: "b", x: 0, y: b, label: "b", color: "#fbbf24" }]}
          lines={[{ id: "l", a: "b", m, intercept: b, color: "#818cf8" }]}
        />
      </Card>
      <Card>
        <h3 className="font-bold">جدول داده</h3>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-[var(--text-mute)]">
              <th className="p-2">x</th>
              <th className="p-2">y</th>
            </tr>
          </thead>
          <tbody>
            {xs.map((x) => (
              <tr key={x} className="border-t border-[var(--line)]">
                <td className="p-2 ltr text-center">{x}</td>
                <td className="p-2 ltr text-center">{formatNum(lineY(m, b, x))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <h3 className="font-bold">توضیح</h3>
        <p className="mt-3 leading-8 text-sm">
          به ازای هر ۱ واحد افزایش x، مقدار y به اندازه {formatNum(m)} واحد {m >= 0 ? "افزایش" : "کاهش"} می‌یابد. وقتی x = 0 باشد، y برابر{" "}
          {formatNum(b)} است. این چهار نما — معادله، نمودار، جدول و توضیح — همیشه به هم وصل‌اند.
        </p>
      </Card>
    </div>
  );
}

export function MatchingGame() {
  const { addXp, earnBadge, markAnswer } = useApp();
  const [sel, setSel] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const graphs = useMemo(() => [...matchCards].sort(() => Math.random() - 0.4), []);
  const done = Object.keys(pairs).length === matchCards.length;
  const allOk = done && matchCards.every((c) => pairs[c.id] === c.id);
  useEffect(() => {
    if (allOk) earnBadge("graph-master");
  }, [allOk, earnBadge]);
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-bold">بازی اتصال معادله و نمودار</h2>
        <p className="mt-1 text-sm text-[var(--text-mute)]">یک معادله را انتخاب کن، بعد نمودار درست را بزن.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          {matchCards.map((c) => (
            <button
              key={c.id}
              onClick={() => setSel(c.id)}
              className={`w-full rounded-2xl border p-3 text-right font-bold transition ${
                sel === c.id ? "border-indigo-400 bg-indigo-500/15" : "border-[var(--line)] glass"
              } ${pairs[c.id] ? "opacity-60" : ""}`}
            >
              <span className="formula">{c.eq}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {graphs.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                if (!sel) return;
                const ok = sel === g.id;
                markAnswer(ok);
                if (ok) {
                  setPairs((p) => ({ ...p, [sel]: g.id }));
                  addXp(15, "اتصال درست معادله و نمودار");
                  setSel(null);
                }
              }}
              className="overflow-hidden rounded-2xl border border-[var(--line)]"
            >
              <div className="h-28">
                <MiniGraph m={g.m} b={g.b} color={pairs[g.id] ? "#34d399" : "#818cf8"} />
              </div>
            </button>
          ))}
        </div>
      </div>
      {allOk && <Insight text="همه اتصال‌ها درست بود. معادله و نمودار حالا یک چیزند." />}
    </div>
  );
}

export function Challenges() {
  const { markAnswer, addXp } = useApp();
  const [m, setM] = useState(1);
  const [b, setB] = useState(0);
  const [msg, setMsg] = useState("");
  const target = { m: 3, b: 2 };
  const ok = Math.abs(m - target.m) < 0.15 && Math.abs(b - target.b) < 0.15;
  const [pts, setPts] = useState<Point[]>([A(0, 0), B(2, 2)]);
  const a = pts[0],
    p2 = pts[1];
  const pass = Math.abs(a.x - 1) < 0.2 && Math.abs(a.y - 2) < 0.2 && Math.abs(p2.x - 3) < 0.2 && Math.abs(p2.y - 6) < 0.2;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <Tag>چالش ۱</Tag>
        <h3 className="mt-2 font-bold">خطی با شیب ۳ و عرض از مبدأ ۲ بساز</h3>
        <p className="mt-1 text-sm text-[var(--text-mute)]">هدف: y = 3x + 2</p>
        <div className="mt-3 h-56">
          <CoordinatePlane
            readOnly
            showCoords={false}
            points={[{ id: "b", x: 0, y: b, label: "", color: "#22d3ee" }]}
            lines={[{ id: "l", a: "b", m, intercept: b, color: "#818cf8" }]}
          />
        </div>
        <label className="mt-3 block text-sm">
          m = {formatNum(m)}
          <input className="mt-1 w-full" type="range" min={-5} max={5} step={0.1} value={m} onChange={(e) => setM(+e.target.value)} />
        </label>
        <label className="mt-2 block text-sm">
          b = {formatNum(b)}
          <input className="mt-1 w-full" type="range" min={-5} max={5} step={0.1} value={b} onChange={(e) => setB(+e.target.value)} />
        </label>
        <Btn
          className="mt-3 w-full"
          onClick={() => {
            if (ok) {
              markAnswer(true);
              addXp(40, "چالش شیب و عرض از مبدأ");
              setMsg("دقیق بود. خط روی هدف نشست.");
            } else {
              markAnswer(false);
              const bits = [];
              if (Math.abs(m - 3) >= 0.15) bits.push("شیب هنوز ۳ نیست؛ لغزنده m را جلوتر ببر.");
              if (Math.abs(b - 2) >= 0.15) bits.push("عرض از مبدأ باید ۲ باشد؛ نقطه قطع محور y را ببین.");
              setMsg(bits.join(" "));
            }
          }}
        >
          بررسی دقت
        </Btn>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </Card>
      <Card>
        <Tag tone="warn">چالش ۲</Tag>
        <h3 className="mt-2 font-bold">نقاط را روی (۱، ۲) و (۳، ۶) بگذار</h3>
        <div className="mt-3 h-56">
          <CoordinatePlane points={pts} onPointsChange={setPts} showTriangle lines={[{ id: "l", a: "A", b: "B", color: "#f472b6" }]} />
        </div>
        <Btn
          className="mt-3 w-full"
          onClick={() => {
            if (pass) {
              markAnswer(true);
              addXp(40, "چالش دو نقطه");
            } else {
              markAnswer(false);
            }
          }}
        >
          بررسی نقاط
        </Btn>
        <p className="mt-2 text-sm text-[var(--text-mute)]">
          {pass ? "نقاط درست‌اند. معادله این خط y = 2x است." : "نقطه انتخاب‌شده هنوز روی هدف نیست. به مختصات کنار نقطه نگاه کن."}
        </p>
      </Card>
    </div>
  );
}

export function SolverPage() {
  const [step, setStep] = useState(0);
  const steps = [
    { t: "صورت مسئله", body: "معادله خطی را بیابید که از نقاط A(1, 3) و B(3, 7) عبور می‌کند." },
    { t: "محاسبه شیب", body: "m = (7 − 3) / (3 − 1) = 4 / 2 = 2" },
    { t: "فرم خط", body: "y = mx + b → y = 2x + b" },
    { t: "جایگذاری نقطه A", body: "3 = 2(1) + b" },
    { t: "یافتن b", body: "3 = 2 + b → b = 1" },
    { t: "معادله نهایی", body: "y = 2x + 1" },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <h2 className="font-bold">حل‌کننده مرحله‌ای</h2>
        <div className="mt-4 space-y-2">
          {steps.map((s, i) => (
            <div key={s.t} className={`rounded-2xl border p-3 ${i <= step ? "border-indigo-400/40 bg-indigo-500/10" : "border-[var(--line)] opacity-40"}`}>
              <div className="text-xs text-[var(--text-mute)]">مرحله {toFa(i + 1)}</div>
              <div className="font-bold">{s.t}</div>
              {i <= step && <div className="mt-1 ltr text-right">{s.body}</div>}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Btn variant="soft" onClick={() => setStep((x) => Math.max(0, x - 1))}>
            قبلی
          </Btn>
          <Btn onClick={() => setStep((x) => Math.min(steps.length - 1, x + 1))}>بعدی</Btn>
        </div>
      </Card>
      <Card className="h-[420px] p-2">
        <CoordinatePlane
          readOnly
          points={[A(1, 3), B(3, 7)]}
          showTriangle
          lines={[{ id: "l", a: "A", b: "B", color: "#818cf8" }]}
        />
      </Card>
    </div>
  );
}

export function TwoLinesLab() {
  const [m1, setM1] = useState(1);
  const [b1, setB1] = useState(1);
  const [m2, setM2] = useState(-0.5);
  const [b2, setB2] = useState(2);
  const rel = relation(m1, m2, b1, b2);
  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
      <Card className="h-[420px] p-2 md:h-[500px]">
        <CoordinatePlane
          readOnly
          showCoords={false}
          points={[
            { id: "p1", x: 0, y: b1, label: "L1", color: "#818cf8" },
            { id: "p2", x: 0, y: b2, label: "L2", color: "#22d3ee" },
          ]}
          lines={[
            { id: "l1", a: "p1", m: m1, intercept: b1, color: "#818cf8" },
            { id: "l2", a: "p2", m: m2, intercept: b2, color: "#22d3ee" },
          ]}
        />
      </Card>
      <div className="space-y-3">
        <Card>
          <h3 className="font-bold">دو خط همزمان</h3>
          <Tag tone={rel === "موازی" ? "warn" : rel.includes("عمود") ? "ok" : "accent"}>{rel}</Tag>
          <label className="mt-4 block text-sm">
            m₁ = {formatNum(m1)}
            <input className="mt-1 w-full" type="range" min={-4} max={4} step={0.1} value={m1} onChange={(e) => setM1(+e.target.value)} />
          </label>
          <label className="mt-2 block text-sm">
            b₁ = {formatNum(b1)}
            <input className="mt-1 w-full" type="range" min={-5} max={5} step={0.1} value={b1} onChange={(e) => setB1(+e.target.value)} />
          </label>
          <label className="mt-2 block text-sm">
            m₂ = {formatNum(m2)}
            <input className="mt-1 w-full" type="range" min={-4} max={4} step={0.1} value={m2} onChange={(e) => setM2(+e.target.value)} />
          </label>
          <label className="mt-2 block text-sm">
            b₂ = {formatNum(b2)}
            <input className="mt-1 w-full" type="range" min={-5} max={5} step={0.1} value={b2} onChange={(e) => setB2(+e.target.value)} />
          </label>
        </Card>
        <Insight text="شیب‌ها را برابر کن تا توازی را ببینی. بعد b را عوض کن؛ خط‌ها هرگز به هم نمی‌رسند." />
      </div>
    </div>
  );
}

export function Lab3D() {
  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden p-0">
        <img src={lab3d} alt="" className="h-64 w-full object-cover md:h-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 right-4 left-4">
          <h2 className="text-2xl font-black text-white">آزمایشگاه هندسه تحلیلی</h2>
          <p className="text-sm text-white/80">محورهای سه‌بعدی برای حس فضا؛ آموزش اصلی خط همچنان روی صفحه دوبعدی است.</p>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["محور x", "جهت افقی · ورودی مستقل"],
          ["محور y", "جهت عمودی · مقدار وابسته"],
          ["خط در صفحه xy", "مفهوم پایه نهم همین صفحه است"],
        ].map(([t, d]) => (
          <Card key={t}>
            <div className="font-bold">{t}</div>
            <p className="mt-1 text-sm text-[var(--text-mute)]">{d}</p>
          </Card>
        ))}
      </div>
      <Insight text="سه‌بعدی فقط برای الهام است. شیب و معادله خط را روی صفحه دوبعدی آزمایش کن تا مفهوم قاطی نشود." />
    </div>
  );
}

export function ConvertLab() {
  const [a, setA] = useState(2);
  const [bb, setBb] = useState(-1);
  const [c, setC] = useState(4);
  const m = bb === 0 ? null : -a / bb;
  const bInt = bb === 0 ? null : c / bb;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="font-bold">تبدیل به y = mx + b</h3>
        <p className="mt-2 text-sm">
          معادله اولیه: <span className="formula">{formatNum(a)}x + ({formatNum(bb)})y = {formatNum(c)}</span>
        </p>
        <label className="mt-4 block text-sm">
          a = {formatNum(a)}
          <input className="mt-1 w-full" type="range" min={-5} max={5} step={1} value={a} onChange={(e) => setA(+e.target.value)} />
        </label>
        <label className="mt-2 block text-sm">
          b = {formatNum(bb)}
          <input className="mt-1 w-full" type="range" min={-5} max={5} step={1} value={bb} onChange={(e) => setBb(+e.target.value)} />
        </label>
        <label className="mt-2 block text-sm">
          c = {formatNum(c)}
          <input className="mt-1 w-full" type="range" min={-8} max={8} step={1} value={c} onChange={(e) => setC(+e.target.value)} />
        </label>
        <div className="mt-4 rounded-2xl bg-indigo-500/10 p-3">
          {m === null ? "نمی‌توان y را آزاد کرد (خط عمودی)." : <span className="formula text-xl">{equationFromMB(round(m, 2), round(bInt ?? 0, 2))}</span>}
        </div>
      </Card>
      <Card className="h-[360px] p-2">
        {m !== null && bInt !== null ? (
          <CoordinatePlane
            readOnly
            showCoords={false}
            points={[{ id: "p", x: 0, y: bInt, label: "b", color: "#fbbf24" }]}
            lines={[{ id: "l", a: "p", m, intercept: bInt, color: "#818cf8" }]}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-[var(--text-mute)]">ضریب y صفر است.</div>
        )}
      </Card>
    </div>
  );
}
