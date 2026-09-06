import { useEffect, useState } from "react";
import type { Trait } from "../genetics/data";
import { pct, phenotypeOf, phenotypeShortLabel, ZYGOSITY_LABEL, zygosity, type CrossAnalysis, type PunnettCell } from "../genetics/engine";
import { AlleleChip } from "./ParentPanel";

interface Props {
  analysis: CrossAnalysis;
  traits: Trait[];
  hidden?: boolean;
  onReveal?: () => void;
  highlightKey?: string | null;
  onCellClick?: (cell: PunnettCell) => void;
}

export default function PunnettSquare({ analysis, traits, hidden, onReveal, highlightKey, onCellClick }: Props) {
  const [selected, setSelected] = useState<PunnettCell | null>(null);
  const { gametes1, gametes2, grid, total, genotypeProb, phenotypeProb } = analysis;
  useEffect(() => setSelected(null), [analysis]);
  const cellSize = gametes1.length > 2 ? "w-14 h-14 text-sm" : "w-20 h-20 text-2xl";

  const cellColor = (c: PunnettCell) => {
    if (traits.length === 1) {
      const z = zygosity(c.genes[0]);
      return z === "homDom" ? "bg-indigo-100 border-indigo-300" : z === "het" ? "bg-violet-100 border-violet-300" : "bg-amber-100 border-amber-300";
    }
    const domCount = c.phenoKey.split("").filter((x) => x === "D").length;
    return domCount === 2 ? "bg-indigo-100 border-indigo-300" : domCount === 1 ? "bg-violet-100 border-violet-300" : "bg-amber-100 border-amber-300";
  };

  return (
    <div className="card p-4 fade-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-black flex items-center gap-2">
          <span className="text-2xl">🔲</span> جدول پانت (Punnett Square)
        </h3>
        <span className="chip bg-slate-100 text-slate-600">
          <span className="num">{gametes1.length}×{gametes2.length}</span> = <span className="num">{total}</span> ترکیب
        </span>
      </div>

      {hidden ? (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="text-4xl mb-2">🙈</div>
          <div className="font-bold text-slate-600">جدول پانت در حالت معلم مخفی است</div>
          <div className="text-xs text-slate-500 mt-1 mb-3">ابتدا از دانش‌آموزان بخواهید احتمال‌ها را پیش‌بینی کنند.</div>
          <button className="btn btn-amber" onClick={onReveal}>
            👁️ نمایش پاسخ
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="ltr overflow-x-auto scroll-thin">
            <table className="border-separate border-spacing-1 mx-auto">
              <thead>
                <tr>
                  <th className="text-[10px] text-slate-400 font-normal">
                    <div className="leading-tight">
                      <span className="text-rose-500 font-bold">والد ۲ →</span>
                      <br />
                      <span className="text-indigo-500 font-bold">↓ والد ۱</span>
                    </div>
                  </th>
                  {gametes2.map((g, j) => (
                    <th key={j} className="pb-1">
                      <div className="inline-flex gap-0.5 rounded-full bg-rose-50 border border-rose-200 px-1.5 py-1">
                        {g.map((a, i) => (
                          <AlleleChip key={i} a={a} small />
                        ))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.map((row, i) => (
                  <tr key={i}>
                    <th className="pr-1">
                      <div className="inline-flex gap-0.5 rounded-full bg-indigo-50 border border-indigo-200 px-1.5 py-1">
                        {gametes1[i].map((a, k) => (
                          <AlleleChip key={k} a={a} small />
                        ))}
                      </div>
                    </th>
                    {row.map((cell, j) => {
                      const isSel = selected?.key === cell.key && selected === cell;
                      const hl = highlightKey && cell.key === highlightKey;
                      return (
                        <td key={j}>
                          <button
                            onClick={() => {
                              setSelected(cell);
                              onCellClick?.(cell);
                            }}
                            className={`num ${cellSize} rounded-xl border-2 font-black flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md ${cellColor(cell)} ${
                              isSel ? "ring-4 ring-indigo-400 scale-105" : ""
                            } ${hl ? "ring-4 ring-emerald-400" : ""}`}
                            title="برای جزئیات کلیک کن"
                          >
                            {cell.key}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex-1 min-w-[200px]">
            {selected ? (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 pop-in" key={selected.key}>
                <div className="text-xs text-slate-500 mb-1">خانه‌ی انتخاب‌شده</div>
                <div className="num text-3xl font-black text-indigo-800">{selected.key}</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div className="rounded-lg bg-white p-2 border border-slate-200">
                    <div className="text-[10px] text-slate-500">احتمال (Probability)</div>
                    <div className="num text-xl font-black text-emerald-700">{pct(genotypeProb[selected.key], 1)}</div>
                    <div className="text-[10px] text-slate-400 num">
                      {Math.round(genotypeProb[selected.key] * total)}/{total}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-slate-200">
                    <div className="text-[10px] text-slate-500">فنوتیپ (Phenotype)</div>
                    <div className="text-sm font-black">{phenotypeOf(selected.genes, traits).map((p) => p.label).join(" • ")}</div>
                    <div className="text-[10px] text-slate-500">
                      {traits.length === 1 ? (selected.phenoKey === "D" ? "غالب (Dominant)" : "مغلوب (Recessive)") : `احتمال این فنوتیپ: ${pct(phenotypeProb[selected.phenoKey])}`}
                    </div>
                  </div>
                </div>
                {traits.length === 1 && <div className="text-xs mt-2 text-slate-600 font-semibold">{ZYGOSITY_LABEL[zygosity(selected.genes[0])]}</div>}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 h-full flex flex-col items-center justify-center">
                <div className="text-2xl mb-1">👆</div>
                روی هر خانه‌ی جدول کلیک کن تا ژنوتیپ، فنوتیپ و احتمال آن را ببینی.
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
              {analysis.phenotypeOrder.map((pk) => (
                <span key={pk} className="chip bg-slate-100 text-slate-700 border border-slate-200">
                  {phenotypeShortLabel(pk, traits)}: <span className="num font-black">{pct(phenotypeProb[pk], 1)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
