import type { Organism, Trait } from "../genetics/data";
import { GENOTYPE_OPTIONS } from "../genetics/data";
import { isDominantExpressed, uniqueGametes, zygosity, ZYGOSITY_LABEL, type Genotype } from "../genetics/engine";
import Avatar from "./Avatar";

interface Props {
  title: string;
  emoji: string;
  organism: Organism;
  activeTraits: Trait[];
  genotype: Genotype;
  onChange: (traitId: string, value: string) => void;
  accent: "indigo" | "rose";
  compact?: boolean;
}

export function AlleleChip({ a, small }: { a: string; small?: boolean }) {
  const dom = a === a.toUpperCase();
  return (
    <span
      className={`num inline-flex items-center justify-center rounded-lg font-black border ${small ? "w-6 h-6 text-xs" : "w-9 h-9 text-lg"} ${
        dom ? "bg-indigo-600 text-white border-indigo-700" : "bg-amber-100 text-amber-800 border-amber-300"
      }`}
    >
      {a}
    </span>
  );
}

export default function ParentPanel({ title, emoji, organism, activeTraits, genotype, onChange, accent, compact }: Props) {
  const ring = accent === "indigo" ? "border-indigo-200 from-indigo-50" : "border-rose-200 from-rose-50";
  const badge = accent === "indigo" ? "bg-indigo-600" : "bg-rose-500";
  const gametes = uniqueGametes(genotype, activeTraits);

  return (
    <div className={`card overflow-hidden border ${ring} bg-gradient-to-b to-white fade-up`}>
      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="text-lg font-black flex items-center gap-2">
          <span className="text-2xl">{emoji}</span> {title}
        </h3>
        <span className={`chip text-white ${badge}`}>
          {activeTraits.map((t) => genotype[t.id]).join(" ")}
        </span>
      </div>

      <div className="flex justify-center py-2">
        <Avatar organism={organism} genotype={genotype} activeTraitIds={activeTraits.map((t) => t.id)} size={compact ? 96 : 130} />
      </div>

      <div className="px-4 pb-4 space-y-3">
        {activeTraits.map((t) => {
          const g = genotype[t.id];
          const z = zygosity(g);
          const dom = isDominantExpressed(g);
          return (
            <div key={t.id} className="rounded-xl bg-white border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm flex items-center gap-1">
                  <span>{t.emoji}</span> {t.name}
                </span>
                <span className="chip border" style={{ background: dom ? t.dominant.color + "22" : t.recessive.color + "44", borderColor: dom ? t.dominant.color : "#cbd5e1" }}>
                  فنوتیپ: {dom ? t.dominant.label : t.recessive.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {GENOTYPE_OPTIONS(t).map((o) => {
                  const active = o.value === g;
                  const oDom = isDominantExpressed(o.value);
                  return (
                    <button
                      key={o.value}
                      onClick={() => onChange(t.id, o.value)}
                      title={o.zygosity}
                      className={`rounded-lg border px-1 py-1.5 text-center transition-all ${
                        active ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 shadow" : "border-slate-200 hover:border-indigo-300 bg-white"
                      }`}
                    >
                      <div className="num text-lg font-black">{o.value}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{o.short}</div>
                      <div className="text-[10px] font-semibold mt-0.5" style={{ color: oDom ? t.dominant.color : "#92400e" }}>
                        → {oDom ? t.dominant.label : t.recessive.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  آلل‌ها: <AlleleChip a={g[0]} small /> <AlleleChip a={g[1]} small />
                </span>
                <span className="font-semibold">{ZYGOSITY_LABEL[z]}</span>
              </div>
            </div>
          );
        })}

        <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-2.5">
          <div className="text-xs font-bold text-slate-600 mb-1.5">گامت‌های ممکن (Gametes) — هر گامت یک آلل از هر صفت دارد:</div>
          <div className="flex flex-wrap gap-2 justify-center ltr">
            {gametes.map((gm) => (
              <span key={gm} className="num inline-flex items-center gap-0.5 rounded-full bg-white border border-slate-300 px-2 py-1 shadow-sm">
                {gm.split("").map((a, i) => (
                  <AlleleChip key={i} a={a} small />
                ))}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 text-center">
            هنگام تولید هر گامت، هر یک از دو آلل هر صفت با احتمال ۵۰٪ انتخاب می‌شود ({uniqueGametesCount(activeTraits)} ترکیب ممکن).
          </div>
        </div>
      </div>
    </div>
  );
}

function uniqueGametesCount(traits: Trait[]) {
  return Math.pow(2, traits.length);
}
