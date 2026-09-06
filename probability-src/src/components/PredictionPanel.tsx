import { useEffect, useMemo, useState } from "react";
import { fmtInt, fmtPct, toFa, TRIAL_OPTIONS } from "../lib/probability";
import type { SimStatus } from "../hooks/useSimulation";

interface Props {
  focusLabel: string;
  theoretical: number;
  outcomes: number[];
  focusSet: number[];
  status: SimStatus;
  onRun: (n: number) => void;
  experimentWord: string; // "پرتاب سکه" ...
}

interface ActivePrediction {
  startTotal: number;
  n: number;
  guess: number;
  focusLabel: string;
}

export default function PredictionPanel({ focusLabel, theoretical, outcomes, focusSet, status, onRun, experimentWord }: Props) {
  const [n, setN] = useState<number>(10);
  const [guess, setGuess] = useState<string>("");
  const [active, setActive] = useState<ActivePrediction | null>(null);

  // Reset if results were cleared
  useEffect(() => {
    if (active && outcomes.length < active.startTotal) setActive(null);
  }, [outcomes.length, active]);

  const result = useMemo(() => {
    if (!active) return null;
    const end = active.startTotal + active.n;
    if (outcomes.length < end) return null;
    const set = new Set(focusSet);
    let hits = 0;
    for (let i = active.startTotal; i < end; i++) if (set.has(outcomes[i])) hits++;
    return { hits, done: status !== "running" };
  }, [active, outcomes, focusSet, status]);

  const expected = n * theoretical;
  const guessNum = guess === "" ? NaN : Number(guess);
  const valid = Number.isInteger(guessNum) && guessNum >= 0 && guessNum <= n;

  const run = () => {
    if (!valid || status === "running") return;
    setActive({ startTotal: outcomes.length, n, guess: guessNum, focusLabel });
    onRun(n);
  };

  return (
    <div className="rounded-3xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-white p-5 shadow-sm">
      <h3 className="mb-1 text-lg font-black text-fuchsia-800">🤔 قبل از آزمایش پیش‌بینی کن</h3>
      <p className="mb-4 text-sm leading-7 text-slate-600">
        اگر {experimentWord} را <b className="num">{fmtInt(n)}</b> بار انجام دهیم، فکر می‌کنی چند بار «{focusLabel}» می‌آید؟
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {TRIAL_OPTIONS.filter((v) => v <= 1000).map((v) => (
          <button
            key={v}
            onClick={() => {
              setN(v);
              setGuess("");
            }}
            disabled={status === "running"}
            className={`num rounded-lg px-3 py-1 text-sm font-bold transition ${n === v ? "bg-fuchsia-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-fuchsia-50"}`}
          >
            {fmtInt(v)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={n}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder={`عددی بین ۰ تا ${toFa(n)}`}
          className="num w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-lg font-bold text-slate-800 outline-none focus:border-fuchsia-400"
          disabled={status === "running"}
        />
        <button
          onClick={run}
          disabled={!valid || status === "running"}
          className="whitespace-nowrap rounded-xl bg-fuchsia-600 px-4 py-2 font-bold text-white shadow hover:bg-fuchsia-700 disabled:opacity-40"
        >
          🎯 اجرای آزمایش
        </button>
      </div>
      {!valid && guess !== "" && <div className="mt-1 text-xs text-rose-600">عدد باید بین ۰ و {toFa(n)} باشد.</div>}

      {active && (
        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-fuchsia-100">
          {!result ? (
            <div className="text-sm text-slate-500">در حال اجرای {fmtInt(active.n)} آزمایش…</div>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-fuchsia-50 p-2">
                <div className="text-xs text-slate-500">پیش‌بینی تو</div>
                <div className="num text-2xl font-black text-fuchsia-700">{toFa(active.guess)}</div>
              </div>
              <div className="rounded-xl bg-indigo-50 p-2">
                <div className="text-xs text-slate-500">نتیجه‌ی واقعی</div>
                <div className="num text-2xl font-black text-indigo-700">{toFa(result.hits)}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <div className="text-xs text-slate-500">انتظار نظری</div>
                <div className="num text-2xl font-black text-slate-700">{toFa(Number((active.n * theoretical).toFixed(1)))}</div>
              </div>
              <div className="col-span-3 mt-1 text-sm leading-6 text-slate-600">
                {result.hits === active.guess ? (
                  <span className="font-bold text-emerald-600">🎉 آفرین! پیش‌بینی تو دقیقاً درست بود.</span>
                ) : (
                  <span>
                    اختلاف پیش‌بینی با واقعیت: <b className="num">{toFa(Math.abs(result.hits - active.guess))}</b> بار. احتمال تجربی این دور:{" "}
                    <b className="num text-indigo-700">{fmtPct(result.hits / active.n)}</b> (نظری {fmtPct(theoretical)}). در تعداد کم آزمایش، انحراف از مقدار نظری کاملاً طبیعی است.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="mt-3 text-xs text-slate-400">
        مقدار انتظاری (Expected Value) = n × p = {fmtInt(n)} × {fmtPct(theoretical)} ≈ <span className="num">{toFa(expected.toFixed(1))}</span>
      </div>
    </div>
  );
}
