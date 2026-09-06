import { useState } from "react";
import { useLab } from "../store";
import { Card, Btn } from "./ui";
import { DISCOVERIES } from "../missions";
import { fmt, OUTCOME_INFO } from "../data";

const TEMPLATES = ["این جسم شناور شد چون...", "این جسم فرو رفت چون...", "فکر می‌کنم دلیلش این بود که...", "امروز فهمیدم که..."];

export function Notebook() {
  const { state, dispatch, award } = useLab();
  const [text, setText] = useState("");
  const [confirm, setConfirm] = useState(false);

  const guessed = state.results.filter((r) => r.guess);
  const correct = guessed.filter((r) => r.guess === r.actual).length;
  const found = DISCOVERIES.filter((d) => d.check(state));

  const save = () => {
    const t = text.trim();
    if (!t) return;
    dispatch({ type: "note", text: t });
    setText("");
    if (state.notebook.filter((n) => !n.auto).length === 0) award(1, "اولین یادداشت علمی‌ات را نوشتی! ✍️");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-7 space-y-4">
        <Card title="جدول نتایج: چه چیزی شناور می‌شود؟" emoji="📊">
          {state.results.length === 0 ? (
            <div className="text-sm text-slate-500">هنوز آزمایشی انجام نشده. به آزمایشگاه برو و چند جسم در آب بینداز!</div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-sky-100">
                <table className="w-full text-sm">
                  <thead className="bg-sky-50 text-sky-900">
                    <tr>
                      <th className="p-2 text-right">جسم</th>
                      <th className="p-2">چگالی</th>
                      <th className="p-2">حدس من</th>
                      <th className="p-2">نتیجه واقعی</th>
                      <th className="p-2">✓</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...state.results].reverse().map((r) => (
                      <tr key={r.id} className="border-t border-sky-50">
                        <td className="p-2 font-bold">{r.emoji} {r.name}</td>
                        <td className="p-2 text-center">{fmt(r.density, 2)}</td>
                        <td className="p-2 text-center">{r.guess ? `${OUTCOME_INFO[r.guess].emoji} ${OUTCOME_INFO[r.guess].label}` : "—"}</td>
                        <td className="p-2 text-center">{OUTCOME_INFO[r.actual].emoji} {OUTCOME_INFO[r.actual].label}</td>
                        <td className="p-2 text-center">{r.guess ? (r.guess === r.actual ? "⭐" : "❌") : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 font-bold text-amber-900">
                  پیش‌بینی‌های درست: {fmt(correct, 0)} از {fmt(guessed.length, 0)}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 font-bold text-green-900">🟢 شناور: {fmt(state.results.filter((r) => r.actual === "float").length, 0)}</div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 font-bold text-blue-900">🔵 معلق: {fmt(state.results.filter((r) => r.actual === "suspend").length, 0)}</div>
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 font-bold text-red-900">🔴 فرو رفته: {fmt(state.results.filter((r) => r.actual === "sink").length, 0)}</div>
              </div>
            </>
          )}
        </Card>

        <Card title="یادداشت‌های من" emoji="✍️">
          <div className="flex flex-wrap gap-1 mb-2">
            {TEMPLATES.map((t) => (
              <button key={t} onClick={() => setText(t + " ")} className="text-xs bg-violet-50 border border-violet-200 text-violet-800 rounded-xl px-2 py-1 hover:bg-violet-100">{t}</button>
            ))}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="اینجا بنویس چه چیزی کشف کردی..." className="w-full rounded-2xl border-2 border-sky-100 p-3 text-sm focus:outline-none focus:border-sky-400" />
          <div className="flex justify-end mt-2">
            <Btn color="violet" size="sm" onClick={save} disabled={!text.trim()}>ثبت در دفترچه 📒</Btn>
          </div>
          <div className="mt-3 space-y-1 max-h-72 overflow-y-auto pr-1">
            {[...state.notebook].reverse().map((n) => (
              <div key={n.id} className={`flex items-start gap-2 rounded-xl p-2 text-sm ${n.auto ? "bg-slate-50 text-slate-600" : "bg-violet-50 text-violet-900 font-bold"}`}>
                <span>{n.auto ? "🔬" : "✍️"}</span>
                <span className="flex-1 leading-6">{n.text}</span>
                <button onClick={() => dispatch({ type: "deleteNote", id: n.id })} className="text-slate-300 hover:text-rose-500 text-xs">✕</button>
              </div>
            ))}
            {state.notebook.length === 0 && <div className="text-sm text-slate-400">دفترچه خالی است.</div>}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <Card title="چیزهایی که کشف کردم" emoji="💡">
          <div className="text-xs text-slate-500 mb-2">دفترچه با توجه به آزمایش‌هایت، این نکته‌ها را جمع‌بندی کرده است:</div>
          <div className="space-y-2">
            {DISCOVERIES.map((d) => {
              const ok = found.includes(d);
              return (
                <div key={d.id} className={`rounded-2xl p-3 text-sm flex gap-2 border-2 ${ok ? "bg-amber-50 border-amber-200 text-slate-800" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                  <span className="text-xl">{ok ? d.emoji : "🔒"}</span>
                  <span className="leading-6">{ok ? d.text : "هنوز کشف نشده... آزمایش کن!"}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-center text-sm font-black text-sky-900 bg-sky-50 rounded-2xl p-3">
            {fmt(found.length, 0)} از {fmt(DISCOVERIES.length, 0)} رابطه علمی را کشف کردی!
          </div>
        </Card>

        <Card title="جمله‌ی دانشمند کوچک" emoji="🧑‍🔬">
          <div className="text-sm leading-7 text-slate-700 bg-gradient-to-l from-violet-50 to-sky-50 rounded-2xl p-3 border border-violet-100 font-bold text-center">
            «برای فهمیدن علم، فقط جواب را حفظ نمی‌کنیم؛ آزمایش می‌کنیم و خودمان کشفش می‌کنیم.»
          </div>
          <div className="mt-3 text-center">
            {!confirm ? (
              <button onClick={() => setConfirm(true)} className="text-xs text-slate-400 underline">شروع دوباره (پاک کردن همه چیز)</button>
            ) : (
              <div className="flex gap-2 justify-center">
                <Btn size="sm" color="rose" onClick={() => { dispatch({ type: "reset" }); setConfirm(false); }}>بله، پاک کن</Btn>
                <Btn size="sm" color="slate" onClick={() => setConfirm(false)}>نه</Btn>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
