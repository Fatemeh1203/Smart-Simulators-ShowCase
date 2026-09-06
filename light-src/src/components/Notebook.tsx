import { DISCOVERIES, useStore, type DiscoveryId } from "../lab/store";
import { fa } from "../lab/format";

export default function Notebook({ compact }: { compact?: boolean }) {
  const { discoveries } = useStore();
  const all = Object.keys(DISCOVERIES) as DiscoveryId[];
  return (
    <div className="rounded-3xl border-4 border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50 p-4 shadow-[0_6px_0_rgba(0,0,0,0.08)]">
      <div className="mb-2 flex items-center gap-2 text-lg font-black text-amber-900">
        📖 چیزهایی که کشف کردم
        <span className="mr-auto rounded-full bg-amber-200 px-2 py-0.5 text-xs font-black text-amber-900">
          {fa(discoveries.length)} / {fa(all.length)}
        </span>
      </div>
      {discoveries.length === 0 && (
        <p className="rounded-xl bg-white/70 p-3 text-sm font-bold text-amber-800">هنوز چیزی کشف نکرده‌ای. آزمایش کن تا کارت‌های کشف اینجا اضافه شوند! 🔍</p>
      )}
      <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        {all
          .filter((id) => discoveries.includes(id))
          .map((id) => {
            const d = DISCOVERIES[id];
            return (
              <div key={id} className={`bounce-in flex items-center gap-2 rounded-2xl border-2 p-2.5 text-sm font-bold text-slate-700 ${d.color}`}>
                <span className="text-2xl">{d.emoji}</span>
                <span>«{d.text}»</span>
              </div>
            );
          })}
        {all
          .filter((id) => !discoveries.includes(id))
          .slice(0, compact ? 2 : 8)
          .map((id) => (
            <div key={id} className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-amber-300 bg-white/50 p-2.5 text-sm font-bold text-amber-400">
              <span className="text-2xl">❓</span>
              <span>هنوز کشف نشده...</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function DiscoveryToast() {
  const { lastDiscovery } = useStore();
  if (!lastDiscovery) return null;
  const d = DISCOVERIES[lastDiscovery];
  return (
    <div className="bounce-in fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-3xl border-4 border-yellow-300 bg-white px-5 py-3 shadow-2xl">
      <div className="text-center text-xs font-black text-purple-500">✨ کشف جدید به دفترچه اضافه شد!</div>
      <div className="mt-1 flex items-center gap-2 text-lg font-black text-slate-800">
        <span className="text-3xl">{d.emoji}</span> {d.text}
      </div>
    </div>
  );
}
