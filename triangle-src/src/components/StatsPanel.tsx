import AnimatedNumber from "./AnimatedNumber";
import { TYPE_INFO, type TriangleStats } from "../lib/geometry";

interface Props {
  stats: TriangleStats;
  showType?: boolean;
  showExplain?: boolean;
  compact?: boolean;
}

export function TypeCard({ stats, small = false }: { stats: TriangleStats; small?: boolean }) {
  const info = TYPE_INFO[stats.type];
  return (
    <div
      key={stats.type}
      className={`animate-pop rounded-3xl border-4 ${info.bg} ${small ? "p-3" : "p-4"} shadow-md`}
    >
      <div className={`flex items-center gap-2 font-black ${info.color} ${small ? "text-base" : "text-xl"}`}>
        <span className={small ? "text-2xl" : "text-3xl"}>{info.emoji}</span>
        <span>{info.title}</span>
      </div>
      <p className={`mt-1 ${info.color} ${small ? "text-xs" : "text-sm sm:text-base"} font-medium leading-relaxed`}>
        {info.desc}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  suffix,
  color,
  digits = 1,
}: {
  label: string;
  value: number;
  suffix: string;
  color: string;
  digits?: number;
}) {
  return (
    <div className={`flex items-center justify-between rounded-2xl ${color} px-3 py-2`}>
      <span className="font-bold text-sm sm:text-base">{label}</span>
      <span className="font-black text-lg sm:text-xl">
        <AnimatedNumber value={value} digits={digits} /> <span className="text-sm font-bold">{suffix}</span>
      </span>
    </div>
  );
}

export default function StatsPanel({
  stats,
  showType = true,
  showExplain = true,
  compact = false,
}: Props) {
  return (
    <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
      {/* ضلع‌ها */}
      <div className="rounded-3xl bg-white/90 p-3 shadow-md">
        <h3 className="mb-2 flex items-center gap-2 font-black text-purple-700">
          <span>📏</span> طول ضلع‌ها
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["AB", stats.AB],
              ["BC", stats.BC],
              ["AC", stats.AC],
            ] as const
          ).map(([n, v]) => (
            <div key={n} className="rounded-2xl bg-purple-50 p-2 text-center">
              <div className="text-xs font-bold text-purple-500">{n}</div>
              <div className="text-lg font-black text-purple-800">
                <AnimatedNumber value={v} />
              </div>
              <div className="text-[10px] text-purple-400">سانتی‌متر</div>
            </div>
          ))}
        </div>
      </div>

      {/* زاویه‌ها */}
      <div className="rounded-3xl bg-white/90 p-3 shadow-md">
        <h3 className="mb-2 flex items-center gap-2 font-black text-rose-700">
          <span>📐</span> زاویه‌ها
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["A", stats.angA, "bg-red-50 text-red-700"],
              ["B", stats.angB, "bg-blue-50 text-blue-700"],
              ["C", stats.angC, "bg-green-50 text-green-700"],
            ] as const
          ).map(([n, v, c]) => (
            <div key={n} className={`rounded-2xl ${c} p-2 text-center`}>
              <div className="text-xs font-bold opacity-70">زاویه {n}</div>
              <div className="text-lg font-black">
                <AnimatedNumber value={v} digits={0} suffix="°" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-2xl bg-gradient-to-l from-rose-100 to-amber-100 px-3 py-2 text-center font-black text-rose-800">
          مجموع زاویه‌ها ={" "}
          <AnimatedNumber
            value={stats.type === "degenerate" ? 0 : 180}
            digits={0}
            suffix="°"
          />
          <span className="mr-1 text-xs font-bold text-rose-500">همیشه!</span>
        </div>
      </div>

      {/* محیط */}
      <div className="rounded-3xl bg-white/90 p-3 shadow-md">
        <Row
          label="🧵 محیط"
          value={stats.perimeter}
          suffix="سانتی‌متر"
          color="bg-emerald-100 text-emerald-800"
        />
        {showExplain && (
          <p className="mt-2 text-xs sm:text-sm font-medium text-emerald-700">
            💡 محیط یعنی اندازه‌ی دور شکل. سه ضلع را با هم جمع می‌کنیم.
          </p>
        )}
      </div>

      {/* مساحت */}
      <div className="rounded-3xl bg-white/90 p-3 shadow-md">
        <div className="flex flex-col gap-2">
          <Row
            label="🟧 قاعده (BC)"
            value={stats.base}
            suffix="cm"
            color="bg-orange-100 text-orange-800"
          />
          <Row
            label="🟦 ارتفاع"
            value={stats.height}
            suffix="cm"
            color="bg-sky-100 text-sky-800"
          />
          <Row
            label="🎨 مساحت"
            value={stats.area}
            suffix="cm²"
            color="bg-amber-100 text-amber-800"
          />
        </div>
        {showExplain && (
          <p className="mt-2 text-xs sm:text-sm font-medium text-amber-700">
            💡 مساحت یعنی مقدار فضایی که داخل شکل قرار گرفته است. (قاعده × ارتفاع ÷ ۲)
          </p>
        )}
      </div>

      {showType && <TypeCard stats={stats} />}
    </div>
  );
}
