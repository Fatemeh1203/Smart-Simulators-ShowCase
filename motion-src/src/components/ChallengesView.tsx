import { useMemo, useState } from "react";
import { Params, computeForces, fmt, G } from "../physics";
import LabView from "./LabView";
import CompareView from "./CompareView";

interface Step {
  label: string;
  params: Params;
  hint: string;
}

interface Challenge {
  id: number;
  title: string;
  question: string;
  concept: string;
  kind: "single" | "compare";
  steps: Step[];
  compare?: { a: Params; b: Params };
  explain: (rec: Record<number, { a: number; net: number; moving: boolean; params: Params }>) => string;
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: "چالش ۱: جرم را دو برابر کن",
    question: "جرم جسم را دو برابر کن، در حالی که نیروی واردشده ثابت است. چه اتفاقی برای شتاب می‌افتد؟",
    concept: "رابطه‌ی جرم و شتاب (نسبت وارون)",
    kind: "single",
    steps: [
      { label: "مرحله ۱: جرم 10 kg، نیرو 100 N، بدون اصطکاک", params: { mass: 10, force: 100, mu: 0, v0: 0 }, hint: "شتاب را ببین و ثبت کن." },
      { label: "مرحله ۲: جرم 20 kg، همان نیرو", params: { mass: 20, force: 100, mu: 0, v0: 0 }, hint: "دوباره اجرا کن و شتاب را با قبل مقایسه کن." },
    ],
    explain: (r) =>
      `با نیروی ثابت ${r[0].params.force} N، وقتی جرم از ${r[0].params.mass} به ${r[1].params.mass} کیلوگرم رسید، شتاب از ${fmt(r[0].a)} به ${fmt(
        r[1].a
      )} m/s² کاهش یافت؛ یعنی دقیقاً نصف شد. چون a = F / m است، با دو برابر شدن جرم، شتاب نصف می‌شود (نسبت وارون). نکته: اگر اصطکاک هم وجود داشت، شتاب حتی کمتر از نصف می‌شد، چون اصطکاک (μmg) هم با جرم زیاد می‌شود.`,
  },
  {
    id: 2,
    title: "چالش ۲: اصطکاک را زیاد کن",
    question: "اصطکاک را کم‌کم افزایش بده. چه زمانی جسم دیگر حرکت نمی‌کند؟",
    concept: "اصطکاک ایستایی و شرط شروع حرکت",
    kind: "single",
    steps: [
      { label: "مرحله ۱: روی یخ (μ = 0.05)", params: { mass: 10, force: 60, mu: 0.05, v0: 0 }, hint: "جسم به‌راحتی شتاب می‌گیرد." },
      { label: "مرحله ۲: روی چوب (μ = 0.3)", params: { mass: 10, force: 60, mu: 0.3, v0: 0 }, hint: "شتاب کمتر شد؟" },
      { label: "مرحله ۳: روی بتن (μ = 0.6)", params: { mass: 10, force: 60, mu: 0.6, v0: 0 }, hint: "به‌سختی حرکت می‌کند!" },
      { label: "مرحله ۴: سطح زبر (μ = 0.9)", params: { mass: 10, force: 60, mu: 0.9, v0: 0 }, hint: "آیا اصلاً حرکت می‌کند؟" },
    ],
    explain: (r) => {
      const p = r[0].params;
      const muCrit = p.force / (p.mass * G);
      return `با نیروی ${p.force} N و جرم ${p.mass} kg، بیشینه‌ی اصطکاک ایستایی برابر μ × ${fmt(p.mass * G, 1)} N است. تا وقتی این مقدار از ${p.force} N کمتر باشد جسم حرکت می‌کند: روی یخ شتاب ${fmt(r[0].a)}، روی چوب ${fmt(r[1].a)} و روی بتن فقط ${fmt(
        r[2].a
      )} m/s². وقتی μ به ${fmt(muCrit)} برسد، اصطکاک با نیرو برابر می‌شود و از آن به بعد (مثل سطح زبر با μ = 0.9 که اصطکاک بیشینه ${fmt(0.9 * p.mass * G, 1)} N است) جسم اصلاً راه نمی‌افتد؛ اصطکاک ایستایی دقیقاً به اندازه‌ی نیروی تو مقاومت می‌کند و نیروی خالص صفر می‌ماند.`;
    },
  },
  {
    id: 3,
    title: "چالش ۳: نیرو را بیشتر کن",
    question: "نیروی واردشده را افزایش بده و رابطه‌ی نیرو و شتاب را مشاهده کن.",
    concept: "رابطه‌ی مستقیم نیروی خالص و شتاب (قانون دوم نیوتن)",
    kind: "single",
    steps: [
      { label: "مرحله ۱: نیروی 50 N", params: { mass: 10, force: 50, mu: 0.2, v0: 0 }, hint: "شتاب اولیه را ثبت کن." },
      { label: "مرحله ۲: نیروی 100 N", params: { mass: 10, force: 100, mu: 0.2, v0: 0 }, hint: "نیرو دو برابر شد؛ شتاب چقدر شد؟" },
      { label: "مرحله ۳: نیروی 200 N", params: { mass: 10, force: 200, mu: 0.2, v0: 0 }, hint: "الگو را پیدا کن." },
    ],
    explain: (r) =>
      `با جرم ثابت ${r[0].params.mass} kg و اصطکاک ثابت ${fmt(Math.abs(r[0].net - r[0].params.force), 1)} N، نیروی خالص به‌ترتیب ${fmt(r[0].net, 1)}، ${fmt(r[1].net, 1)} و ${fmt(
        r[2].net,
        1
      )} N شد و شتاب‌ها ${fmt(r[0].a)}، ${fmt(r[1].a)} و ${fmt(r[2].a)} m/s². نسبت شتاب به نیروی خالص همیشه ${fmt(r[0].a / r[0].net, 3)} (= 1/m) است: شتاب با نیروی خالص نسبت مستقیم دارد. توجه کن که چون اصطکاک ثابت را باید کم کنیم، دو برابر شدن نیروی واردشده باعث بیش از دو برابر شدن شتاب می‌شود!`,
  },
  {
    id: 4,
    title: "چالش ۴: دو جرم، یک نیرو",
    question: "دو جسم با جرم متفاوت را با نیروی یکسان حرکت بده. کدام‌یک شتاب بیشتری دارد؟",
    concept: "مقایسه‌ی هم‌زمان؛ اثر جرم بر شتاب و اصطکاک",
    kind: "compare",
    steps: [],
    compare: { a: { mass: 10, force: 100, mu: 0.2, v0: 0 }, b: { mass: 20, force: 100, mu: 0.2, v0: 0 } },
    explain: () =>
      "جسم سبک‌تر (A) شتاب بیشتری می‌گیرد و زودتر جلو می‌افتد. دو دلیل دارد: اول این‌که در a = Fnet / m جرم در مخرج است؛ دوم این‌که جرم بیشتر یعنی نیروی نرمال و اصطکاک بیشتر (f = μmg)، پس نیروی خالص جسم سنگین‌تر هم کمتر است. در نمودار v–t، شیب خط A تندتر است؛ شیب نمودار سرعت–زمان همان شتاب است.",
  },
];

type Rec = { a: number; net: number; moving: boolean; params: Params };

export default function ChallengesView() {
  const [activeId, setActiveId] = useState(1);
  const ch = CHALLENGES.find((c) => c.id === activeId)!;
  const [params, setParams] = useState<Params>(CHALLENGES[0].steps[0].params);
  const [records, setRecords] = useState<Record<number, Record<number, Rec>>>({});
  const [appliedStep, setAppliedStep] = useState<number | null>(0);

  const rec = records[ch.id] ?? {};
  const allDone = ch.kind === "single" && ch.steps.every((_, i) => rec[i]);
  const compareKey = useMemo(() => ch.compare, [ch]);

  const pick = (id: number) => {
    const c = CHALLENGES.find((x) => x.id === id)!;
    setActiveId(id);
    if (c.kind === "single") {
      setParams(c.steps[0].params);
      setAppliedStep(0);
    }
  };

  const applyStep = (i: number) => {
    setParams(ch.steps[i].params);
    setAppliedStep(i);
  };

  const recordStep = (i: number) => {
    const f = computeForces(params, params.v0);
    setRecords((r) => ({ ...r, [ch.id]: { ...(r[ch.id] ?? {}), [i]: { a: f.a, net: f.net, moving: f.moving, params } } }));
  };

  const sameAsStep = (i: number) => JSON.stringify(ch.steps[i].params) === JSON.stringify(params);

  const card = (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 fade-up" key={ch.id}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{ch.title}</h2>
          <p className="mt-1 text-sm text-slate-700 leading-7">{ch.question}</p>
        </div>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">🎯 {ch.concept}</span>
      </div>

      {ch.kind === "single" && (
        <ol className="grid gap-2 md:grid-cols-2">
          {ch.steps.map((st, i) => {
            const done = !!rec[i];
            const applied = appliedStep === i && sameAsStep(i);
            return (
              <li
                key={i}
                className={`rounded-xl border p-3 text-sm transition ${
                  done ? "border-emerald-300 bg-emerald-50" : applied ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-800">{st.label}</span>
                  {done && <span className="text-emerald-600 text-lg">✓</span>}
                </div>
                <p className="mt-1 text-xs text-slate-500">{st.hint}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => applyStep(i)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                      applied ? "bg-indigo-600 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {applied ? "تنظیمات اعمال شد" : "اعمال تنظیمات"}
                  </button>
                  <button
                    onClick={() => recordStep(i)}
                    disabled={!applied}
                    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-40 hover:bg-emerald-700 transition"
                  >
                    ثبت مشاهده
                  </button>
                  {done && (
                    <span className="num rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-700">
                      a = {fmt(rec[i].a)} m/s² · Fnet = {fmt(rec[i].net, 1)} N {rec[i].moving ? "" : "· ساکن"}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {ch.kind === "single" && (
        <div className={`rounded-xl border p-3 text-sm leading-7 ${allDone ? "border-amber-300 bg-amber-50 text-amber-900 fade-up" : "border-dashed border-slate-300 text-slate-500"}`}>
          {allDone ? (
            <>
              <p className="font-extrabold">🔎 نتیجه‌ی مشاهده به زبان ساده</p>
              <p>{ch.explain(rec)}</p>
              <button
                onClick={() => setRecords((r) => ({ ...r, [ch.id]: {} }))}
                className="mt-2 rounded-lg bg-white px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300"
              >
                تکرار چالش
              </button>
            </>
          ) : (
            <p>
              برای دیدن توضیح نتیجه، همه‌ی مرحله‌ها را اعمال کن، آزمایش را اجرا کن و مشاهده‌ات را ثبت کن. ({Object.keys(rec).length} از {ch.steps.length} مرحله)
            </p>
          )}
        </div>
      )}

      {ch.kind === "compare" && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-7 text-amber-900">
          <p className="font-extrabold">🔎 توضیح</p>
          <p>{ch.explain({})}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CHALLENGES.map((c) => {
          const done = c.kind === "single" && c.steps.every((_, i) => records[c.id]?.[i]);
          return (
            <button
              key={c.id}
              onClick={() => pick(c.id)}
              className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${
                c.id === activeId ? "border-violet-500 bg-violet-600 text-white shadow" : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"
              }`}
            >
              {done ? "✅ " : ""}
              {c.title}
            </button>
          );
        })}
      </div>

      {ch.kind === "single" ? (
        <LabView params={params} onParamsChange={setParams} header={card} />
      ) : (
        <CompareView key="ch4" initialA={compareKey!.a} initialB={compareKey!.b} header={card} />
      )}
    </div>
  );
}
