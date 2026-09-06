import { ORGANISMS, type Organism } from "../genetics/data";

interface Props {
  organism: Organism;
  onOrganism: (id: string) => void;
  trait1: string;
  trait2: string | null;
  onTraits: (t1: string, t2: string | null) => void;
  onPreset: (p1: "DD" | "Dr" | "rr", p2: "DD" | "Dr" | "rr", dihybrid?: boolean) => void;
  disabled?: boolean;
}

const PRESETS: { label: string; p1: "DD" | "Dr" | "rr"; p2: "DD" | "Dr" | "rr"; note: string }[] = [
  { label: "AA × aa", p1: "DD", p2: "rr", note: "همه‌ی فرزندان Aa؛ صفت مغلوب پنهان می‌شود" },
  { label: "Aa × Aa", p1: "Dr", p2: "Dr", note: "نسبت کلاسیک ۱:۲:۱ و ۳:۱" },
  { label: "Aa × aa", p1: "Dr", p2: "rr", note: "آمیزش آزمون (Test cross) — نسبت ۱:۱" },
  { label: "AA × Aa", p1: "DD", p2: "Dr", note: "۱۰۰٪ فنوتیپ غالب با دو ژنوتیپ" },
];

export default function SetupPanel({ organism, onOrganism, trait1, trait2, onTraits, onPreset, disabled }: Props) {
  return (
    <div className="card p-4 fade-up space-y-4">
      <div>
        <div className="text-sm font-black mb-2 flex items-center gap-1">🔬 انتخاب موجود زنده</div>
        <div className="grid grid-cols-4 gap-1.5">
          {ORGANISMS.map((o) => (
            <button
              key={o.id}
              disabled={disabled}
              onClick={() => onOrganism(o.id)}
              className={`rounded-xl border-2 p-2 text-center transition-all ${o.id === organism.id ? "border-indigo-500 bg-indigo-50 shadow" : "border-slate-200 bg-white hover:border-indigo-300"}`}
              title={o.description}
            >
              <div className="text-2xl">{o.emoji}</div>
              <div className="text-xs font-bold">{o.name}</div>
            </button>
          ))}
        </div>
        <div className="text-[11px] text-slate-500 mt-1.5">{organism.description}</div>
      </div>

      <div>
        <div className="text-sm font-black mb-2 flex items-center gap-1">🧩 صفات مورد بررسی (Traits)</div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs">
            <span className="block text-slate-500 mb-1">صفت اول</span>
            <select
              disabled={disabled}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-bold"
              value={trait1}
              onChange={(e) => onTraits(e.target.value, trait2 === e.target.value ? null : trait2)}
            >
              {organism.traits.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.name} ({t.dominant.symbol}/{t.recessive.symbol})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            <span className="block text-slate-500 mb-1">صفت دوم (حالت پیشرفته — دو صفتی)</span>
            <select
              disabled={disabled}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-bold"
              value={trait2 ?? ""}
              onChange={(e) => onTraits(trait1, e.target.value || null)}
            >
              <option value="">— فقط یک صفت —</option>
              {organism.traits
                .filter((t) => t.id !== trait1)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.emoji} {t.name} ({t.dominant.symbol}/{t.recessive.symbol})
                  </option>
                ))}
            </select>
          </label>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {organism.traits.map((t) => {
            const on = t.id === trait1 || t.id === trait2;
            return (
              <div key={t.id} className={`rounded-lg border px-2 py-1 text-[11px] flex items-center justify-between ${on ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white opacity-70"}`}>
                <span>
                  {t.emoji} {t.name}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300" style={{ background: t.dominant.color }} />
                  <span className="num font-black">{t.dominant.symbol}</span> {t.dominant.label} /
                  <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300" style={{ background: t.recessive.color }} />
                  <span className="num font-black">{t.recessive.symbol}</span> {t.recessive.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-sm font-black mb-2 flex items-center gap-1">🧪 آزمایش‌های پیشنهادی</div>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((p, i) => (
            <button key={i} disabled={disabled} onClick={() => onPreset(p.p1, p.p2)} className="rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 p-2 text-right transition-all">
              <div className="text-[10px] text-slate-400">آزمایش {i + 1}</div>
              <div className="num font-black text-base text-indigo-700">{p.label}</div>
              <div className="text-[10px] text-slate-500 leading-tight">{p.note}</div>
            </button>
          ))}
          <button disabled={disabled} onClick={() => onPreset("Dr", "Dr", true)} className="col-span-2 rounded-xl border border-violet-200 bg-violet-50 hover:border-violet-400 p-2 text-right transition-all">
            <div className="text-[10px] text-violet-500">آزمایش دو صفتی (Dihybrid)</div>
            <div className="num font-black text-base text-violet-800">AaBb × AaBb</div>
            <div className="text-[10px] text-slate-500 leading-tight">نسبت فنوتیپی ۹:۳:۳:۱ — جدول پانت ۴×۴</div>
          </button>
        </div>
      </div>

      <details className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
        <summary className="cursor-pointer font-black text-sm">📚 واژه‌نامه‌ی ژنتیک</summary>
        <ul className="mt-2 space-y-1 text-slate-600 leading-relaxed">
          <li><b>ژن (Gene):</b> بخشی از DNA که یک صفت را کنترل می‌کند.</li>
          <li><b>آلل (Allele):</b> شکل‌های مختلف یک ژن؛ مثل A و a.</li>
          <li><b>ژنوتیپ (Genotype):</b> ترکیب آلل‌های فرد؛ مثل Aa.</li>
          <li><b>فنوتیپ (Phenotype):</b> ظاهر قابل مشاهده؛ مثل گل قرمز.</li>
          <li><b>غالب (Dominant):</b> آللی که حتی با یک نسخه اثرش دیده می‌شود (حرف بزرگ).</li>
          <li><b>مغلوب (Recessive):</b> آللی که فقط با دو نسخه دیده می‌شود (حرف کوچک).</li>
          <li><b>هموزیگوت (Homozygous):</b> دو آلل یکسان (AA یا aa).</li>
          <li><b>هتروزیگوت (Heterozygous):</b> دو آلل متفاوت (Aa).</li>
          <li><b>گامت (Gamete):</b> سلول جنسی که از هر ژن فقط یک آلل دارد.</li>
          <li><b>جدول پانت (Punnett Square):</b> ابزاری برای پیش‌بینی احتمال ژنوتیپ فرزندان.</li>
        </ul>
      </details>
    </div>
  );
}
