import { useState } from "react";
import Phase1 from "./components/phases/Phase1";
import Phase2 from "./components/phases/Phase2";
import Phase3 from "./components/phases/Phase3";

type Tab = "overview" | "p1" | "p2" | "p3";

const TABS: { id: Tab; label: string; sub: string; tone: string }[] = [
  { id: "overview", label: "نمای کلی", sub: "Overview", tone: "from-slate-500 to-slate-700" },
  { id: "p1", label: "فاز ۱", sub: "فارادی + میکروخمش", tone: "from-cyan-500 to-blue-600" },
  { id: "p2", label: "فاز ۲", sub: "ساختار SMS", tone: "from-violet-500 to-indigo-600" },
  { id: "p3", label: "فاز ۳", sub: "SMS + نانوذره", tone: "from-rose-500 to-pink-600" },
];

function Phase({ children }: { children: React.ReactNode }) {
  return <div className="fade-up">{children}</div>;
}

function Overview() {
  const flow = [
    { t: "مفاهیم پایه", d: "اثر فارادی، تداخل چندمدی، خودتصویری، مغناضیس", icon: "💡" },
    { t: "روابط", d: "θ=V·B·L، B=24·I mT، P=½μ₀M²، Δn=Cpe·σ", icon: "📐" },
    { t: "شبیه‌سازی", d: "محاسبه عددی توزیع میدان، کوپلینگ و طیف", icon: "🧮" },
    { t: "نمودارها", d: "دوبعدی و سه‌بعدی، با/بدون میدان", icon: "📊" },
    { t: "تحلیل", d: "تغییرات کمّی و نتیجه فیزیکی", icon: "🔬" },
    { t: "چالش‌ها و راه‌حل", d: "نقاط ضعف و فاز اصلاحی", icon: "🛠️" },
  ];
  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6 fade-up">
        <h2 className="text-xl font-extrabold text-slate-100">شبیه‌ساز تعاملی حسگر جریان فیبر نوری</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
          این نرم‌افزار، کل پروژه دکتری شما را در سه فاز مستقل شبیه‌سازی می‌کند. هر فاز شامل
          ستاپ آزمایشگاهی، روابط فیزیکی مستند، نمودارهای دوبعدی/سه‌بعدی با حالت‌های «با میدان» و
          «بدون میدان»، تحلیل کمّی، و فاز پیشنهادی اصلاحی است.
        </p>
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[13px] leading-6 text-amber-200">
          ⚠️ <b>قانون مطلق پروژه:</b> فاز ۳ فقط بر فازهای قبلی «اضافه» می‌شود. هیچ تغییری در منطق
          فیزیکی فاز ۱ و فاز ۲ ایجاد نشده است — این سه ماژول کاملاً مستقل‌اند و در تب‌های مجزا اجرا می‌شوند.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl border-cyan-500/30 p-5">
          <div className="mb-1 text-xs font-bold text-cyan-300">فاز ۱ — پروپوزال اولیه</div>
          <h3 className="text-base font-bold text-slate-100">اثر فارادی + میکروخمش در فیبر دو‌مدی</h3>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            فیبر دو‌مدی (a≈۳.۸۵µm، λ=830nm)، گام Λ≈۰.۴mm. کوپلینگ LP₀₁↔LP₁₁، چرخش قطبش θ=V·B·L،
            طیف و حساسیت.
          </p>
        </div>
        <div className="glass rounded-2xl border-violet-500/30 p-5">
          <div className="mb-1 text-xs font-bold text-violet-300">فاز ۲ — آزمایشگاه</div>
          <h3 className="text-base font-bold text-slate-100">ساختار SMS و تداخل چندمدی</h3>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            SMF–MMF(62.5/125)–SMF، خودتصویری، میدان هلمهولتز B≈24·I mT (R=6cm، N=1600).
          </p>
        </div>
        <div className="glass rounded-2xl border-rose-500/30 p-5">
          <div className="mb-1 text-xs font-bold text-rose-300">فاز ۳ — پیشرفته</div>
          <h3 className="text-base font-bold text-slate-100">SMS + میکروخمش + نانوذره مغناطیسی</h3>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            Ferrofluid تزریق‌شده، فشار مغناطیسی، اثر فوتوالاستیک، تقویت حساسیت چند هزار برابر.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-100">جریان کاری علمی هر فاز</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {flow.map((f, i) => (
            <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-3 text-center">
              <div className="text-2xl">{f.icon}</div>
              <div className="mt-1 text-xs font-bold text-slate-200">{i + 1}. {f.t}</div>
              <div className="mt-1 text-[10px] leading-4 text-slate-400">{f.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-2 text-sm font-bold text-slate-100">🔑 روابط کلیدی و مقادیر مرجع</h3>
        <div className="grid grid-cols-1 gap-2 text-xs text-slate-300 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-900/50 p-2">ثابت وردت سیلیکا @830nm: <b className="text-cyan-300">V ≈ 2.05 rad/(T·m)</b> (اسمیت ۱۹۷۸)</div>
          <div className="rounded-lg bg-slate-900/50 p-2">میدان هلمهولتز: <b className="text-amber-300">B = 0.7155·μ₀NI/R ≈ 24·I mT</b></div>
          <div className="rounded-lg bg-slate-900/50 p-2">چرخش فارادی: <b className="text-rose-300">θ = V·B·L</b></div>
          <div className="rounded-lg bg-slate-900/50 p-2">فشار مغناطیسی: <b className="text-rose-300">P = ½·μ₀·M²</b> (نیروی Kelvin)</div>
          <div className="rounded-lg bg-slate-900/50 p-2">انتقال توان کوپلینگ: <b className="text-cyan-300">P₁₁ = (κ²/s²)·sin²(sz)</b></div>
          <div className="rounded-lg bg-slate-900/50 p-2">اثر فوتوالاستیک: <b className="text-violet-300">Δn = C_pe·σ</b></div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("overview");
  return (
    <div dir="rtl" className="grid-faint min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg shadow-lg shadow-cyan-900/40">
              🧲
            </div>
            <div>
              <h1 className="text-sm font-extrabold leading-tight text-slate-100 sm:text-base">
                شبیه‌ساز حسگر جریان فیبر نوری
              </h1>
              <p className="text-[10px] text-slate-400">Fiber-Optic Current Sensor — Interactive Simulator</p>
            </div>
          </div>
          <nav className="flex flex-1 flex-wrap justify-end gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-xl border px-3 py-1.5 text-right transition ${
                  tab === t.id
                    ? `border-transparent bg-gradient-to-br ${t.tone} text-white shadow-lg`
                    : "border-slate-700/60 bg-slate-900/50 text-slate-300 hover:border-slate-500"
                }`}
              >
                <div className="text-xs font-bold leading-tight">{t.label}</div>
                <div className="text-[9px] opacity-80">{t.sub}</div>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-5">
        {tab === "overview" && (
          <Phase>
            <Overview />
          </Phase>
        )}
        {tab === "p1" && (
          <Phase>
            <Phase1 />
          </Phase>
        )}
        {tab === "p2" && (
          <Phase>
            <Phase2 />
          </Phase>
        )}
        {tab === "p3" && (
          <Phase>
            <Phase3 />
          </Phase>
        )}
      </main>

      <footer className="mx-auto max-w-[1400px] px-4 pb-8 pt-2 text-center text-[11px] text-slate-500">
        تمام نمودارها از محاسبات عددی واقعی تولید شده‌اند (Plotly.js). روابط بر اساس منابع IEEE،
        OSA/Optica و Sensors & Actuators. ثابت وردت سیلیکا @830nm ≈ 2.05 rad/(T·m).
      </footer>
    </div>
  );
}
