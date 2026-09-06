import Notebook from "../components/Notebook";
import { fa } from "../lab/format";
import { useStore } from "../lab/store";
import type { Page } from "../App";

const CARDS: { page: Page; emoji: string; title: string; text: string; color: string }[] = [
  { page: "free", emoji: "🔬", title: "خودت آزمایش کن", text: "هر وسیله‌ای می‌خواهی روی میز بگذار", color: "from-emerald-300 to-teal-400" },
  { page: "mirror", emoji: "🪞", title: "آزمایش آینه", text: "زاویه تابش و بازتاب را ببین", color: "from-sky-300 to-blue-400" },
  { page: "lens", emoji: "🔍", title: "آزمایش عدسی", text: "نقطه‌ی تمرکز نور را پیدا کن", color: "from-purple-300 to-fuchsia-400" },
  { page: "water", emoji: "💧", title: "آب و شکست نور", text: "چرا مداد داخل آب شکسته دیده می‌شود؟", color: "from-cyan-300 to-sky-400" },
  { page: "compare", emoji: "⚖️", title: "بازتاب یا شکست؟", text: "دو آزمایش را با هم مقایسه کن", color: "from-orange-300 to-amber-400" },
  { page: "game", emoji: "🎯", title: "نور را به هدف برسان!", text: "بازی با آینه‌ها در ۴ مرحله", color: "from-pink-300 to-rose-400" },
  { page: "missions", emoji: "🏆", title: "ماموریت نور", text: "۵ مأموریت و ۱۵ ستاره", color: "from-yellow-300 to-orange-400" },
  { page: "notebook", emoji: "📖", title: "دفترچه کشف", text: "چیزهایی که کشف کرده‌ای", color: "from-amber-200 to-yellow-300" },
];

export default function Home({ go }: { go: (p: Page) => void }) {
  const { discoveries, score, gameLevel } = useStore();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <section className="relative mt-2 overflow-hidden rounded-[36px] border-8 border-white bg-gradient-to-l from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-xl md:p-10">
        <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-yellow-300/30 blur-2xl" />
        <div className="absolute -bottom-16 right-1/3 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-black">مخصوص دانش‌آموزان دبستان</div>
            <h1 className="text-3xl font-black leading-tight md:text-5xl">🔦 آزمایشگاه نور</h1>
            <p className="mt-3 max-w-xl text-lg font-bold leading-8 text-white/90">
              اینجا خودت دانشمند هستی! چراغ‌قوه را بچرخان، آینه بگذار، نور را وارد آب کن و کشف کن نور چطور حرکت می‌کند.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-black">
              {["حدس بزن", "تغییر بده", "آزمایش کن", "مشاهده کن", "مقایسه کن", "کشف کن"].map((s, i) => (
                <span key={s} className="rounded-full bg-white/20 px-3 py-1">
                  {fa(i + 1)}. {s}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 md:flex-col">
            <div className="rounded-3xl bg-white/20 p-4 text-center backdrop-blur">
              <div className="text-3xl font-black">{fa(score)}</div>
              <div className="text-xs font-bold">🏅 امتیاز</div>
            </div>
            <div className="rounded-3xl bg-white/20 p-4 text-center backdrop-blur">
              <div className="text-3xl font-black">{fa(discoveries.length)}</div>
              <div className="text-xs font-bold">📖 کشف</div>
            </div>
            <div className="rounded-3xl bg-white/20 p-4 text-center backdrop-blur">
              <div className="text-3xl font-black">{fa(gameLevel)}</div>
              <div className="text-xs font-bold">🎯 مرحله</div>
            </div>
          </div>
        </div>
      </section>

      <h2 className="mb-3 mt-8 text-2xl font-black text-slate-800">🧪 کجا برویم؟</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {CARDS.map((c, i) => (
          <button
            key={c.page}
            type="button"
            onClick={() => go(c.page)}
            className={`bounce-in group rounded-[28px] border-4 border-white bg-gradient-to-br ${c.color} p-4 text-right shadow-[0_8px_0_rgba(0,0,0,0.12)] transition hover:-translate-y-1 hover:shadow-[0_12px_0_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-none`}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="text-5xl transition group-hover:scale-110 group-hover:rotate-6">{c.emoji}</div>
            <div className="mt-2 text-lg font-black text-slate-800">{c.title}</div>
            <div className="text-sm font-bold text-slate-700/80">{c.text}</div>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <Notebook />
      </div>
    </div>
  );
}
