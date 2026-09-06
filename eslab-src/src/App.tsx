import { useState } from "react";
import { Atom, Moon, Sun, Menu, X, FlaskConical, Sparkles, Ruler, GraduationCap, RotateCcw, Lock, Activity } from "lucide-react";
import { StoreProvider, useStore, Mode } from "./store";
import { experiments, byId } from "./experiments";
import { Pedagogy } from "./components/Pedagogy";
import { Discovery } from "./modes/Discovery";
import { DataLogger, ToolBar, ToolsHelp } from "./modes/Measurement";
import { Teacher } from "./modes/Teacher";
import { cn } from "./utils/cn";

const modes: { id: Mode; label: string; Icon: typeof FlaskConical }[] = [
  { id: "lab", label: "آزمایشگاه", Icon: FlaskConical },
  { id: "discovery", label: "خودت کشف کن", Icon: Sparkles },
  { id: "measure", label: "اندازه‌گیری", Icon: Ruler },
  { id: "teacher", label: "معلم", Icon: GraduationCap },
];

function Shell() {
  const { theme, toggleTheme, mode, setMode, expId, setExpId, reset, locks, stage, question } = useStore();
  const [nav, setNav] = useState(false);
  const meta = byId(expId);
  const Comp = meta.Component;
  const lockedCount = Object.entries(locks).filter(([k, v]) => v && k.startsWith(expId + ".")).length;
  const stageNames = ["پیش‌بینی", "آزمایش", "تحلیل", "نتیجه‌گیری"];

  return (
    <div className="flex min-h-screen flex-col">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-cyan-400/10 dark:bg-[#070b14]/80">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-3 py-2">
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setNav(v => !v)}>{nav ? <X size={18} /> : <Menu size={18} />}</button>
          <div className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30">
              <Atom size={20} />
              <span className="pulse-ring absolute inset-0 rounded-xl border-2 border-cyan-400/60" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold">آزمایشگاه مجازی الکتریسیتهٔ ساکن</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">فیزیک یازدهم · فصل اول · Modern Physics Lab</div>
            </div>
          </div>

          {/* experiment status */}
          {mode === "lab" && (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-sm font-bold">{meta.icon} {meta.title}</span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300"><Activity size={10} /> در حال اجرا · Real-Time</span>
              <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">مرحله {stage + 1}: {stageNames[stage]}</span>
              {lockedCount > 0 && <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600"><Lock size={10} /> {lockedCount} پارامتر قفل</span>}
              {question.text && <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-300">سؤال معلم فعال</span>}
            </div>
          )}

          <div className="mr-auto flex items-center gap-1">
            <nav className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
              {modes.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)} className={cn("flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-all sm:px-3", mode === m.id ? "bg-white text-cyan-700 shadow dark:bg-slate-700 dark:text-cyan-300" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white")}>
                  <m.Icon size={13} /> <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </nav>
            <button onClick={reset} title="Reset آزمایش" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><RotateCcw size={16} /></button>
            <button onClick={toggleTheme} title="تغییر تم" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
          </div>
        </div>
        {/* tools row */}
        {(mode === "lab" || mode === "measure") && (
          <div className="mx-auto flex max-w-[1600px] items-center gap-2 overflow-x-auto px-3 pb-2">
            <span className="shrink-0 text-[11px] font-bold text-slate-500">ابزارها:</span>
            <ToolBar />
          </div>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-3 p-3">
        {/* ===== Sidebar ===== */}
        {(mode === "lab" || mode === "measure") && (
          <>
            {nav && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setNav(false)} />}
            <aside className={cn("fixed inset-y-0 right-0 z-20 w-72 overflow-y-auto bg-white p-3 pt-16 shadow-2xl transition-transform dark:bg-[#0a1020] lg:static lg:z-0 lg:block lg:w-64 lg:shrink-0 lg:rounded-2xl lg:p-0 lg:pt-0 lg:shadow-none lg:bg-transparent lg:dark:bg-transparent", nav ? "translate-x-0" : "translate-x-full lg:translate-x-0")}>
              <div className="glass rounded-2xl p-2">
                <div className="px-2 py-1.5 text-[11px] font-bold text-slate-500">آزمایش‌ها</div>
                {experiments.map((e, i) => (
                  <button key={e.id} onClick={() => { setExpId(e.id); setNav(false); if (mode !== "lab") setMode("lab"); }} className={cn("mb-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-right text-xs transition-all", expId === e.id ? "bg-gradient-to-l from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20" : "hover:bg-slate-100 dark:hover:bg-slate-800/70")}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 text-base">{e.icon}</span>
                    <span className="flex-1 leading-tight"><span className="block font-bold">{i + 1}. {e.title}</span><span className={cn("block text-[10px]", expId === e.id ? "text-cyan-100" : "text-slate-500")}>{e.subtitle}</span></span>
                  </button>
                ))}
              </div>
            </aside>
          </>
        )}

        {/* ===== Main ===== */}
        <main className="min-w-0 flex-1 space-y-3">
          {mode === "lab" && (
            <>
              <div className="flex items-center justify-between md:hidden">
                <span className="text-sm font-bold">{meta.icon} {meta.title}</span>
                <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">مرحله {stage + 1}: {stageNames[stage]}</span>
              </div>
              <div key={expId}><Comp /></div>
              <Pedagogy meta={meta} />
            </>
          )}
          {mode === "discovery" && <Discovery />}
          {mode === "measure" && (
            <>
              <ToolsHelp />
              <div key={expId + "m"}><Comp /></div>
              <DataLogger />
            </>
          )}
          {mode === "teacher" && <Teacher />}
        </main>
      </div>

      <footer className="border-t border-slate-200/70 py-3 text-center text-[11px] text-slate-500 dark:border-slate-800">
        همهٔ کمیت‌ها از روابط فیزیکی واقعی (قانون کولن، برهم‌نهی، C = ε₀A/d و …) با ثابت‌های SI محاسبه می‌شوند · k = 8.99×10⁹ N·m²/C² · e = 1.602×10⁻¹⁹ C · ε₀ = 8.85×10⁻¹² F/m
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
