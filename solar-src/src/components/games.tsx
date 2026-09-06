import { useEffect, useState } from "react";
import { fa, formatPeriod, planetById } from "../data/planets";
import type { Simulation } from "../sim/Simulation";
import GuessBox from "./GuessBox";
import PlanetPicker from "./PlanetPicker";
import { PanelTitle } from "./panels";
import { cn } from "../utils/cn";

/* ---------------- بازی: سیاره را پیدا کن ---------------- */
export interface FindQuestion {
  id: string;
  q: string;
  answer: string;
  hint: string;
  mission?: string;
}

export const FIND_QUESTIONS: FindQuestion[] = [
  { id: "third", q: "سیاره‌ی سوم از خورشید را پیدا کن.", answer: "earth", hint: "از خورشید بشمار: عطارد یک، زهره دو، ... سومی کدام است؟", mission: "m1" },
  { id: "rings", q: "کدام سیاره حلقه‌های معروف دارد؟", answer: "saturn", hint: "دنبال سیاره‌ای بگرد که دورش یک حلقه‌ی زیبا کشیده شده.", mission: "m2" },
  { id: "red", q: "سیاره‌ی سرخ را پیدا کن.", answer: "mars", hint: "این سیاره چهارمی است و رنگش مثل زنگ آهن قرمز است." },
  { id: "biggest", q: "بزرگ‌ترین سیاره را پیدا کن.", answer: "jupiter", hint: "به اندازه‌ی سیاره‌ها نگاه کن. کدام از همه بزرگ‌تر است؟" },
  { id: "closest", q: "نزدیک‌ترین سیاره به خورشید کدام است؟", answer: "mercury", hint: "کوچک‌ترین مدار مال کدام سیاره است؟" },
  { id: "farthest", q: "دورترین سیاره از خورشید را پیدا کن.", answer: "neptune", hint: "بزرگ‌ترین مدار، یعنی دورترین سیاره. رنگش آبی پررنگ است." },
  { id: "hottest", q: "داغ‌ترین سیاره را پیدا کن.", answer: "venus", hint: "سیاره‌ی دوم از خورشید، با ابرهای ضخیم زردرنگ." },
  { id: "sideways", q: "کدام سیاره به پهلو خوابیده می‌چرخد؟", answer: "uranus", hint: "سیاره‌ی هفتم، با رنگ آبیِ روشن (فیروزه‌ای)." },
  { id: "home", q: "خانه‌ی ما کدام سیاره است؟", answer: "earth", hint: "سیاره‌ی آبی و سبز که ما روی آن زندگی می‌کنیم!" },
  { id: "fifth", q: "سیاره‌ی پنجم از خورشید را پیدا کن.", answer: "jupiter", hint: "بعد از مریخ، سیاره‌ی بعدی یک غول بزرگ است." },
];

export function FindGamePanel({
  clickedId,
  clickNonce,
  score,
  onScore,
  onMission,
}: {
  clickedId: string | null;
  clickNonce: number;
  score: number;
  onScore: (delta: number) => void;
  onMission: (m: string) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [done, setDone] = useState(false);
  const [lastNonce, setLastNonce] = useState(clickNonce);
  const q = FIND_QUESTIONS[idx];

  useEffect(() => {
    if (clickNonce === lastNonce) return;
    setLastNonce(clickNonce);
    if (!clickedId || done || clickedId === "sun" || clickedId.startsWith("custom")) return;
    if (clickedId === q.answer) {
      setFeedback({ ok: true, text: `⭐ +۱۰ امتیاز! آفرین، ${planetById(clickedId).name} درست است.` });
      onScore(10);
      if (q.mission) onMission(q.mission);
      setDone(true);
    } else {
      setFeedback({ ok: false, text: `❌ ${planetById(clickedId).name} نبود. راهنمایی: ${q.hint}` });
    }
  }, [clickNonce, lastNonce, clickedId, done, q, onScore, onMission]);

  const next = () => {
    setIdx((i) => (i + 1) % FIND_QUESTIONS.length);
    setFeedback(null);
    setDone(false);
  };

  return (
    <div>
      <PanelTitle sub="سؤال را بخوان و روی سیاره‌ی درست در آسمان کلیک کن!">🔍 بازی: سیاره را پیدا کن</PanelTitle>
      <div className="flex items-center justify-between mb-3">
        <div className="bg-yellow-400 text-yellow-950 rounded-2xl px-3 py-1.5 font-black text-lg">⭐ {fa(score)} امتیاز</div>
        <div className="text-sm text-white/70">
          سؤال {fa(idx + 1)} از {fa(FIND_QUESTIONS.length)}
        </div>
      </div>
      <div className="bg-gradient-to-l from-violet-600/40 to-indigo-600/40 border border-violet-300/30 rounded-2xl p-4 text-lg font-black leading-8 text-center animate-pop" key={q.id}>
        ❓ {q.q}
      </div>
      {feedback && (
        <div className={cn("mt-3 rounded-2xl p-3 font-bold leading-7 animate-pop", feedback.ok ? "bg-green-500/30 border border-green-300/50" : "bg-rose-500/25 border border-rose-300/40")}>
          {feedback.text}
        </div>
      )}
      <div className="flex gap-2 mt-3">
        <button onClick={next} className={cn("big-btn flex-1", done ? "bg-green-500 text-white" : "bg-white/10 hover:bg-white/20")}>
          {done ? "➡️ سؤال بعدی" : "⏭ رد کردن"}
        </button>
      </div>
      <div className="mt-4 text-sm bg-white/10 rounded-2xl p-3 leading-7">
        💡 ترتیب سیاره‌ها از خورشید:
        <br />
        عطارد ← زهره ← زمین ← مریخ ← مشتری ← زحل ← اورانوس ← نپتون
      </div>
    </div>
  );
}

/* ---------------- مسابقه دور خورشید ---------------- */
export function RacePanel({
  sim,
  tick,
  onRaceIds,
  onSetMultiplier,
  onEnsurePlaying,
}: {
  sim: Simulation;
  tick: number;
  onRaceIds: (ids: string[] | null) => void;
  onSetMultiplier: (m: number) => void;
  onEnsurePlaying: () => void;
}) {
  void tick;
  const [a, setA] = useState("earth");
  const [b, setB] = useState("mars");
  const [guess, setGuess] = useState<string | null>(null);
  const [racing, setRacing] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(0);

  const ba = sim.get(a)!;
  const bb = sim.get(b)!;
  const fasterId = planetById(a).periodDays < planetById(b).periodDays ? a : b;

  useEffect(() => {
    if (!racing || winner) return;
    if (ba.laps >= 1 || bb.laps >= 1) {
      setWinner(ba.laps >= 1 ? a : b);
    }
  }, [tick, racing, winner, ba.laps, bb.laps, a, b]);

  useEffect(() => () => onRaceIds(null), [onRaceIds]);

  const start = () => {
    sim.lineUp([a, b]);
    setStartTime(sim.time);
    setWinner(null);
    setRacing(true);
    onRaceIds([a, b]);
    const maxP = Math.max(planetById(a).periodDays, planetById(b).periodDays);
    onSetMultiplier(maxP > 3000 ? 10 : maxP > 600 ? 5 : 2);
    onEnsurePlaying();
  };

  const stop = () => {
    setRacing(false);
    setWinner(null);
    setGuess(null);
    onRaceIds(null);
  };

  const prog = (x: typeof ba) => Math.min(100, ((x.travelled % (Math.PI * 2)) / (Math.PI * 2)) * 100 + (x.laps >= 1 ? 100 : 0));

  return (
    <div>
      <PanelTitle sub="دو سیاره انتخاب کن و ببین کدام زودتر یک دور کامل می‌زند!">🏁 مسابقه دور خورشید</PanelTitle>
      <div className="space-y-3 text-sm">
        {!racing && (
          <>
            <div>
              <div className="font-bold mb-1">🥇 سیاره‌ی اول:</div>
              <PlanetPicker value={a} onChange={(id) => { setA(id); setGuess(null); }} exclude={[b]} small />
            </div>
            <div>
              <div className="font-bold mb-1">🥈 سیاره‌ی دوم:</div>
              <PlanetPicker value={b} onChange={(id) => { setB(id); setGuess(null); }} exclude={[a]} small />
            </div>
            <GuessBox
              question="کدام سیاره یک دور کامل را زودتر تمام می‌کند؟"
              options={[
                { id: a, emoji: planetById(a).emoji, label: planetById(a).name },
                { id: b, emoji: planetById(b).emoji, label: planetById(b).name },
              ]}
              correctId={fasterId}
              chosen={guess}
              revealed={false}
              onChoose={setGuess}
            />
            <button onClick={start} className="big-btn w-full text-xl bg-gradient-to-l from-green-500 to-emerald-600 text-white shadow-xl">
              🏁 شروع مسابقه
            </button>
          </>
        )}
        {racing && (
          <>
            {[ba, bb].map((x) => (
              <div key={x.id} className="bg-white/10 rounded-2xl p-3">
                <div className="flex justify-between font-bold mb-1">
                  <span>
                    {planetById(x.id).emoji} {x.name}
                  </span>
                  <span>{fa(Math.min(100, prog(x)))}٪</span>
                </div>
                <div className="h-5 bg-black/30 rounded-full overflow-hidden relative">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, prog(x))}%`, background: x.color }} />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{x.laps >= 1 ? "🏁 رسید!" : ""}</span>
                </div>
              </div>
            ))}
            <div className="text-xs text-white/70 text-center">⏱ زمان گذشته: {fa(Math.floor(sim.time - startTime))} روز</div>
            {winner && (
              <div className="bg-yellow-400/20 border border-yellow-300/50 rounded-2xl p-3 animate-pop space-y-2">
                <div className="text-xl font-black text-center">🏆 برنده: {planetById(winner).name}!</div>
                <div className="text-sm leading-7">
                  {planetById(winner).name} فقط {formatPeriod(planetById(winner).periodDays)} برای یک دور نیاز دارد، اما {planetById(winner === a ? b : a).name}{" "}
                  {formatPeriod(planetById(winner === a ? b : a).periodDays)}!
                </div>
                {guess && <div className="font-bold">{guess === winner ? "🎉 حدست درست بود!" : "😊 حدست درست نبود، ولی حالا می‌دانی!"}</div>}
                <div className="bg-white/10 rounded-xl p-2 text-sm">💡 «هر سیاره زمان متفاوتی برای یک دور کامل به دور خورشید نیاز دارد.»</div>
              </div>
            )}
            <button onClick={stop} className="big-btn w-full bg-white/15 hover:bg-white/25">
              🔄 مسابقه‌ی جدید
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- مأموریت‌ها ---------------- */
export const MISSIONS = [
  { id: "m1", title: "سیاره‌ی سوم از خورشید را پیدا کن.", emoji: "🌍", mode: "find" },
  { id: "m2", title: "سیاره‌ای که حلقه دارد پیدا کن.", emoji: "💍", mode: "find" },
  { id: "m3", title: "زمین را انتخاب کن و یک سال آن را مشاهده کن.", emoji: "📅", mode: "free" },
  { id: "m4", title: "یک سیاره بساز و آن را وارد مدار کن.", emoji: "🪐", mode: "build" },
  { id: "m5", title: "شب و روز را روی زمین پیدا کن.", emoji: "🌗", mode: "daynight" },
  { id: "m6", title: "فصل‌های زمین را مشاهده کن.", emoji: "🍂", mode: "seasons" },
];

export function MissionsPanel({ done, onGo, score, onResetAll }: { done: Record<string, boolean>; onGo: (mode: string) => void; score: number; onResetAll: () => void }) {
  const count = MISSIONS.filter((m) => done[m.id]).length;
  const all = count === MISSIONS.length;
  return (
    <div>
      <PanelTitle sub="مأموریت‌ها را انجام بده و ستاره جمع کن!">🏆 مأموریت فضایی</PanelTitle>
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl">
          {MISSIONS.map((m) => (
            <span key={m.id} className={done[m.id] ? "" : "opacity-25 grayscale"}>
              ⭐
            </span>
          ))}
        </div>
        <div className="bg-yellow-400 text-yellow-950 rounded-2xl px-3 py-1 font-black">⭐ {fa(score)}</div>
      </div>
      {all && (
        <div className="bg-gradient-to-l from-yellow-400/30 to-pink-500/30 border border-yellow-300/60 rounded-2xl p-4 text-center animate-pop mb-3">
          <div className="text-5xl animate-float">🏅</div>
          <div className="text-xl font-black">نشان «فضانورد کوچک»</div>
          <div className="text-sm">همه‌ی مأموریت‌ها را کامل کردی! آفرین!</div>
        </div>
      )}
      <ol className="space-y-2">
        {MISSIONS.map((m, i) => (
          <li key={m.id} className={cn("rounded-2xl p-3 border flex items-center gap-3", done[m.id] ? "bg-green-500/20 border-green-300/40" : "bg-white/10 border-white/10")}>
            <div className="text-3xl">{done[m.id] ? "⭐" : m.emoji}</div>
            <div className="flex-1">
              <div className="text-xs text-white/60">مأموریت {fa(i + 1)}</div>
              <div className="font-bold text-sm leading-6">{m.title}</div>
            </div>
            {done[m.id] ? (
              <span className="text-green-300 font-black">✅</span>
            ) : (
              <button onClick={() => onGo(m.mode)} className="big-btn text-sm py-2 px-3 bg-sky-500 hover:bg-sky-400 text-white">
                برو
              </button>
            )}
          </li>
        ))}
      </ol>
      <button onClick={onResetAll} className="mt-4 text-xs text-white/50 hover:text-white/80 underline">
        پاک کردن پیشرفت
      </button>
    </div>
  );
}
