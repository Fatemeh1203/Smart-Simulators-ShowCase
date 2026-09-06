import { useCallback, useEffect, useMemo, useState } from "react";
import { useSimulation } from "./hooks/useSimulation";
import {
  BALL_COLORS,
  COIN_OUTCOMES,
  DICE_EVENTS,
  TRIAL_OPTIONS,
  convergenceSeries,
  fmtInt,
  fmtPct,
  focusLabelFor,
  focusSetFor,
  fractionFor,
  outcomesFor,
  theoreticalDistribution,
  toFa,
  type ExperimentConfig,
  type ExperimentType,
} from "./lib/probability";
import CoinVisual from "./components/CoinVisual";
import DiceVisual from "./components/DiceVisual";
import BagVisual from "./components/BagVisual";
import ComparisonChart from "./components/ComparisonChart";
import ConvergenceChart from "./components/ConvergenceChart";
import PredictionPanel from "./components/PredictionPanel";
import ChallengePanel from "./components/ChallengePanel";
import TeacherPanel from "./components/TeacherPanel";

const TABS: { id: ExperimentType; icon: string; label: string; en: string }[] = [
  { id: "coin", icon: "🪙", label: "پرتاب سکه", en: "Coin" },
  { id: "dice", icon: "🎲", label: "پرتاب تاس", en: "Dice" },
  { id: "bag", icon: "🎒", label: "انتخاب توپ از کیسه", en: "Bag" },
];

export default function App() {
  const [type, setType] = useState<ExperimentType>("coin");
  const [pHeadsPct, setPHeadsPct] = useState(50);
  const [bag, setBag] = useState<number[]>([5, 3, 2, 0]);
  const [focus, setFocus] = useState({ coin: 0, diceEvent: "n6", ball: 0 });
  const [trials, setTrials] = useState<number>(10);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [teacher, setTeacher] = useState(false);

  const cfg: ExperimentConfig = useMemo(() => ({ type, pHeads: pHeadsPct / 100, bag }), [type, pHeadsPct, bag]);
  const sim = useSimulation(cfg);
  const { total, counts, outcomes, status } = sim;

  // ----- derived data -----
  const defs = useMemo(() => outcomesFor(cfg), [cfg]);
  const dist = useMemo(() => theoreticalDistribution(cfg), [cfg]);
  const focusSet = useMemo(() => focusSetFor(cfg, focus), [cfg, focus]);
  const focusLabel = focusLabelFor(cfg, focus);
  const focusTheo = focusSet.reduce((s, id) => s + (dist.get(id) ?? 0), 0);
  const focusCount = focusSet.reduce((s, id) => s + (counts.get(id) ?? 0), 0);
  const focusExp = total ? focusCount / total : 0;
  const diff = Math.abs(focusExp - focusTheo);
  const fraction = fractionFor(cfg, focusSet);

  const rows = useMemo(
    () =>
      defs.map((d) => {
        const c = counts.get(d.id) ?? 0;
        return { def: d, theo: dist.get(d.id) ?? 0, count: c, exp: total ? c / total : 0, focus: focusSet.includes(d.id) };
      }),
    [defs, counts, dist, total, focusSet],
  );

  const eventRow = useMemo(() => {
    if (type !== "dice" || focusSet.length <= 1) return null;
    return {
      def: { id: 99, label: focusLabel, emoji: "🎯", color: "#4f46e5" },
      theo: focusTheo,
      count: focusCount,
      exp: focusExp,
      focus: true,
    };
  }, [type, focusSet, focusLabel, focusTheo, focusCount, focusExp]);

  const series = useMemo(() => convergenceSeries(outcomes, focusSet), [outcomes, focusSet]);

  const headsExp = total ? (counts.get(0) ?? 0) / total : 0;

  // ----- parameter changes reset results (they change the sample space) -----
  const { reset } = sim;
  const changeType = useCallback(
    (t: ExperimentType) => {
      if (t === type) return;
      setType(t);
      reset();
    },
    [type, reset],
  );
  const changePHeads = (v: number) => {
    setPHeadsPct(v);
    if (total > 0) reset();
  };
  const changeBag = (b: number[]) => {
    setBag(b);
    if (total > 0) reset();
    if (b[focus.ball] === 0) {
      const first = b.findIndex((x) => x > 0);
      if (first >= 0) setFocus((f) => ({ ...f, ball: first }));
    }
  };

  // keyboard shortcut: space = start/pause
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code !== "Space" || (e.target as HTMLElement)?.tagName === "INPUT") return;
      e.preventDefault();
      if (status === "running") sim.pause();
      else if (status === "paused") sim.resume();
      else sim.start(trials, true);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [status, trials, sim]);

  // teacher mode → larger UI for projector
  useEffect(() => {
    document.documentElement.style.fontSize = teacher ? "118%" : "";
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [teacher]);

  const experimentWord = type === "coin" ? "سکه" : type === "dice" ? "تاس" : "انتخاب توپ";
  const running = status === "running";

  return (
    <div className={`min-h-screen pb-16 ${teacher ? "teacher-mode" : ""}`}>
      {/* ---------- Header ---------- */}
      <header className="bg-gradient-to-l from-indigo-700 via-violet-700 to-fuchsia-700 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black md:text-4xl">🎲 آزمایشگاه احتمال</h1>
            <p className="mt-1 text-sm text-indigo-100 md:text-base">آزمایش کن، نتیجه را ببین و احتمال نظری و واقعی را مقایسه کن.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowPrediction((v) => !v)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${showPrediction ? "bg-white text-fuchsia-700" : "bg-white/15 hover:bg-white/25"}`}
            >
              🤔 پیش‌بینی
            </button>
            <button
              onClick={() => setShowChallenge((v) => !v)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${showChallenge ? "bg-white text-amber-700" : "bg-white/15 hover:bg-white/25"}`}
            >
              🎯 چالش (Challenge)
            </button>
            <button
              onClick={() => setTeacher((v) => !v)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${teacher ? "bg-white text-emerald-700" : "bg-white/15 hover:bg-white/25"}`}
            >
              👨‍🏫 حالت معلم
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6">
        {/* ---------- Tabs ---------- */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => changeType(t.id)}
              className={`rounded-2xl border-2 px-2 py-3 text-center transition md:py-4 ${
                type === t.id ? "border-indigo-600 bg-white shadow-md" : "border-transparent bg-white/70 hover:bg-white"
              }`}
            >
              <div className="text-3xl md:text-4xl">{t.icon}</div>
              <div className={`mt-1 text-sm font-black md:text-base ${type === t.id ? "text-indigo-700" : "text-slate-600"}`}>{t.label}</div>
              <div className="text-[11px] text-slate-400">{t.en}</div>
            </button>
          ))}
        </div>

        {teacher && (
          <TeacherPanel
            type={type}
            focusLabel={focusLabel}
            theoretical={focusTheo}
            fraction={fraction}
            total={total}
            focusExp={focusExp}
            status={status}
            onRunTo={(n) => sim.runTo(n, true)}
            onReset={() => sim.reset()}
          />
        )}

        {/* ---------- Lab + Side info ---------- */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Arena */}
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-black text-slate-800">🧪 محیط آزمایش تصادفی (Random Experiment)</h2>
              <span className="num rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500" title="بذر تصادفی (Seed)">
                Seed: {sim.seed.toString(16)}
              </span>
            </div>

            <div className="flex min-h-[290px] items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 p-4">
              {type === "coin" && <CoinVisual outcome={sim.lastOutcome} animTick={sim.animTick} batchTick={sim.batchTick} size={teacher ? 210 : 170} />}
              {type === "dice" && (
                <DiceVisual outcome={sim.lastOutcome} animTick={sim.animTick} batchTick={sim.batchTick} highlight={focusSet} size={teacher ? 180 : 150} />
              )}
              {type === "bag" && (
                <BagVisual bag={bag} onChange={changeBag} outcome={sim.lastOutcome} animTick={sim.animTick} batchTick={sim.batchTick} disabled={running} />
              )}
            </div>

            {/* Per-experiment settings */}
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              {type === "coin" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">⚙️ تنظیم احتمال سکه (سکه‌ی عادلانه / ناعادلانه)</span>
                    <button
                      onClick={() => changePHeads(50)}
                      disabled={running}
                      className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50 disabled:opacity-40"
                    >
                      سکه‌ی عادلانه (۵۰٪)
                    </button>
                  </div>
                  <input type="range" min={0} max={100} step={1} value={pHeadsPct} onChange={(e) => changePHeads(Number(e.target.value))} disabled={running} className="w-full" />
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-amber-600">
                      🦁 شیر: <span className="num">{toFa(pHeadsPct)}٪</span>
                    </span>
                    <span className="text-indigo-600">
                      خط: <span className="num">{toFa(100 - pHeadsPct)}٪</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">رویداد مورد بررسی:</span>
                    {COIN_OUTCOMES.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setFocus((f) => ({ ...f, coin: o.id }))}
                        className={`rounded-lg px-3 py-1 font-bold ${focus.coin === o.id ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
                      >
                        {o.emoji} {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {type === "dice" && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-700">🎯 انتخاب رویداد (Event)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {DICE_EVENTS.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setFocus((f) => ({ ...f, diceEvent: e.id }))}
                        className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${focus.diceEvent === e.id ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-indigo-50"}`}
                      >
                        {e.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-slate-600">
                    نتایج مطلوب: <b className="num">{"{" + focusSet.map(toFa).join("، ") + "}"}</b> از فضای نمونه‌ی <b className="num">{"{۱، ۲، ۳، ۴، ۵، ۶}"}</b> ← احتمال نظری ={" "}
                    <b className="num text-indigo-700">
                      {fraction} = {fmtPct(focusTheo)}
                    </b>
                  </div>
                </div>
              )}

              {type === "bag" && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-bold text-slate-700">رویداد مورد بررسی:</span>
                  {BALL_COLORS.filter((c) => bag[c.id] > 0).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFocus((f) => ({ ...f, ball: c.id }))}
                      className={`rounded-lg px-3 py-1 font-bold ${focus.ball === c.id ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-600">تعداد آزمایش:</span>
                {TRIAL_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setTrials(n)}
                    disabled={running}
                    className={`num rounded-xl px-4 py-2 text-sm font-black transition ${trials === n ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50"} disabled:opacity-50`}
                  >
                    {fmtInt(n)}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {status === "running" ? (
                  <button onClick={sim.pause} className="flex-1 rounded-2xl bg-amber-500 px-6 py-4 text-xl font-black text-white shadow-lg hover:bg-amber-600">
                    ⏸ توقف
                  </button>
                ) : status === "paused" ? (
                  <button onClick={sim.resume} className="flex-1 rounded-2xl bg-emerald-600 px-6 py-4 text-xl font-black text-white shadow-lg hover:bg-emerald-700">
                    ▶ ادامه ({fmtInt((sim.run?.target ?? 0) - (sim.run?.done ?? 0))} باقی‌مانده)
                  </button>
                ) : (
                  <button
                    onClick={() => sim.start(trials, true)}
                    className="flex-1 rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 px-6 py-4 text-xl font-black text-white shadow-lg transition hover:brightness-110 active:scale-[.99]"
                  >
                    🎯 شروع آزمایش ({fmtInt(trials)} بار)
                  </button>
                )}
                <button
                  onClick={() => sim.start(trials, false)}
                  disabled={running}
                  className="rounded-2xl bg-slate-800 px-5 py-4 font-black text-white shadow hover:bg-slate-900 disabled:opacity-40"
                  title="اجرای آنی بدون انیمیشن"
                >
                  ⚡ اجرای سریع
                </button>
                <button
                  onClick={() => sim.start(1000, false)}
                  disabled={running}
                  className="rounded-2xl bg-slate-800 px-5 py-4 font-black text-white shadow hover:bg-slate-900 disabled:opacity-40"
                >
                  ⚡ اجرای ۱۰۰۰ آزمایش
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => sim.reset()} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50">
                  🔄 بازنشانی
                </button>
                <button onClick={sim.newExperiment} disabled={running} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40" title="بذر تصادفی جدید">
                  🧪 آزمایش جدید
                </button>
                <button
                  onClick={sim.repeat}
                  disabled={running || total === 0}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  title="اجرای دوباره با همان بذر تصادفی → همان نتایج"
                >
                  🔁 تکرار آزمایش
                </button>
                {status !== "idle" && (
                  <button onClick={sim.stop} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50">
                    ⏹ پایان اجرا
                  </button>
                )}
                <span className="mr-auto self-center text-xs text-slate-400">کلید Space: شروع/توقف</span>
              </div>

              {sim.run && status !== "idle" && (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>پیشرفت اجرا</span>
                    <span className="num">
                      {fmtInt(sim.run.done)} / {fmtInt(sim.run.target)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-indigo-500 transition-all duration-100" style={{ width: `${sim.progress * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Side cards */}
          <aside className="space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="text-xs font-semibold text-slate-400">تعداد کل آزمایش‌ها</div>
              <div className="num mt-1 text-5xl font-black text-slate-800">{fmtInt(total)}</div>
              <div className="mt-2 text-sm text-slate-500">
                رویداد: <b className="text-slate-700">{focusLabel}</b> — <span className="num">{fmtInt(focusCount)}</span> بار رخ داد
              </div>
            </div>

            <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold text-slate-400">احتمال نظری (Theoretical Probability)</div>
              <div className="num mt-1 text-4xl font-black text-slate-700">{fmtPct(focusTheo)}</div>
              <div className="mt-1 text-sm text-slate-500">
                احتمال «{focusLabel}» {fraction ? <span className="num">= {fraction}</span> : ""} — از ساختار آزمایش محاسبه می‌شود
              </div>
            </div>

            <div className="rounded-3xl border-2 border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
              <div className="text-xs font-semibold text-indigo-400">احتمال تجربی (Experimental Probability)</div>
              <div className="num mt-1 text-4xl font-black text-indigo-700">{total ? fmtPct(focusExp) : "—"}</div>
              <div className="mt-1 text-sm text-slate-500">
                {total ? (
                  <span className="num">
                    {fmtInt(focusCount)} ÷ {fmtInt(total)}
                  </span>
                ) : (
                  "تعداد وقوع ÷ تعداد کل آزمایش‌ها"
                )}
              </div>
            </div>

            <div
              className={`rounded-3xl border-2 p-5 shadow-sm ${
                !total ? "border-slate-200 bg-white" : diff < 0.02 ? "border-emerald-300 bg-emerald-50/60" : diff < 0.05 ? "border-amber-300 bg-amber-50/60" : "border-rose-300 bg-rose-50/60"
              }`}
            >
              <div className="text-xs font-semibold text-slate-400">اختلاف احتمال |تجربی − نظری|</div>
              <div className={`num mt-1 text-4xl font-black ${!total ? "text-slate-400" : diff < 0.02 ? "text-emerald-700" : diff < 0.05 ? "text-amber-700" : "text-rose-700"}`}>
                {total ? fmtPct(diff) : "—"}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {!total ? "پس از آزمایش محاسبه می‌شود" : diff < 0.02 ? "بسیار نزدیک به مقدار نظری ✓" : diff < 0.05 ? "نزدیک؛ با آزمایش بیشتر معمولاً کمتر می‌شود" : "اختلاف زیاد — در تعداد کم آزمایش طبیعی است"}
              </div>
            </div>
          </aside>
        </div>

        {/* ---------- Prediction / Challenge ---------- */}
        {(showPrediction || showChallenge) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {showPrediction && (
              <PredictionPanel
                focusLabel={focusLabel}
                theoretical={focusTheo}
                outcomes={outcomes}
                focusSet={focusSet}
                status={status}
                onRun={(n) => sim.start(n, true)}
                experimentWord={experimentWord}
              />
            )}
            {showChallenge && (
              <ChallengePanel state={{ cfg, total, focusDiceEvent: focus.diceEvent, headsExp, focusExp, focusTheo }} onGoTo={changeType} />
            )}
          </div>
        )}

        {/* ---------- Comparison chart ---------- */}
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-4 text-lg font-black text-slate-800">📊 مقایسه‌ی احتمال نظری و تجربی</h2>
          <ComparisonChart rows={rows} total={total} eventRow={eventRow} />
        </section>

        {/* ---------- Convergence ---------- */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 lg:col-span-2">
            <h2 className="mb-4 text-lg font-black text-slate-800">📈 همگرایی احتمال تجربی</h2>
            <ConvergenceChart series={series} theoretical={focusTheo} label={focusLabel} />
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-700 p-6 text-white shadow-lg">
            <div className="text-sm font-semibold text-sky-100">مفهوم کلیدی</div>
            <h3 className="mt-1 text-2xl font-black">قانون اعداد بزرگ</h3>
            <div className="text-sm text-sky-200">(Law of Large Numbers)</div>
            <p className="mt-4 text-base leading-8">«هرچه تعداد آزمایش‌های مستقل بیشتر شود، احتمال تجربی معمولاً به احتمال نظری نزدیک‌تر می‌شود.»</p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-sky-50">
              <li>🔹 در تعداد کم آزمایش، اختلاف زیاد کاملاً طبیعی است.</li>
              <li>🔹 نوسان تصادفی هرگز کاملاً از بین نمی‌رود، فقط کوچک‌تر می‌شود.</li>
              <li>🔹 احتمال نظری از ساختار آزمایش می‌آید؛ احتمال تجربی از داده‌های واقعی.</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {[10, 100, 1000, 10000].map((n) => (
                <button
                  key={n}
                  onClick={() => sim.runTo(n, true)}
                  disabled={running || total >= n}
                  className="num rounded-lg bg-white/15 px-3 py-1.5 text-sm font-bold hover:bg-white/25 disabled:opacity-40"
                >
                  {total >= n ? "✓ " : "تا "}
                  {fmtInt(n)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Glossary ---------- */}
        <section className="grid gap-3 text-sm md:grid-cols-3">
          {[
            ["آزمایش تصادفی (Random Experiment)", "عملی که نتیجه‌ی آن از قبل قابل پیش‌بینی نیست؛ مانند پرتاب سکه."],
            ["فضای نمونه (Sample Space)", "مجموعه‌ی همه‌ی نتایج ممکن؛ برای تاس: {۱، ۲، ۳، ۴، ۵، ۶}."],
            ["رویداد (Event)", "زیرمجموعه‌ای از فضای نمونه؛ مثلاً «عدد زوج» = {۲، ۴، ۶}."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
              <div className="font-black text-slate-800">{t}</div>
              <div className="mt-1 leading-6 text-slate-500">{d}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
