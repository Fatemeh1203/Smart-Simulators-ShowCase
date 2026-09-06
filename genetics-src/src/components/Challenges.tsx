import { useEffect, useMemo, useState } from "react";
import type { Trait } from "../genetics/data";
import { allGenotypeKeys, type CrossAnalysis } from "../genetics/engine";
import type { Stats } from "./Results";

interface Props {
  analysis: CrossAnalysis;
  traits: Trait[];
  stats: Stats;
  crossLabel: string;
  onSetChallengeCross: () => void;
  onClose: () => void;
}

const CHALLENGES = [
  { id: 1, title: "چالش ۱", text: "والدینی انتخاب کن که احتمال فرزند با صفت مغلوب (برای صفت اول) دقیقاً ۲۵٪ باشد.", hint: "به هتروزیگوت‌ها فکر کن…" },
  { id: 2, title: "چالش ۲", text: "والدینی پیدا کن که ۱۰۰٪ فرزندانشان یک فنوتیپ مشخص داشته باشند.", hint: "چند ترکیب مختلف این کار را می‌کنند؛ حداقل یکی را پیدا کن." },
  { id: 3, title: "چالش ۳", text: "با تولید حداقل ۱۰۰ فرزند، اختلاف نتیجه‌ی تجربی و نظری را برای همه‌ی ژنوتیپ‌ها به کمتر از ۵ واحد درصد برسان.", hint: "والدینی انتخاب کن که چند ژنوتیپ مختلف تولید کنند؛ افزایش تعداد فرزندان کمک می‌کند." },
  { id: 4, title: "چالش ۴", text: "برای این دو والد، تمام ژنوتیپ‌های ممکن فرزندان را علامت بزن (نه کمتر، نه بیشتر).", hint: "گامت‌های هر والد را بنویس و ترکیب کن." },
];

function Confetti() {
  const colors = ["#f43f5e", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          className="confetti rounded-sm"
          style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length], animationDelay: `${(i % 7) * 0.12}s` }}
        />
      ))}
    </div>
  );
}

export default function Challenges({ analysis, traits, stats, crossLabel, onSetChallengeCross, onClose }: Props) {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [celebrate, setCelebrate] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [c4Result, setC4Result] = useState<null | "ok" | "bad">(null);

  const ch = CHALLENGES[active];

  // Evaluations (real checks against the actual analysis / stats)
  const recessiveFirst = useMemo(() => Object.entries(analysis.phenotypeProb).filter(([k]) => k[0] === "r").reduce((s, [, v]) => s + v, 0), [analysis]);
  const c1 = Math.abs(recessiveFirst - 0.25) < 1e-9;
  const c2 = Object.values(analysis.phenotypeProb).some((v) => Math.abs(v - 1) < 1e-9);
  const c3Diffs = analysis.genotypeOrder.map((k) => Math.abs(((stats.geno[k] || 0) / Math.max(stats.total, 1)) * 100 - analysis.genotypeProb[k] * 100));
  const c3 = stats.total >= 100 && analysis.genotypeOrder.length >= 2 && c3Diffs.every((d) => d < 5);

  const statusOf = (id: number) => (id === 1 ? c1 : id === 2 ? c2 : id === 3 ? c3 : c4Result === "ok");

  useEffect(() => {
    const ok = statusOf(ch.id);
    if (ok && !done[ch.id]) {
      setDone((d) => ({ ...d, [ch.id]: true }));
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 2200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c1, c2, c3, c4Result, ch.id]);

  const startC4 = () => {
    onSetChallengeCross();
    setPicked(new Set());
    setC4Result(null);
  };

  const allKeys = allGenotypeKeys(traits);
  const submitC4 = () => {
    const correct = new Set(analysis.genotypeOrder);
    const ok = picked.size === correct.size && [...picked].every((k) => correct.has(k));
    setC4Result(ok ? "ok" : "bad");
  };

  return (
    <div className="card p-4 border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white relative overflow-hidden fade-up">
      {celebrate && <Confetti />}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-black flex items-center gap-2">
          <span className="text-2xl">🎯</span> حالت چالش (Challenge Mode)
        </h3>
        <div className="flex items-center gap-2">
          <span className="chip bg-white border border-emerald-200 text-emerald-800">
            انجام‌شده: <span className="num font-black">{Object.keys(done).length}/4</span>
          </span>
          <button className="text-slate-400 hover:text-slate-700 text-xl leading-none" onClick={onClose} title="بستن">
            ×
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {CHALLENGES.map((c, i) => (
          <button
            key={c.id}
            onClick={() => {
              setActive(i);
              if (c.id === 4) startC4();
            }}
            className={`btn text-xs py-1.5 ${i === active ? "btn-emerald" : "btn-secondary"}`}
          >
            {done[c.id] ? "🏆" : "🎯"} {c.title}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-3">
        <div className="font-black mb-1">{ch.title}</div>
        <div className="text-sm text-slate-700">«{ch.text}»</div>
        <div className="text-xs text-slate-400 mt-1">💡 راهنما: {ch.hint}</div>

        <div className="mt-3 text-sm">
          <div className="text-slate-500 mb-1">
            تلاقی فعلی: <span className="num font-black text-indigo-700">{crossLabel}</span>
          </div>
          {ch.id === 1 && (
            <div>
              احتمال مغلوب برای صفت اول در حال حاضر: <span className="num font-black">{(recessiveFirst * 100).toFixed(1)}٪</span> {c1 ? "✅" : "— ژنوتیپ والدین را تغییر بده"}
            </div>
          )}
          {ch.id === 2 && (
            <div>
              بیشترین احتمال یک فنوتیپ: <span className="num font-black">{(Math.max(...Object.values(analysis.phenotypeProb)) * 100).toFixed(1)}٪</span> {c2 ? "✅" : "— هنوز به ۱۰۰٪ نرسیده"}
            </div>
          )}
          {ch.id === 3 && (
            <div className="space-y-1">
              <div>
                تعداد فرزندان: <span className="num font-black">{stats.total}</span> {stats.total >= 100 ? "✅" : "(حداقل ۱۰۰)"}
              </div>
              <div>
                بیشترین اختلاف: <span className="num font-black">{stats.total ? Math.max(...c3Diffs).toFixed(2) : "—"}</span> واحد درصد {c3 ? "✅" : "(باید < 5 باشد)"}
              </div>
              {analysis.genotypeOrder.length < 2 && <div className="text-rose-600 text-xs">این تلاقی فقط یک ژنوتیپ می‌سازد؛ والدین متنوع‌تری انتخاب کن.</div>}
            </div>
          )}
          {ch.id === 4 && (
            <div>
              <div className="flex flex-wrap gap-2 mt-1 ltr justify-end">
                {allKeys.map((k) => (
                  <label key={k} className={`num cursor-pointer rounded-lg border-2 px-3 py-1.5 font-black select-none ${picked.has(k) ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={picked.has(k)}
                      onChange={() => {
                        const n = new Set(picked);
                        if (n.has(k)) n.delete(k);
                        else n.add(k);
                        setPicked(n);
                        setC4Result(null);
                      }}
                    />
                    {k}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button className="btn btn-primary text-sm" onClick={submitC4} disabled={picked.size === 0}>
                  ✔️ بررسی پاسخ
                </button>
                <button className="btn btn-secondary text-sm" onClick={startC4}>
                  🎲 والدین جدید
                </button>
              </div>
              {c4Result === "bad" && <div className="text-rose-600 text-xs mt-2">درست نیست. به گامت‌های هر والد در پنل والدین نگاه کن و دوباره تلاش کن.</div>}
            </div>
          )}
        </div>
      </div>

      {done[ch.id] && (
        <div className="mt-3 rounded-xl bg-gradient-to-l from-amber-100 to-emerald-100 border border-amber-300 p-3 text-center font-black text-amber-900 pop-in">
          🏆 چالش با موفقیت انجام شد!
        </div>
      )}
    </div>
  );
}
