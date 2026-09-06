import { fa, formatPeriod, ORDINALS, planetById, PLANETS } from "../data/planets";
import type { Body } from "../sim/Simulation";

interface Props {
  id: string;
  body?: Body;
  onClose: () => void;
  onDayNight?: () => void;
  onSeasons?: () => void;
  onRemoveCustom?: (id: string) => void;
}

export default function PlanetCard({ id, body, onClose, onDayNight, onSeasons, onRemoveCustom }: Props) {
  if (id === "sun") {
    return (
      <Card onClose={onClose} color="#ffb020">
        <div className="text-5xl text-center animate-float">☀️</div>
        <h3 className="text-2xl font-black text-center text-amber-200">خورشید</h3>
        <p className="text-center text-amber-100/90">«ستاره‌ی ما»</p>
        <ul className="text-sm space-y-1 mt-2 text-white/90">
          <li>🔥 خورشید یک ستاره است، نه سیاره!</li>
          <li>🌟 همه‌ی سیاره‌ها به دور آن می‌چرخند.</li>
          <li>📏 بیش از یک میلیون زمین در آن جا می‌شود.</li>
          <li>💡 نور و گرمای زمین از خورشید می‌آید.</li>
        </ul>
      </Card>
    );
  }

  const def = PLANETS.find((p) => p.id === id);
  if (!def) {
    // سیاره‌ی ساخته‌شده توسط دانش‌آموز
    if (!body) return null;
    return (
      <Card onClose={onClose} color={body.color}>
        <div className="text-5xl text-center animate-float">🪐</div>
        <h3 className="text-2xl font-black text-center">{body.name}</h3>
        <p className="text-center text-white/80">«سیاره‌ی ساخته‌ی خودت!»</p>
        <ul className="text-sm space-y-1 mt-2 text-white/90">
          <li>📏 فاصله‌ی نمایشی از خورشید: {fa(body.orbitR)} واحد</li>
          <li>⏱ زمان تقریبی یک دور: {formatPeriod(body.period)}</li>
          <li>💨 سرعت: {body.speedFactor < 1 ? "کم" : body.speedFactor > 1 ? "زیاد" : "معمولی"}</li>
          <li>
            وضعیت:{" "}
            {body.status === "ok" ? "در حال گردش ✅" : body.status === "crashed" ? "به خورشید برخورد کرد 💥" : "از منظومه فرار کرد 🚀"}
          </li>
        </ul>
        {onRemoveCustom && (
          <button onClick={() => onRemoveCustom(body.id)} className="big-btn bg-rose-500 text-white w-full mt-3 text-base">
            🗑 حذف این سیاره
          </button>
        )}
      </Card>
    );
  }

  const p = planetById(id);
  return (
    <Card onClose={onClose} color={p.color}>
      <div className="text-5xl text-center animate-float">{p.emoji}</div>
      <h3 className="text-2xl font-black text-center">{p.name}</h3>
      <p className="text-center text-white/80">«{p.nickname}»</p>
      <div className="grid grid-cols-1 gap-2 mt-3 text-sm">
        <Info icon="🔢" label="ترتیب از خورشید" value={`سیاره‌ی ${ORDINALS[p.order - 1]}`} />
        <Info icon="📏" label="فاصله تقریبی از خورشید" value={`${fa(p.distanceMkm, 1)} میلیون کیلومتر`} />
        <Info icon="🔁" label="یک دور کامل به دور خورشید" value={formatPeriod(p.periodDays)} />
        <Info icon="🌙" label="تعداد ماه‌ها" value={p.moons === 0 ? "ندارد" : fa(p.moons)} />
        <Info icon="🕐" label="طول یک شبانه‌روز" value={p.dayHours < 100 ? `${fa(p.dayHours, 1)} ساعت` : `${fa(Math.round(p.dayHours / 24))} روز زمینی`} />
      </div>
      <p className="mt-3 text-sm bg-white/10 rounded-xl p-2 leading-6">💡 {p.fact}</p>
      {body && body.kind === "kepler" && body.orbitR !== body.baseOrbitR && (
        <p className="mt-2 text-xs text-amber-200 bg-amber-500/10 rounded-xl p-2">
          🧪 در آزمایش، فاصله‌ی این سیاره تغییر کرده و اکنون یک دورش حدود {formatPeriod(body.period)} طول می‌کشد.
        </p>
      )}
      {id === "earth" && (
        <div className="flex gap-2 mt-3">
          <button onClick={onDayNight} className="big-btn flex-1 bg-indigo-500 hover:bg-indigo-400 text-white text-base">
            🌍 شب و روز
          </button>
          <button onClick={onSeasons} className="big-btn flex-1 bg-emerald-500 hover:bg-emerald-400 text-white text-base">
            🍂 فصل‌ها
          </button>
        </div>
      )}
    </Card>
  );
}

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
      <span className="text-white/80">
        {icon} {label}
      </span>
      <span className="font-black text-white">{value}</span>
    </div>
  );
}

function Card({ children, onClose, color }: { children: React.ReactNode; onClose: () => void; color: string }) {
  return (
    <div
      className="glass rounded-3xl p-4 w-[300px] max-w-[92vw] animate-pop relative max-h-[80vh] overflow-y-auto scrollbar-thin"
      style={{ borderColor: color, boxShadow: `0 0 30px ${color}55` }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 left-2 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-lg font-bold"
        aria-label="بستن"
      >
        ✕
      </button>
      {children}
    </div>
  );
}
