import type { Organism, Trait } from "../genetics/data";
import { phenotypeOf, ZYGOSITY_LABEL, zygosity, type Child, type Genotype } from "../genetics/engine";
import Avatar from "./Avatar";
import { AlleleChip } from "./ParentPanel";

interface Props {
  organism: Organism;
  traits: Trait[];
  lastChild: Child | null;
  animKey: number;
  animating: boolean;
  progress: { done: number; total: number } | null;
  total: number;
  mutation: boolean;
  onGenerate: (n: number) => void;
  onStop: () => void;
  onReset: () => void;
  onRandom: () => void;
  onToggleMutation: () => void;
}

const BATCHES = [1, 10, 100, 1000, 10000];

export default function Fertilization(props: Props) {
  const { organism, traits, lastChild, animKey, animating, progress, total, mutation, onGenerate, onStop, onReset, onRandom, onToggleMutation } = props;
  const running = progress !== null;
  const childGenotype: Genotype | null = lastChild ? Object.fromEntries(traits.map((t, i) => [t.id, lastChild.genes[i]])) : null;
  const pheno = lastChild ? phenotypeOf(lastChild.genes, traits) : [];

  return (
    <div className="card p-4 flex flex-col gap-4 fade-up">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black flex items-center gap-2">
          <span className="text-2xl">🧬</span> لقاح و ترکیب ژن‌ها (Fertilization)
        </h3>
        <span className="chip bg-slate-100 text-slate-600">
          فرزندان تولیدشده: <span className="num font-black text-indigo-700">{total.toLocaleString("en-US")}</span>
        </span>
      </div>

      {/* Animation stage */}
      <div className="relative h-56 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden ltr">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gl" x1="0" x2="1">
              <stop offset="0" stopColor="#818cf8" />
              <stop offset="1" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <path d="M 20 110 Q 110 60 200 110" stroke="url(#gl)" strokeWidth="2" fill="none" className="flow-line" opacity="0.7" />
          <path d="M 380 110 Q 290 60 200 110" stroke="url(#gl)" strokeWidth="2" fill="none" className="flow-line" opacity="0.7" />
          {/* DNA helix hint */}
          {Array.from({ length: 12 }).map((_, i) => {
            const x = 40 + i * 30;
            const y1 = 190 + Math.sin(i * 0.9) * 10;
            const y2 = 190 - Math.sin(i * 0.9) * 10;
            return (
              <g key={i} opacity="0.35">
                <line x1={x} y1={y1} x2={x} y2={y2} stroke="#a5b4fc" strokeWidth="1.5" />
                <circle cx={x} cy={y1} r="2.5" fill="#f472b6" />
                <circle cx={x} cy={y2} r="2.5" fill="#34d399" />
              </g>
            );
          })}
        </svg>

        {/* parent labels */}
        <div className="absolute top-2 right-3 text-[11px] text-indigo-200 font-bold">والد ۱ 👨</div>
        <div className="absolute top-2 left-3 text-[11px] text-rose-200 font-bold">👩 والد ۲</div>

        {/* travelling gametes (parent 1 is on the right in the RTL layout) */}
        {animating && lastChild && (
          <div key={animKey} className="absolute inset-0 flex items-center justify-center">
            <div className="gamete-right absolute flex items-center gap-1 rounded-full bg-indigo-500/90 px-2 py-1 shadow-lg shadow-indigo-500/40">
              {lastChild.fromGametes[0].map((a, i) => (
                <AlleleChip key={i} a={a} small />
              ))}
            </div>
            <div className="gamete-left absolute flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-1 shadow-lg shadow-rose-500/40">
              {lastChild.fromGametes[1].map((a, i) => (
                <AlleleChip key={i} a={a} small />
              ))}
            </div>
          </div>
        )}

        {/* center zygote */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {running ? (
            <div className="text-center text-white">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <div className="absolute inset-0 rounded-full bg-emerald-400/40 pulse-ring" />
                <div className="absolute inset-0 rounded-full bg-emerald-400/30 pulse-ring" style={{ animationDelay: "0.4s" }} />
                <div className="absolute inset-2 rounded-full bg-emerald-400 flex items-center justify-center text-2xl">⚡</div>
              </div>
              <div className="num text-2xl font-black">{progress!.done.toLocaleString("en-US")} / {progress!.total.toLocaleString("en-US")}</div>
              <div className="text-xs text-emerald-200 mt-1">در حال شبیه‌سازی وراثت تصادفی…</div>
              <div className="w-48 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-400 transition-all" style={{ width: `${(progress!.done / progress!.total) * 100}%` }} />
              </div>
            </div>
          ) : lastChild && childGenotype ? (
            <div key={animKey} className="text-center zygote-pop" style={animating ? { animationDelay: "1s", animationFillMode: "both" } : undefined}>
              <div className="flex items-center gap-3 rtl">
                <div className="bg-white/95 rounded-2xl p-1 shadow-xl">
                  <Avatar organism={organism} genotype={childGenotype} activeTraitIds={traits.map((t) => t.id)} size={80} />
                </div>
                <div className="text-white text-right" dir="rtl">
                  <div className="text-[11px] text-slate-300">👶 فرزند شماره <span className="num">{lastChild.id}</span></div>
                  <div className="num text-3xl font-black tracking-wider">{lastChild.key}</div>
                  <div className="text-xs text-emerald-200">{pheno.map((p) => p.label).join(" • ")}</div>
                  <div className="text-[10px] text-slate-400">{traits.length === 1 ? ZYGOSITY_LABEL[zygosity(lastChild.genes[0])] : "ژنوتیپ دو صفتی"}</div>
                  {lastChild.mutated && <div className="chip bg-fuchsia-500 text-white mt-1">⚡ جهش رخ داد!</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-300">
              <div className="text-4xl mb-1">🥚</div>
              <div className="text-sm">برای شروع، «تولید یک فرزند» را بزن</div>
              <div className="text-[11px] text-slate-400 mt-1">یک گامت تصادفی از هر والد انتخاب و ترکیب می‌شود</div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button className="btn btn-primary col-span-2 sm:col-span-3 text-lg py-3" disabled={running || animating} onClick={() => onGenerate(1)}>
          🧬 تولید یک فرزند
        </button>
        {BATCHES.filter((b) => b > 1).map((b) => (
          <button key={b} className="btn btn-emerald" disabled={running || animating} onClick={() => onGenerate(b)}>
            ⚡ تولید <span className="num">{b.toLocaleString("en-US")}</span> فرزند
          </button>
        ))}
        <button className="btn btn-danger" disabled={!running} onClick={onStop}>
          ⏸ توقف
        </button>
        <button className="btn btn-secondary" onClick={onReset} disabled={running}>
          🔄 بازنشانی نتایج
        </button>
        <button className="btn btn-secondary" onClick={onRandom} disabled={running}>
          🎲 آزمایش تصادفی
        </button>
        <button
          className={`btn ${mutation ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-200" : "btn-secondary"}`}
          onClick={onToggleMutation}
          disabled={running}
        >
          {mutation ? "🧪 جهش فعال است" : "🧪 فعال‌سازی جهش"}
        </button>
      </div>
      {mutation && (
        <div className="rounded-xl bg-fuchsia-50 border border-fuchsia-200 p-2.5 text-xs text-fuchsia-800 leading-relaxed">
          <b>حالت جهش (Mutation):</b> هر آلل با احتمال ۲٪ هنگام انتقال به فرزند تغییر می‌کند (مثلاً A → a). به همین دلیل ممکن است ژنوتیپ‌هایی خارج از جدول پانت دیده شوند.
          <br />
          ⚠️ این مدل یک شبیه‌سازی ساده‌ی آموزشی است و نماینده‌ی کامل جهش‌های واقعی در موجودات زنده نیست.
        </div>
      )}
    </div>
  );
}
