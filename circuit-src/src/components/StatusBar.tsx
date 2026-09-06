import { Analysis } from "../circuit/analyze";

export default function StatusBar({ analysis }: { analysis: Analysis }) {
  const styles: Record<Analysis["status"], string> = {
    empty: "bg-slate-100 border-slate-300 text-slate-600",
    lit: "bg-yellow-100 border-yellow-400 text-yellow-900",
    open: "bg-red-50 border-red-300 text-red-800",
    partial: "bg-amber-50 border-amber-300 text-amber-900",
    short: "bg-red-100 border-red-400 text-red-900",
    noBattery: "bg-orange-50 border-orange-300 text-orange-900",
    noBulb: "bg-sky-50 border-sky-300 text-sky-900",
  };
  const icon: Record<Analysis["status"], string> = {
    empty: "🧲",
    lit: "🎉",
    open: "🔍",
    partial: "🤔",
    short: "⚠️",
    noBattery: "🔋",
    noBulb: "💡",
  };
  return (
    <div key={analysis.status + analysis.message} className={`rounded-2xl border-2 px-3 py-2 pop-in ${styles[analysis.status]}`}>
      <div className="flex items-start gap-2">
        <span className={`text-2xl leading-none ${analysis.status === "lit" ? "wiggle" : ""}`}>{icon[analysis.status]}</span>
        <div className="flex-1">
          <div className="font-black text-sm md:text-base leading-snug">{analysis.message}</div>
          {analysis.hint && <div className="text-xs mt-1 leading-relaxed opacity-90">{analysis.hint}</div>}
        </div>
      </div>
    </div>
  );
}
