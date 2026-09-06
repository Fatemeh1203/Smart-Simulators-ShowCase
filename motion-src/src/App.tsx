import { useState } from "react";
import { Params } from "./physics";
import LabView from "./components/LabView";
import CompareView from "./components/CompareView";
import ChallengesView from "./components/ChallengesView";
import PredictView from "./components/PredictView";

type Tab = "lab" | "compare" | "challenge" | "predict" | "learn";


const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "lab", label: "آزمایشگاه", icon: "🧪" },
  { key: "compare", label: "مقایسه", icon: "⚖️" },
  { key: "challenge", label: "آزمایش کن", icon: "🎯" },
  { key: "predict", label: "پیش‌بینی کن", icon: "🤔" },
  { key: "learn", label: "مفاهیم", icon: "📘" },
];

const CONCEPTS = [
  { t: "قانون دوم نیوتن", f: "Fnet = m × a", d: "شتاب یک جسم با نیروی خالص واردشده نسبت مستقیم و با جرم آن نسبت وارون دارد. در آزمایشگاه، نیرو را زیاد کن تا فلش زرد (نیروی خالص) بلندتر شود و شتاب بالا برود.", c: "bg-yellow-50 border-yellow-200" },
  { t: "نیروی خالص", f: "Fnet = F − f", d: "جمع برداری همه‌ی نیروها. وزن و نیروی نرمال یکدیگر را خنثی می‌کنند؛ پس در راستای افقی فقط نیروی واردشده و اصطکاک می‌مانند.", c: "bg-amber-50 border-amber-200" },
  { t: "نیروی نرمال", f: "N = m × g", d: "سطح، جسم را به سمت بالا هل می‌دهد تا در زمین فرو نرود. روی سطح افقی این نیرو دقیقاً برابر وزن است (فلش‌های آبی هم‌اندازه‌اند).", c: "bg-sky-50 border-sky-200" },
  { t: "اصطکاک", f: "f = μ × N", d: "اصطکاک همیشه مخالف حرکت (یا تمایل به حرکت) است. تا وقتی جسم ساکن است، اصطکاک ایستایی دقیقاً به اندازه‌ی نیروی تو مقاومت می‌کند؛ اما بیشینه‌ای دارد: μN.", c: "bg-red-50 border-red-200" },
  { t: "سکون یا حرکت؟", f: "F ≤ μN → ساکن", d: "اگر نیروی واردشده از بیشینه‌ی اصطکاک ایستایی بیشتر نباشد، جسم راه نمی‌افتد. به محض این‌که F از μN بگذرد، جسم شتاب می‌گیرد.", c: "bg-slate-50 border-slate-200" },
  { t: "سرعت و جابه‌جایی", f: "v = v₀ + a·t ، x = v₀·t + ½·a·t²", d: "با شتاب ثابت، سرعت به‌صورت خطی زیاد می‌شود (نمودار v–t خط راست است و شیب آن برابر شتاب است) و جابه‌جایی به‌صورت سهمی رشد می‌کند.", c: "bg-cyan-50 border-cyan-200" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("lab");
  const [labParams, setLabParams] = useState<Params>({ mass: 10, force: 100, mu: 0.3, v0: 0 });

  return (
    <div className="min-h-screen pb-10">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl shadow-lg shadow-indigo-200">
              🧲
            </div>
            <div>
              <h1 className="text-lg font-extrabold leading-tight text-slate-900 sm:text-xl">آزمایشگاه مجازی نیرو و حرکت</h1>
              <p className="text-xs text-slate-500">قانون دوم نیوتن، اصطکاک و شتاب را با آزمایش کشف کن</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
                  tab === t.key ? "bg-white text-indigo-700 shadow" : "text-slate-600 hover:bg-white/60"
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-4">
        {tab === "lab" && <LabView params={labParams} onParamsChange={setLabParams} />}

        {tab === "compare" && (
          <CompareView
            initialA={{ mass: 10, force: 100, mu: 0.3, v0: 0 }}
            initialB={{ mass: 20, force: 100, mu: 0.3, v0: 0 }}
            header={
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-l from-orange-50 to-indigo-50 p-4 text-sm leading-7 text-slate-700">
                <p className="font-extrabold text-slate-900">⚖️ حالت مقایسه</p>
                پارامترهای دو جسم A و B را جداگانه تنظیم کن و «شروع آزمایش» را بزن تا هر دو هم‌زمان حرکت کنند. سرعت، شتاب و جابه‌جایی آن‌ها را در جدول و نمودارها مقایسه کن.
              </div>
            }
          />
        )}

        {tab === "challenge" && <ChallengesView />}
        {tab === "predict" && <PredictView />}

        {tab === "learn" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-7 text-slate-700">
              <p className="font-extrabold text-slate-900">📘 مفاهیم کلیدی</p>
              همه‌ی محاسبات این آزمایشگاه از یک مدل فیزیکی واحد به دست می‌آید: نیروها → نیروی خالص → شتاب → سرعت → جابه‌جایی. با g = 9.81 m/s².
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {CONCEPTS.map((c) => (
                <div key={c.t} className={`rounded-2xl border p-4 ${c.c}`}>
                  <h3 className="font-extrabold text-slate-900">{c.t}</h3>
                  <p className="num mt-1 inline-block rounded-lg bg-white/80 px-2 py-0.5 text-sm font-bold text-indigo-700" dir="ltr">
                    {c.f}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{c.d}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
              <p className="font-extrabold text-slate-900">راهنمای رنگ فلش‌ها</p>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                <li><i className="inline-block h-2.5 w-6 rounded bg-green-600 align-middle ml-2" />سبز: نیروی واردشده (F)</li>
                <li><i className="inline-block h-2.5 w-6 rounded bg-red-600 align-middle ml-2" />قرمز: نیروی اصطکاک (f)</li>
                <li><i className="inline-block h-2.5 w-6 rounded bg-blue-600 align-middle ml-2" />آبی رو به پایین: وزن (W)</li>
                <li><i className="inline-block h-2.5 w-6 rounded bg-sky-500 align-middle ml-2" />آبی رو به بالا: نیروی نرمال (N)</li>
                <li><i className="inline-block h-2.5 w-6 rounded bg-yellow-500 align-middle ml-2" />زرد: نیروی خالص (Fnet)</li>
              </ul>
              <p className="mt-2 text-xs text-slate-500">طول هر فلش متناسب با اندازه‌ی نیروست.</p>
            </div>
          </div>
        )}
      </main>

      <footer className="mx-auto mt-8 max-w-7xl px-4 text-center text-xs text-slate-400">
        شبیه‌سازی بر پایه‌ی قوانین نیوتن · g = 9.81 m/s² · واحدها: N، kg، m/s، m/s²، m، s
      </footer>
    </div>
  );
}
