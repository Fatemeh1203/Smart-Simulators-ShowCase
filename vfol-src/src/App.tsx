import { useMemo, useState } from "react";
import { Sun, Moon, Languages, Home, FlaskConical, GraduationCap, Microscope, Boxes, BookOpen, Search, Menu, X, ChevronRight, Sparkles, Download, Trash2 } from "lucide-react";
import { StoreProvider, useStore, download, toCSV, type Level, type Mode, type Goal } from "./lib/store";
import { experiments, byId } from "./experiments";
import { ExperimentShell } from "./components/ExperimentShell";
import { FreeLab, defaultChain, type Block } from "./modes/FreeLab";
import { Instructor, SCENARIOS } from "./modes/Instructor";
import { Research } from "./modes/Research";
import { Fiber3D } from "./components/Fiber3D";
import { Panel, Button, Badge, Segmented, Callout } from "./components/ui";
import { cn } from "./utils/cn";

const LEVEL_TOPICS: Record<Level, { en: string[]; fa: string[] }> = {
  1: { en: ["Fiber structure", "Core & cladding", "Refractive index", "TIR & critical angle", "NA & acceptance angle", "Single/multimode", "Attenuation", "Dispersion", "Optical power & wavelength", "Sources & detectors", "Power meter", "OTDR basics"], fa: ["ساختار فیبر", "هسته و روکش", "ضریب شکست", "بازتاب کلی و زاویه بحرانی", "NA و زاویه پذیرش", "تک‌مود/چندمود", "تضعیف", "پاشندگی", "توان و طول موج", "منبع و آشکارساز", "توان‌سنج", "OTDR مقدماتی"] },
  2: { en: ["Wave propagation & modes", "MFD, V-number, cutoff", "Chromatic & modal dispersion", "Polarization & PMD", "Bending/splice/connector loss", "Fresnel reflection", "Link & rise-time budget", "WDM", "EDFA", "Receivers, BER, eye diagram"], fa: ["انتشار موج و مودها", "MFD، عدد V، قطع", "پاشندگی رنگی و مودی", "قطبش و PMD", "تلفات خمش/اسپلایس/کانکتور", "بازتاب فرنل", "بودجه لینک و زمان خیز", "WDM", "EDFA", "گیرنده‌ها، BER، نمودار چشمی"] },
  3: { en: ["Maxwell & wave equation", "Eigenmodes, LP & full-vector", "n_eff, group velocity, GVD", "Kerr, SPM, XPM, FWM", "SRS, SBS", "Solitons & NLSE", "Coherent communication", "Dispersion compensation", "FBG & distributed sensing", "Rayleigh/Raman/Brillouin", "Advanced WDM"], fa: ["ماکسول و معادله موج", "ویژه‌مودها، LP و تمام‌برداری", "n_eff، سرعت گروه، GVD", "کر، SPM، XPM، FWM", "SRS، SBS", "سالیتون و NLSE", "مخابرات همدوس", "جبران پاشندگی", "FBG و حسگری توزیعی", "رایلی/رامان/بریلوئن", "WDM پیشرفته"] },
};

function Onboarding() {
  const { t, lang, setLang, theme, setTheme, level, setLevel, setMode, setGoal, guided, setGuided, setOnboarded, setView } = useStore();
  const [goalL, setGoalL] = useState<Goal>("learn");
  const [lvl, setLvl] = useState<Level>(level);
  const [exp, setExp] = useState<string>("snell");
  const enter = () => {
    setLevel(lvl); setGoal(goalL);
    const mode: Mode = goalL === "teach" ? "instructor" : goalL === "research" ? "research" : guided ? "student" : "free";
    setMode(mode); setOnboarded(true);
    setView(mode === "student" ? `exp:${exp}` : mode === "instructor" ? "instructor" : mode === "research" ? "research" : "free");
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="panel max-w-4xl w-full p-6 md:p-10 relative overflow-hidden fade-up">
        <div className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-gradient-to-br from-brand-500/20 to-violet-500/20 blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-6 relative">
          <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white shadow-lg"><FlaskConical size={22} /></div><div><div className="font-black text-lg tracking-tight">{t("appName")}</div><div className="text-xs muted">{t("tagline")}</div></div></div>
          <div className="flex gap-1.5"><Button size="sm" variant="outline" onClick={() => setLang(lang === "fa" ? "en" : "fa")}><Languages size={13} />{t("language")}</Button><Button size="sm" variant="outline" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}</Button></div>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">{t("welcome")}</h1>
        <p className="text-sm muted mb-6 max-w-2xl">{t("onboardIntro")}</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-semibold mb-2">1 · {t("qLevel")}</div>
            <div className="space-y-2">{([1, 2, 3] as Level[]).map((l) => <button key={l} onClick={() => setLvl(l)} className={cn("w-full text-start panel-2 p-3 transition border-2", lvl === l ? "border-brand-500 bg-brand-500/5" : "border-transparent hover:border-line")}><div className="text-sm font-semibold">{t(`level${l}` as "level1")}</div><div className="text-[11px] muted">{t(`level${l}d` as "level1d")}</div></button>)}</div>
          </div>
          <div className="space-y-5">
            <div><div className="text-sm font-semibold mb-2">2 · {t("qGoal")}</div><div className="grid grid-cols-2 gap-2">{(["learn", "experiment", "teach", "research"] as Goal[]).map((g) => <button key={g} onClick={() => setGoalL(g)} className={cn("panel-2 p-3 text-sm font-medium border-2 transition", goalL === g ? "border-brand-500 bg-brand-500/5" : "border-transparent hover:border-line")}>{t(g === "learn" ? "goalLearn" : g === "experiment" ? "goalExperiment" : g === "teach" ? "goalTeach" : "goalResearch")}</button>)}</div></div>
            <div><div className="text-sm font-semibold mb-2">3 · {t("qMode")}</div><Segmented value={guided ? "g" : "f"} onChange={(v) => setGuided(v === "g")} options={[{ value: "g", label: t("guided") }, { value: "f", label: t("free") }]} /></div>
            {(goalL === "learn" || goalL === "experiment") && guided && <div><div className="text-sm font-semibold mb-2">4 · {t("experiments")}</div><select value={exp} onChange={(e) => setExp(e.target.value)} className="w-full panel-2 px-3 py-2 text-sm">{experiments.filter((e) => e.level <= lvl || lvl === 3).map((e) => <option key={e.id} value={e.id}>#{e.num} — {lang === "fa" ? e.title.fa : e.title.en}</option>)}</select></div>}
          </div>
        </div>
        <div className="mt-8 flex justify-end"><Button onClick={enter} className="px-6 py-3 text-sm"><Sparkles size={15} />{t("enterLab")}<ChevronRight size={15} className="rtl:rotate-180" /></Button></div>
      </div>
    </div>
  );
}

function HomeView() {
  const { t, lang, level, setView, setMode, setActiveAssignment, saveAssignment, assignments } = useStore();
  const openScenario = (code: string) => {
    const s = SCENARIOS.find((x) => x.code === code)!;
    const existing = assignments.find((a) => a.title === (lang === "fa" ? s.titleFa : s.title));
    const id = existing?.id ?? Math.random().toString(36).slice(2, 8);
    if (!existing) saveAssignment({ id, title: lang === "fa" ? s.titleFa : s.title, description: lang === "fa" ? s.descFa : s.description, timeLimit: s.timeLimit, hidden: lang === "fa" ? s.hiddenFa : s.hidden, constraints: s.constraints, disabled: s.disabled, fault: s.fault, createdAt: new Date().toISOString() });
    setActiveAssignment(id); setMode("free"); setView("free");
  };
  return (
    <div className="space-y-5">
      <div className="panel p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-24 -end-24 w-80 h-80 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-400/20 blur-3xl pointer-events-none" />
        <div className="grid md:grid-cols-2 gap-6 items-center relative">
          <div>
            <Badge tone="violet">{t(`level${level}` as "level1")}</Badge>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2">{t("appName")}</h1>
            <p className="text-sm muted mt-2 leading-relaxed">{lang === "fa" ? "۱۹ آزمایش تعاملی مبتنی بر فیزیک واقعی، میز نوری آزاد با تشخیص لحظه‌ای خطا، حالت استاد با نمره‌دهی خودکار و حالت پژوهش با جاروب پارامتر و برازش منحنی — از قانون اسنل تا حل عددی NLSE." : "19 interactive physics-based experiments, a free optical bench with real-time error detection, an instructor mode with auto-grading, and a research mode with parameter sweeps and curve fitting — from Snell's law to a numerical NLSE solver."}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={() => setView("exp:snell")}><FlaskConical size={14} />{t("quickStart")}</Button>
              <Button variant="outline" onClick={() => { setMode("free"); setView("free"); }}><Boxes size={14} />{t("freeLab")}</Button>
              <Button variant="outline" onClick={() => { setMode("research"); setView("research"); }}><Microscope size={14} />{t("research")}</Button>
            </div>
          </div>
          <Fiber3D t={12} height={200} />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {([1, 2, 3] as Level[]).map((l) => (
          <Panel key={l} title={t(`level${l}` as "level1")} icon={<BookOpen size={14} />} className={cn(level === l && "ring-2 ring-brand-500/40")}>
            <div className="flex flex-wrap gap-1">{LEVEL_TOPICS[l][lang].map((tp) => <span key={tp} className="text-[10px] px-2 py-0.5 rounded-full panel-2">{tp}</span>)}</div>
            <div className="mt-3 space-y-1">{experiments.filter((e) => e.level === l).map((e) => <button key={e.id} onClick={() => setView(`exp:${e.id}`)} className="w-full text-start text-xs px-2 py-1.5 rounded-lg hover:bg-brand-500/10 flex items-center gap-2"><span className="num text-brand-500 w-6">#{e.num}</span>{lang === "fa" ? e.title.fa : e.title.en}</button>)}</div>
          </Panel>
        ))}
      </div>
      <Panel title={t("realScenarios")} icon={<GraduationCap size={14} />}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">{SCENARIOS.map((s) => <button key={s.code} onClick={() => openScenario(s.code)} className="text-start panel-2 p-3 hover:border-brand-400 transition"><div className="flex items-center gap-2 text-xs font-semibold"><Badge>{s.code}</Badge><span className="line-clamp-1">{lang === "fa" ? s.titleFa : s.title}</span></div><div className="text-[10px] muted mt-1 line-clamp-2">{lang === "fa" ? s.descFa : s.description}</div></button>)}</div>
      </Panel>
    </div>
  );
}

function NotebookView() {
  const { t, lang, records, clearRecords, notes } = useStore();
  const groups = useMemo(() => { const m: Record<string, typeof records> = {}; records.forEach((r) => { (m[r.exp] ??= []).push(r); }); return m; }, [records]);
  return (
    <div className="space-y-4">
      <Panel title={t("notebook")} icon={<BookOpen size={14} />} right={<div className="flex gap-1.5"><Button size="sm" variant="outline" onClick={() => download("notebook.csv", toCSV(records), "text/csv")}><Download size={12} />{t("exportCSV")}</Button><Button size="sm" variant="outline" onClick={() => download("notebook.json", JSON.stringify({ records, notes }, null, 2), "application/json")}><Download size={12} />{t("exportJSON")}</Button><Button size="sm" variant="danger" onClick={() => clearRecords()}><Trash2 size={12} />{t("clear")}</Button></div>}>
        {Object.keys(groups).length === 0 ? <div className="text-xs muted py-8 text-center">{lang === "fa" ? "هنوز داده‌ای ثبت نشده است." : "No records yet."}</div> : Object.entries(groups).map(([id, rs]) => { const e = byId(id); return (
          <div key={id} className="mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold mb-1"><Badge>#{e?.num}</Badge>{e ? (lang === "fa" ? e.title.fa : e.title.en) : id}<span className="muted text-xs num">({rs.length})</span></div>
            <div className="overflow-x-auto scrollbar-thin"><table className="w-full text-[11px]"><thead><tr className="muted"><th className="text-start py-1">{t("time")}</th>{Object.keys(rs[0].params).map((k) => <th key={k} className="px-2">{k}</th>)}{Object.keys(rs[0].results).map((k) => <th key={k} className="px-2 text-brand-500">{k}</th>)}</tr></thead><tbody>{rs.map((r) => <tr key={r.id} className="border-t border-line"><td className="py-1 num whitespace-nowrap">{new Date(r.time).toLocaleTimeString()}</td>{Object.keys(rs[0].params).map((k) => <td key={k} className="num text-center px-2">{typeof r.params[k] === "number" ? (r.params[k] as number).toFixed(3) : r.params[k]}</td>)}{Object.keys(rs[0].results).map((k) => <td key={k} className="num text-center px-2">{typeof r.results[k] === "number" ? Number(r.results[k]).toPrecision(5) : r.results[k]}</td>)}</tr>)}</tbody></table></div>
            {notes[id] && <Callout tone="info" title={t("notes")}>{notes[id]}</Callout>}
          </div>
        ); })}
      </Panel>
    </div>
  );
}

function Shell() {
  const { t, lang, setLang, theme, setTheme, level, setLevel, mode, setMode, view, setView, onboarded, setOnboarded } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [chain, setChain] = useState<Block[]>(defaultChain);
  if (!onboarded) return <Onboarding />;
  const go = (v: string, m?: Mode) => { setView(v); if (m) setMode(m); setOpen(false); };
  const filtered = experiments.filter((e) => !q || (e.title.en + e.title.fa + e.short.en + e.short.fa).toLowerCase().includes(q.toLowerCase()));
  const cats = [{ id: "basic", label: t("basic") }, { id: "systems", label: t("systems") }, { id: "advanced", label: t("advanced") }] as const;
  const currentExp = view.startsWith("exp:") ? byId(view.slice(4)) : undefined;
  const navBtn = (id: string, label: string, icon: React.ReactNode, m?: Mode) => <button onClick={() => go(id, m)} className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition", view === id ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow" : "hover:bg-black/5 dark:hover:bg-white/5")}>{icon}{label}</button>;
  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-2 mb-4"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white"><FlaskConical size={18} /></div><div className="leading-tight"><div className="font-bold text-sm">{lang === "fa" ? "آزمایشگاه فیبر نوری" : "Optical Fiber Lab"}</div><div className="text-[10px] muted">v1.0 · {t(`level${level}` as "level1")}</div></div></div>
      <div className="space-y-1 mb-3">{navBtn("home", t("home"), <Home size={14} />)}{navBtn("free", t("freeLab"), <Boxes size={14} />, "free")}{navBtn("instructor", t("instructor"), <GraduationCap size={14} />, "instructor")}{navBtn("research", t("research"), <Microscope size={14} />, "research")}{navBtn("notebook", t("notebook"), <BookOpen size={14} />)}</div>
      <div className="relative mb-2"><Search size={13} className="absolute top-2.5 start-2.5 muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="w-full panel-2 ps-8 pe-2 py-2 text-xs outline-none focus:ring-2 ring-brand-400" /></div>
      <div className="flex-1 overflow-y-auto scrollbar-thin -mx-1 px-1">
        {cats.map((c) => { const list = filtered.filter((e) => e.category === c.id); if (!list.length) return null; return (
          <div key={c.id} className="mb-3"><div className="text-[10px] uppercase tracking-wider muted px-2 mb-1 font-semibold">{c.label}</div>
            {list.map((e) => <button key={e.id} onClick={() => go(`exp:${e.id}`, mode === "instructor" || mode === "research" ? mode : "student")} className={cn("w-full text-start flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition", view === `exp:${e.id}` ? "bg-brand-500/15 text-brand-600 dark:text-brand-300 font-semibold" : "hover:bg-black/5 dark:hover:bg-white/5", e.level > level && "opacity-60")}><span className="num w-5 text-brand-500">{e.num}</span><span className="truncate">{lang === "fa" ? e.title.fa : e.title.en}</span>{e.level > level && <span className="ms-auto text-[9px] muted">L{e.level}</span>}</button>)}
          </div>
        ); })}
      </div>
    </div>
  );
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-[1600px] mx-auto px-3 md:px-5 h-14 flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setOpen(true)}><Menu size={18} /></button>
          <div className="text-sm font-semibold truncate">{currentExp ? `#${currentExp.num} · ${lang === "fa" ? currentExp.title.fa : currentExp.title.en}` : view === "free" ? t("freeLab") : view === "instructor" ? t("instructor") : view === "research" ? t("research") : view === "notebook" ? t("notebook") : t("appName")}</div>
          <div className="ms-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2"><span className="text-[11px] muted">{t("level")}</span><Segmented size="xs" value={level} onChange={(v) => setLevel(v as Level)} options={[{ value: 1, label: "BSc" }, { value: 2, label: "MSc" }, { value: 3, label: "PhD" }]} /></div>
            <div className="hidden md:block"><Badge tone={mode === "instructor" ? "violet" : mode === "research" ? "warn" : mode === "free" ? "good" : "brand"}>{t(mode === "free" ? "freeLab" : mode)}</Badge></div>
            <button onClick={() => setLang(lang === "fa" ? "en" : "fa")} className="px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1"><Languages size={14} />{t("language")}</button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" title={t("theme")}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
            <button onClick={() => setOnboarded(false)} className="hidden sm:block text-[11px] muted hover:underline">{lang === "fa" ? "تنظیم مجدد" : "Re-setup"}</button>
          </div>
        </div>
      </header>
      <div className="max-w-[1600px] mx-auto px-3 md:px-5 py-4 grid lg:grid-cols-[250px_1fr] gap-5">
        <aside className="hidden lg:block sticky top-[72px] h-[calc(100vh-90px)] panel p-3">{sidebar}</aside>
        {open && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} /><div className="absolute top-0 bottom-0 start-0 w-[280px] panel rounded-none p-3"><button className="absolute top-3 end-3 p-1" onClick={() => setOpen(false)}><X size={16} /></button>{sidebar}</div></div>}
        <main className="min-w-0">
          {view === "home" && <HomeView />}
          {currentExp && <ExperimentShell key={currentExp.id} exp={currentExp} />}
          {view === "free" && <FreeLab chain={chain} setChain={setChain} />}
          {view === "instructor" && <Instructor />}
          {view === "research" && <Research />}
          {view === "notebook" && <NotebookView />}
          {view.startsWith("exp:") && !currentExp && <HomeView />}
        </main>
      </div>
      <footer className="text-center text-[10px] muted py-6">{lang === "fa" ? "همه نتایج بر پایه روابط فیزیکی معتبر (Agrawal, Keiser, Senior, Kashyap) محاسبه می‌شوند — مدل ایده‌آل، مهندسی و تجربی قابل انتخاب است." : "All results are computed from established physical relations (Agrawal, Keiser, Senior, Kashyap) — Ideal, Engineering and Experimental models selectable."}</footer>
    </div>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
