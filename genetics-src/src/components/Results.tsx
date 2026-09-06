import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Organism, Trait } from "../genetics/data";
import { phenotypeOf, phenotypeShortLabel, type Child, type CrossAnalysis, type Genotype } from "../genetics/engine";
import Avatar from "./Avatar";

export interface Stats {
  total: number;
  geno: Record<string, number>;
  pheno: Record<string, number>;
  recent: Child[];
  mutations: number;
}

interface Props {
  analysis: CrossAnalysis;
  stats: Stats;
  traits: Trait[];
  organism: Organism;
  hideTheory?: boolean;
}

function unionKeys(order: string[], observed: Record<string, number>) {
  const keys = [...order];
  for (const k of Object.keys(observed)) if (!keys.includes(k)) keys.push(k);
  return keys;
}

function CompareTable({ title, keys, theory, observed, total, labelOf, hideTheory }: { title: string; keys: string[]; theory: Record<string, number>; observed: Record<string, number>; total: number; labelOf: (k: string) => string; hideTheory?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-3 py-2 text-sm font-black border-b border-slate-200">{title}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-500 bg-white">
            <th className="text-right px-3 py-1.5 font-semibold">{title.includes("ژنوتیپ") ? "ژنوتیپ" : "فنوتیپ"}</th>
            <th className="px-2 py-1.5 font-semibold">نظری</th>
            <th className="px-2 py-1.5 font-semibold">تجربی</th>
            <th className="px-2 py-1.5 font-semibold">تعداد</th>
            <th className="px-2 py-1.5 font-semibold">اختلاف</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => {
            const th = (theory[k] || 0) * 100;
            const count = observed[k] || 0;
            const ex = total ? (count / total) * 100 : null;
            const diff = ex === null ? null : ex - th;
            const notInTheory = !(k in theory);
            return (
              <tr key={k} className="border-t border-slate-100">
                <td className="px-3 py-1.5 font-bold">
                  <span className="num">{title.includes("ژنوتیپ") ? k : ""}</span> {labelOf(k)}
                  {notInTheory && <span className="chip bg-fuchsia-100 text-fuchsia-700 mr-1">جهش</span>}
                </td>
                <td className="text-center num font-bold text-indigo-700">{hideTheory ? "؟" : `${th.toFixed(1)}٪`}</td>
                <td className="text-center num font-bold text-emerald-700">{ex === null ? "—" : `${ex.toFixed(1)}٪`}</td>
                <td className="text-center num text-slate-500">{count.toLocaleString("en-US")}</td>
                <td className={`text-center num text-xs ${diff === null || hideTheory ? "text-slate-400" : Math.abs(diff) < 2 ? "text-emerald-600" : Math.abs(diff) < 5 ? "text-amber-600" : "text-rose-600"}`}>
                  {diff === null || hideTheory ? "—" : `${diff > 0 ? "+" : ""}${diff.toFixed(1)}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Results({ analysis, stats, traits, organism, hideTheory }: Props) {
  const gKeys = unionKeys(analysis.genotypeOrder, stats.geno);
  const pKeys = unionKeys(analysis.phenotypeOrder, stats.pheno);
  const genoLabel = () => "";
  const phenoLabel = (k: string) => phenotypeShortLabel(k, traits);

  const gData = gKeys.map((k) => ({
    name: k,
    نظری: hideTheory ? 0 : +((analysis.genotypeProb[k] || 0) * 100).toFixed(2),
    تجربی: stats.total ? +(((stats.geno[k] || 0) / stats.total) * 100).toFixed(2) : 0,
  }));
  const pData = pKeys.map((k) => ({
    name: traits.length === 1 ? (k === "D" ? "غالب" : "مغلوب") : phenoLabel(k),
    نظری: hideTheory ? 0 : +((analysis.phenotypeProb[k] || 0) * 100).toFixed(2),
    تجربی: stats.total ? +(((stats.pheno[k] || 0) / stats.total) * 100).toFixed(2) : 0,
  }));

  return (
    <div className="card p-4 fade-up">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-lg font-black flex items-center gap-2">
          <span className="text-2xl">📊</span> مقایسه‌ی احتمال نظری و نتیجه‌ی تجربی
        </h3>
        <div className="flex gap-2">
          <span className="chip bg-indigo-50 text-indigo-700 border border-indigo-200">
            n = <span className="num font-black">{stats.total.toLocaleString("en-US")}</span>
          </span>
          {stats.mutations > 0 && (
            <span className="chip bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">
              جهش‌ها: <span className="num">{stats.mutations}</span>
            </span>
          )}
        </div>
      </div>

      {stats.total === 0 && (
        <div className="mb-3 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">
          هنوز فرزندی تولید نشده است. ستون «تجربی» فقط از فرزندان شبیه‌سازی‌شده‌ی تصادفی محاسبه می‌شود.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <CompareTable title="ژنوتیپ‌ها (Genotype)" keys={gKeys} theory={analysis.genotypeProb} observed={stats.geno} total={stats.total} labelOf={genoLabel} hideTheory={hideTheory} />
        <CompareTable title="فنوتیپ‌ها (Phenotype)" keys={pKeys} theory={analysis.phenotypeProb} observed={stats.pheno} total={stats.total} labelOf={phenoLabel} hideTheory={hideTheory} />
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-4 ltr">
        <div className="rounded-xl border border-slate-200 p-2">
          <div className="text-sm font-black text-right mb-1" dir="rtl">نمودار ۱ — ژنوتیپ‌ها</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {!hideTheory && <Bar dataKey="نظری" fill="#6366f1" radius={[6, 6, 0, 0]} isAnimationActive={false} />}
                <Bar dataKey="تجربی" fill="#10b981" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-2">
          <div className="text-sm font-black text-right mb-1" dir="rtl">نمودار ۲ — فنوتیپ‌ها</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {!hideTheory && <Bar dataKey="نظری" fill="#6366f1" radius={[6, 6, 0, 0]} isAnimationActive={false} />}
                <Bar dataKey="تجربی" fill="#10b981" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Children cards */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-black">👶 آخرین فرزندان تولیدشده</div>
          {stats.total > stats.recent.length && (
            <span className="text-[11px] text-slate-500">
              نمایش <span className="num">{stats.recent.length}</span> فرزند آخر از <span className="num">{stats.total.toLocaleString("en-US")}</span> — بقیه در شمارنده‌ها و نمودارها لحاظ شده‌اند
            </span>
          )}
        </div>
        {stats.recent.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">کارت فرزندان اینجا نمایش داده می‌شود.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {stats.recent.map((c, idx) => {
              const g: Genotype = Object.fromEntries(traits.map((t, i) => [t.id, c.genes[i]]));
              const ph = phenotypeOf(c.genes, traits);
              return (
                <div key={c.id} className={`rounded-xl border p-1.5 text-center bg-white ${idx === 0 ? "border-emerald-400 ring-2 ring-emerald-200 pop-in" : "border-slate-200"} ${c.mutated ? "border-fuchsia-400" : ""}`}>
                  <div className="text-[10px] text-slate-400">
                    فرزند <span className="num">{c.id}</span>
                  </div>
                  <Avatar organism={organism} genotype={g} activeTraitIds={traits.map((t) => t.id)} size={54} className="mx-auto" />
                  <div className="num font-black text-sm">{c.key}</div>
                  <div className="text-[10px] text-slate-600 leading-tight truncate">{ph.map((p) => p.label).join(" • ")}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
