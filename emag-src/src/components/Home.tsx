import { LEVELS } from "../data/constants";
import { LABS, getLab } from "../data/labsMeta";
import { ConceptMap } from "./ConceptMap";
import { Card, Pill } from "./ui";

const UNITS = [
  { sym: "E", name: "میدان الکتریکی", unit: "N/C یا V/m" },
  { sym: "B", name: "میدان مغناطیسی", unit: "Tesla (T)" },
  { sym: "V", name: "پتانسیل/ولتاژ", unit: "Volt (V)" },
  { sym: "Q", name: "بار الکتریکی", unit: "Coulomb (C)" },
  { sym: "I", name: "جریان الکتریکی", unit: "Ampere (A)" },
  { sym: "R", name: "مقاومت", unit: "Ohm (Ω)" },
  { sym: "C", name: "ظرفیت خازن", unit: "Farad (F)" },
  { sym: "Φ", name: "شار مغناطیسی/الکتریکی", unit: "Weber (Wb) / N·m²/C" },
  { sym: "λ", name: "طول موج", unit: "meter (m)" },
  { sym: "f", name: "فرکانس", unit: "Hertz (Hz)" },
];

export function Home({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-8 text-center shadow-xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-300">آزمایشگاه مجازی تعاملی</p>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">⚡ آزمایشگاه الکترومغناطیس</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          اینجا فرمول‌ها را حفظ نمی‌کنی؛ آن‌ها را کشف می‌کنی. اول <b className="text-sky-300">پدیده</b> را می‌بینی، بعد آن را{" "}
          <b className="text-emerald-300">اندازه می‌گیری</b>، سپس <b className="text-amber-300">نمودار</b> می‌کشی، و در نهایت
          به <b className="text-fuchsia-300">رابطهٔ ریاضی</b> می‌رسی.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button onClick={() => onNavigate("free")} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow hover:brightness-110">
            🧪 شروع با آزمایش آزاد
          </button>
          <button onClick={() => onNavigate("challenges")} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-slate-700">
            🏆 حالت چالش
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-extrabold text-white">🪜 مسیر پیشنهادی یادگیری</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((lvl) => (
            <Card key={lvl.id} className="flex flex-col gap-2">
              <Pill color="indigo">سطح {lvl.id}</Pill>
              <h3 className="text-sm font-extrabold text-white">{lvl.title}</h3>
              <p className="text-[11px] text-slate-400 tabular" dir="ltr">
                {lvl.subtitle}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {lvl.labs.map((id) => {
                  const lab = getLab(id);
                  if (!lab) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => onNavigate(id)}
                      className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-200 hover:bg-sky-600"
                    >
                      {lab.icon} {lab.title}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-extrabold text-white">🧫 همهٔ آزمایشگاه‌ها</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LABS.map((lab) => (
            <button
              key={lab.id}
              onClick={() => onNavigate(lab.id)}
              className="group flex items-start gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 text-right transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-slate-800/70"
            >
              <span className="text-2xl">{lab.icon}</span>
              <span>
                <span className="block text-sm font-extrabold text-white group-hover:text-sky-300">{lab.title}</span>
                <span className="mt-0.5 block text-xs text-slate-400">{lab.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <ConceptMap onNavigate={onNavigate} />

      <Card title="📐 واحدهای SI مورد استفاده در این آزمایشگاه" icon="📏">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {UNITS.map((u) => (
            <div key={u.sym} className="rounded-lg bg-slate-800/50 p-2 text-center">
              <div className="text-lg font-extrabold text-sky-300">{u.sym}</div>
              <div className="text-[10px] text-slate-400">{u.name}</div>
              <div className="tabular text-[10px] font-bold text-slate-200">{u.unit}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="🎯 هدف نهایی این آزمایشگاه" icon="✅" className="border-emerald-500/30 bg-emerald-950/10">
        <p className="text-sm leading-8 text-slate-300">
          پس از کار با این شبیه‌ساز باید بتوانی با دیدن یک پدیدهٔ فیزیکی خودت تشخیص دهی: چه کمیتی در حال تغییر است، چه میدانی ایجاد شده،
          چه نیرویی وارد می‌شود، چه چیزی قابل اندازه‌گیری است، کدام قانون فیزیکی مربوط است، چرا آن قانون برقرار است، اگر یک پارامتر دوبرابر
          شود چه اتفاقی می‌افتد، و رابطهٔ ریاضی دقیقاً چه چیزی را توصیف می‌کند.
        </p>
      </Card>
    </div>
  );
}
