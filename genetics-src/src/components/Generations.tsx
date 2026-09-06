import { useState } from "react";
import type { Organism, Trait } from "../genetics/data";
import { phenotypeOf, randomChild, type Child, type Genotype } from "../genetics/engine";
import Avatar from "./Avatar";

interface Props {
  organism: Organism;
  traits: Trait[];
  p1: Genotype;
  p2: Genotype;
  mutation: boolean;
  onClose: () => void;
}

const toGenotype = (c: Child, traits: Trait[]): Genotype => Object.fromEntries(traits.map((t, i) => [t.id, c.genes[i]]));

function Individual({ organism, traits, genotype, label, selected, onClick, small }: { organism: Organism; traits: Trait[]; genotype: Genotype; label: string; selected?: boolean; onClick?: () => void; small?: boolean }) {
  const genes = traits.map((t) => genotype[t.id]);
  const ph = phenotypeOf(genes, traits);
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-xl border-2 bg-white p-1.5 text-center transition-all ${onClick ? "hover:border-indigo-300 cursor-pointer" : "cursor-default"} ${selected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200"}`}
    >
      <div className="text-[10px] text-slate-500">{label}</div>
      <Avatar organism={organism} genotype={genotype} activeTraitIds={traits.map((t) => t.id)} size={small ? 48 : 64} className="mx-auto" />
      <div className="num font-black text-sm">{genes.join("")}</div>
      <div className="text-[10px] text-slate-600 leading-tight">{ph.map((p) => p.label).join(" • ")}</div>
    </button>
  );
}

export default function Generations({ organism, traits, p1, p2, mutation, onClose }: Props) {
  const [f1, setF1] = useState<Child[]>([]);
  const [pair, setPair] = useState<number[]>([]);
  const [f2, setF2] = useState<Child[]>([]);

  const makeF1 = () => {
    const kids = Array.from({ length: 4 }, (_, i) => randomChild(i + 1, p1, p2, traits, mutation));
    setF1(kids);
    setPair([0, 1]);
    setF2([]);
  };

  const togglePick = (i: number) => {
    setF2([]);
    setPair((p) => {
      if (p.includes(i)) return p.filter((x) => x !== i);
      if (p.length >= 2) return [p[1], i];
      return [...p, i];
    });
  };

  const makeF2 = () => {
    if (pair.length !== 2) return;
    const a = toGenotype(f1[pair[0]], traits);
    const b = toGenotype(f1[pair[1]], traits);
    setF2(Array.from({ length: 4 }, (_, i) => randomChild(i + 1, a, b, traits, mutation)));
  };

  return (
    <div className="card p-4 border-sky-200 bg-gradient-to-br from-sky-50/70 to-white fade-up">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-black flex items-center gap-2">
          <span className="text-2xl">👨‍👩‍👧</span> نسل‌ها (شجره‌نامه‌ی ساده)
        </h3>
        <button className="text-slate-400 hover:text-slate-700 text-xl leading-none" onClick={onClose} title="بستن">
          ×
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        ببین چگونه یک صفت (مثلاً صفت مغلوب) می‌تواند در یک نسل «پنهان» بماند و در نسل بعد دوباره ظاهر شود. دو فرد از نسل اول را انتخاب کن تا والدین نسل دوم باشند.
      </p>

      {/* P generation */}
      <div className="text-center">
        <div className="text-xs font-black text-slate-500 mb-1">والدین (P)</div>
        <div className="flex justify-center gap-3">
          <Individual organism={organism} traits={traits} genotype={p1} label="👨 والد ۱" />
          <Individual organism={organism} traits={traits} genotype={p2} label="👩 والد ۲" />
        </div>
      </div>

      <div className="text-center text-2xl text-slate-300 my-1">↓</div>

      {/* F1 */}
      <div className="text-center">
        <div className="text-xs font-black text-slate-500 mb-1">نسل اول (F1)</div>
        {f1.length === 0 ? (
          <button className="btn btn-primary" onClick={makeF1}>
            🧬 تولید نسل اول (۴ فرزند)
          </button>
        ) : (
          <>
            <div className="flex justify-center gap-2 flex-wrap">
              {f1.map((c, i) => (
                <Individual key={i} organism={organism} traits={traits} genotype={toGenotype(c, traits)} label={`فرزند ${i + 1}`} selected={pair.includes(i)} onClick={() => togglePick(i)} small />
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-2">
              <button className="btn btn-secondary text-xs" onClick={makeF1}>
                🔁 تولید دوباره نسل اول
              </button>
              <button className="btn btn-emerald text-xs" onClick={makeF2} disabled={pair.length !== 2}>
                🧬 آمیزش دو فرد انتخاب‌شده → نسل دوم
              </button>
            </div>
          </>
        )}
      </div>

      {f2.length > 0 && (
        <>
          <div className="text-center text-2xl text-slate-300 my-1">↓</div>
          <div className="text-center pop-in">
            <div className="text-xs font-black text-slate-500 mb-1">
              نسل دوم (F2) — از آمیزش <span className="num">{f1[pair[0]].key}</span> × <span className="num">{f1[pair[1]].key}</span>
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              {f2.map((c, i) => (
                <Individual key={i} organism={organism} traits={traits} genotype={toGenotype(c, traits)} label={`نوه ${i + 1}`} small />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
