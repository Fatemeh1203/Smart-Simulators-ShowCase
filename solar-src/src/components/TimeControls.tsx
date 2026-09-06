import { fa } from "../data/planets";
import { cn } from "../utils/cn";

interface Props {
  playing: boolean;
  multiplier: number;
  days: number;
  onPlay: () => void;
  onPause: () => void;
  onMultiplier: (m: number) => void;
  onReset: () => void;
}

export default function TimeControls({ playing, multiplier, days, onPlay, onPause, onMultiplier, onReset }: Props) {
  const years = days / 365.25;
  return (
    <div className="glass rounded-3xl px-3 py-2 flex flex-wrap items-center gap-2 justify-center">
      <button
        onClick={playing ? onPause : onPlay}
        className={cn(
          "big-btn text-xl min-w-[120px]",
          playing ? "bg-amber-400 text-amber-950 hover:bg-amber-300" : "bg-green-500 text-white hover:bg-green-400"
        )}
      >
        {playing ? "⏸ توقف" : "▶️ شروع"}
      </button>
      <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1">
        {[1, 2, 5, 10].map((m) => (
          <button
            key={m}
            onClick={() => onMultiplier(m)}
            className={cn(
              "rounded-xl px-3 py-2 font-bold text-base transition-all",
              multiplier === m ? "bg-sky-400 text-sky-950 shadow-lg scale-105" : "text-sky-100 hover:bg-white/10"
            )}
          >
            {m === 1 ? "▶ ×۱" : `⏩ ×${fa(m)}`}
          </button>
        ))}
      </div>
      <button onClick={onReset} className="big-btn bg-rose-500/90 text-white hover:bg-rose-400">
        🔄 بازنشانی
      </button>
      <div className="text-sm sm:text-base bg-black/30 rounded-2xl px-3 py-2 text-sky-100 font-bold whitespace-nowrap">
        📅 روز {fa(Math.floor(days))}
        <span className="text-sky-300/80 mr-2">({fa(years, 1)} سال زمینی)</span>
      </div>
    </div>
  );
}
