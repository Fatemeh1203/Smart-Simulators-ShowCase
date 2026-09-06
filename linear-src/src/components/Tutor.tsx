import { useMemo, useState } from "react";
import { tutorReplies } from "../data";
import { Btn, I, Icon } from "./UI";

export function Tutor() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<{ from: "bot" | "me"; t: string }[]>([
    {
      from: "bot",
      t: "من دستیار خط و معادله هستم. جواب را فوری نمی‌گویم؛ کمکت می‌کنم خودت کشف کنی. بپرس شیب یعنی چه؟",
    },
  ]);
  const [hints, setHints] = useState(0);

  const reply = (q: string) => {
    const hit = tutorReplies.find((r) => r.keys.some((k) => q.includes(k)));
    if (hit) return hit.reply;
    return "بیا مسئله را کوچک کنیم: نقطه کجاست؟ خط صعودی است یا نزولی؟ معادله چه می‌گوید؟ اگر خواستی بگو «راهنمایی» تا قدم‌به‌قدم جلو برویم.";
  };

  const hintPack = useMemo(
    () => [
      "راهنمایی ۱: از چپ به راست به خط نگاه کن. بالا می‌رود یا پایین؟",
      "راهنمایی ۲: Δy را روی مثلث شیب ببین؛ بعد بر Δx تقسیم کن.",
      "راهنمایی ۳: اگر Δx صفر باشد شیب تعریف نشده است.",
      "راه‌حل کامل: m = (y₂ − y₁) / (x₂ − x₁). سپس y = mx + b و با یک نقطه b را پیدا کن.",
    ],
    []
  );

  const send = (q: string) => {
    const query = q.trim();
    if (!query) return;
    if (query.includes("راهنمایی") || query.includes("جواب")) {
      const h = Math.min(hints, hintPack.length - 1);
      setMsgs((m) => [...m, { from: "me", t: query }, { from: "bot", t: hintPack[h] }]);
      setHints((x) => Math.min(hintPack.length, x + 1));
      setText("");
      return;
    }
    setMsgs((m) => [...m, { from: "me", t: query }, { from: "bot", t: reply(query) }]);
    setText("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="focus-ring fixed bottom-20 left-4 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-xl shadow-indigo-500/30 md:bottom-6"
        aria-label="دستیار خط و معادله"
      >
        <Icon d={I.bot} />
      </button>
      {open && (
        <div className="fixed bottom-24 left-4 z-50 w-[min(92vw,380px)] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--bg-solid)] shadow-2xl md:bottom-24">
          <div className="flex items-center justify-between bg-gradient-to-l from-indigo-600 to-cyan-500 px-4 py-3 text-white">
            <div>
              <div className="text-sm font-bold">دستیار خط و معادله</div>
              <div className="text-[11px] text-white/80">راهنمایی مرحله‌ای، نه جواب فوری</div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-xl p-1 hover:bg-white/15" aria-label="بستن">
              <Icon d={I.close} />
            </button>
          </div>
          <div className="max-h-72 space-y-2 overflow-auto p-3 text-sm">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] rounded-2xl px-3 py-2 leading-7 ${
                  m.from === "bot" ? "bg-[var(--bg-soft)]" : "mr-auto bg-indigo-500/15"
                }`}
              >
                {m.t}
              </div>
            ))}
          </div>
          <div className="flex gap-1 p-2">
            {["شیب یعنی چه؟", "راهنمایی ۱"].map((c) => (
              <button key={c} onClick={() => send(c)} className="rounded-full bg-[var(--bg-soft)] px-2 py-1 text-[11px]">
                {c}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-[var(--line)] p-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="سؤال بپرس..."
              className="focus-ring flex-1 rounded-2xl bg-[var(--bg-soft)] px-3 py-2 text-sm outline-none"
            />
            <Btn type="submit" className="!px-3">
              <Icon d={I.send} className="h-4 w-4" />
            </Btn>
          </form>
        </div>
      )}
    </>
  );
}
