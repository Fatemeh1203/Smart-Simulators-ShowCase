import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { GENOTYPE_OPTIONS, ORGANISMS, type Organism, type Trait } from "./genetics/data";
import { analyzeCross, randomChild, type Child, type Genotype } from "./genetics/engine";
import ParentPanel from "./components/ParentPanel";
import Fertilization from "./components/Fertilization";
import PunnettSquare from "./components/PunnettSquare";
import Results, { type Stats } from "./components/Results";
import Convergence, { type HistoryPoint } from "./components/Convergence";
import Prediction from "./components/Prediction";
import Challenges from "./components/Challenges";
import Generations from "./components/Generations";
import SetupPanel from "./components/SetupPanel";

const emptyStats = (): Stats => ({ total: 0, geno: {}, pheno: {}, recent: [], mutations: 0 });
const RECENT_LIMIT = 24;

function defaultGenotype(org: Organism, z: "DD" | "Dr" | "rr"): Genotype {
  const g: Genotype = {};
  for (const t of org.traits) g[t.id] = GENOTYPE_OPTIONS(t)[z === "DD" ? 0 : z === "Dr" ? 1 : 2].value;
  return g;
}

function shouldRecord(n: number) {
  if (n <= 20) return true;
  if (n <= 100) return n % 5 === 0;
  if (n <= 1000) return n % 25 === 0;
  if (n <= 10000) return n % 250 === 0;
  return n % 2500 === 0;
}

export default function App() {
  // ---- configuration state
  const [organismId, setOrganismId] = useState("flower");
  const organism = useMemo(() => ORGANISMS.find((o) => o.id === organismId)!, [organismId]);
  const [trait1, setTrait1] = useState("color");
  const [trait2, setTrait2] = useState<string | null>(null);
  const traits: Trait[] = useMemo(() => {
    const list = [organism.traits.find((t) => t.id === trait1)!];
    if (trait2) list.push(organism.traits.find((t) => t.id === trait2)!);
    return list;
  }, [organism, trait1, trait2]);

  const [p1, setP1] = useState<Genotype>(() => defaultGenotype(organism, "Dr"));
  const [p2, setP2] = useState<Genotype>(() => defaultGenotype(organism, "Dr"));
  const [mutation, setMutation] = useState(false);

  // ---- results state (experimental)
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [lastChild, setLastChild] = useState<Child | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const statsRef = useRef<Stats>(emptyStats());
  const historyRef = useRef<HistoryPoint[]>([]);
  const runningRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  // ---- modes
  const [teacher, setTeacher] = useState(false);
  const [punnettHidden, setPunnettHidden] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showGenerations, setShowGenerations] = useState(false);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);

  const analysis = useMemo(() => analyzeCross(p1, p2, traits), [p1, p2, traits]);
  const crossLabel = `${traits.map((t) => p1[t.id]).join("")} × ${traits.map((t) => p2[t.id]).join("")}`;
  const crossKey = organism.id + "|" + traits.map((t) => t.id).join(",") + "|" + crossLabel;

  // ---- reset results whenever the cross changes
  const resetResults = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    statsRef.current = emptyStats();
    historyRef.current = [];
    setStats(emptyStats());
    setHistory([]);
    setLastChild(null);
    setProgress(null);
    setAnimating(false);
    setHighlightKey(null);
  }, []);

  useEffect(() => {
    resetResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crossKey]);

  // ---- core: add a child to the accumulators (mutable refs for speed)
  const accumulate = (c: Child) => {
    const s = statsRef.current;
    s.total += 1;
    s.geno[c.key] = (s.geno[c.key] || 0) + 1;
    s.pheno[c.phenoKey] = (s.pheno[c.phenoKey] || 0) + 1;
    if (c.mutated) s.mutations += 1;
    s.recent.unshift(c);
    if (s.recent.length > RECENT_LIMIT) s.recent.length = RECENT_LIMIT;
    if (shouldRecord(s.total)) historyRef.current.push({ n: s.total, geno: { ...s.geno }, pheno: { ...s.pheno } });
  };
  const commit = () => {
    const s = statsRef.current;
    setStats({ total: s.total, geno: { ...s.geno }, pheno: { ...s.pheno }, recent: [...s.recent], mutations: s.mutations });
    setHistory([...historyRef.current]);
  };

  const generate = (n: number) => {
    if (runningRef.current || animating) return;
    if (n === 1) {
      const child = randomChild(statsRef.current.total + 1, p1, p2, traits, mutation);
      setLastChild(child);
      setAnimKey((k) => k + 1);
      setAnimating(true);
      timerRef.current = window.setTimeout(() => {
        accumulate(child);
        commit();
        setAnimating(false);
        setHighlightKey(child.key);
      }, 1050);
      return;
    }
    runningRef.current = true;
    const target = n;
    let done = 0;
    const chunk = Math.max(1, Math.ceil(n / 40));
    setProgress({ done: 0, total: target });
    let last: Child | null = null;
    const step = () => {
      if (!runningRef.current) {
        finish();
        return;
      }
      const end = Math.min(done + chunk, target);
      for (; done < end; done++) {
        last = randomChild(statsRef.current.total + 1, p1, p2, traits, mutation);
        accumulate(last);
      }
      commit();
      setProgress({ done, total: target });
      if (done >= target) finish();
      else timerRef.current = window.setTimeout(step, 16);
    };
    const finish = () => {
      runningRef.current = false;
      const s = statsRef.current;
      const h = historyRef.current;
      if (s.total > 0 && (h.length === 0 || h[h.length - 1].n !== s.total)) h.push({ n: s.total, geno: { ...s.geno }, pheno: { ...s.pheno } });
      commit();
      setProgress(null);
      if (last) {
        setLastChild(last);
        setAnimKey((k) => k + 1);
        setHighlightKey(last.key);
      }
    };
    timerRef.current = window.setTimeout(step, 16);
  };

  const stop = () => {
    runningRef.current = false;
  };

  // ---- parent editing
  const changeParent = (which: 1 | 2) => (traitId: string, value: string) => {
    (which === 1 ? setP1 : setP2)((g) => ({ ...g, [traitId]: value }));
  };
  const randomizeParents = useCallback(() => {
    const rnd = (g: Genotype) => {
      const n = { ...g };
      for (const t of traits) n[t.id] = GENOTYPE_OPTIONS(t)[Math.floor(Math.random() * 3)].value;
      return n;
    };
    setP1((g) => rnd(g));
    setP2((g) => rnd(g));
  }, [traits]);

  const applyPreset = (z1: "DD" | "Dr" | "rr", z2: "DD" | "Dr" | "rr", dihybrid?: boolean) => {
    let secondId = trait2;
    if (dihybrid && !secondId) {
      secondId = organism.traits.find((t) => t.id !== trait1)!.id;
      setTrait2(secondId);
    }
    const idx = (z: string) => (z === "DD" ? 0 : z === "Dr" ? 1 : 2);
    const t1 = organism.traits.find((t) => t.id === trait1)!;
    const tt2 = secondId ? organism.traits.find((t) => t.id === secondId)! : null;
    setP1((g) => ({ ...g, [t1.id]: GENOTYPE_OPTIONS(t1)[idx(z1)].value, ...(dihybrid && tt2 ? { [tt2.id]: GENOTYPE_OPTIONS(tt2)[1].value } : {}) }));
    setP2((g) => ({ ...g, [t1.id]: GENOTYPE_OPTIONS(t1)[idx(z2)].value, ...(dihybrid && tt2 ? { [tt2.id]: GENOTYPE_OPTIONS(tt2)[1].value } : {}) }));
  };

  const changeOrganism = (id: string) => {
    const org = ORGANISMS.find((o) => o.id === id)!;
    setOrganismId(id);
    setTrait1(org.traits[0].id);
    setTrait2(null);
    setP1(defaultGenotype(org, "Dr"));
    setP2(defaultGenotype(org, "Dr"));
  };

  const toggleTeacher = () => {
    const next = !teacher;
    setTeacher(next);
    setPunnettHidden(next);
  };

  const running = progress !== null;
  const hideTheory = teacher && punnettHidden;

  return (
    <div className={`min-h-screen ${teacher ? "teacher-mode" : ""}`}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
              <span className="dna-spin inline-block">🧬</span> آزمایشگاه مجازی ژنتیک
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-semibold">والدین را انتخاب کن، ژن‌ها را ترکیب کن و ببین فرزندان چه صفاتی می‌توانند داشته باشند.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={`btn text-sm ${showPrediction ? "btn-amber" : "btn-secondary"}`} onClick={() => setShowPrediction(!showPrediction)}>
              🤔 پیش‌بینی
            </button>
            <button className={`btn text-sm ${showChallenges ? "btn-emerald" : "btn-secondary"}`} onClick={() => setShowChallenges(!showChallenges)}>
              🎯 چالش (Challenge)
            </button>
            <button className={`btn text-sm ${showGenerations ? "bg-sky-600 text-white" : "btn-secondary"}`} onClick={() => setShowGenerations(!showGenerations)}>
              👨‍👩‍👧 نسل‌ها
            </button>
            <button className={`btn text-sm ${teacher ? "bg-slate-800 text-white" : "btn-secondary"}`} onClick={toggleTeacher}>
              👨‍🏫 حالت معلم
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        {/* Teacher toolbar */}
        {teacher && (
          <div className="card p-4 border-slate-700 bg-slate-900 text-white fade-up">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-black text-lg">👨‍🏫 حالت معلم — سناریوی کلاس</div>
              <div className="text-xs text-slate-300">
                تلاقی فعلی: <span className="num font-black text-emerald-300 text-base">{crossLabel}</span>
              </div>
            </div>
            <ol className="mt-3 grid md:grid-cols-6 gap-2 text-xs">
              {[
                ["۱", "والدین را انتخاب کنید", null],
                ["۲", "از دانش‌آموزان بخواهید پیش‌بینی کنند", <button key="a" className="btn btn-amber text-xs py-1" onClick={() => setShowPrediction(true)}>🤔 باز کردن سؤال</button>],
                ["۳", punnettHidden ? "پاسخ و جدول پانت مخفی است" : "پاسخ نمایش داده شد", <button key="b" className={`btn text-xs py-1 ${punnettHidden ? "btn-emerald" : "btn-secondary"}`} onClick={() => setPunnettHidden(!punnettHidden)}>{punnettHidden ? "👁️ نمایش پاسخ" : "🙈 مخفی‌سازی دوباره"}</button>],
                ["۴", "۱۰ فرزند تولید کنید", <button key="c" className="btn btn-primary text-xs py-1" disabled={running} onClick={() => generate(10)}>⚡ 10</button>],
                ["۵", "سپس ۱۰۰ و ۱۰۰۰ فرزند", <div key="d" className="flex gap-1"><button className="btn btn-primary text-xs py-1" disabled={running} onClick={() => generate(100)}>⚡ 100</button><button className="btn btn-primary text-xs py-1" disabled={running} onClick={() => generate(1000)}>⚡ 1000</button></div>],
                ["۶", "نظری و تجربی را مقایسه کنید", <a key="e" href="#results" className="btn btn-secondary text-xs py-1">📊 رفتن به نتایج</a>],
              ].map(([n, txt, node], i) => (
                <li key={i} className="rounded-xl bg-white/10 p-2 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="num w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">{n as string}</span>
                    <span className="font-bold">{txt as string}</span>
                  </div>
                  {node as ReactNode}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Educational mode panels */}
        {(showPrediction || showChallenges || showGenerations) && (
          <div className="grid lg:grid-cols-2 gap-4">
            {showPrediction && (
              <Prediction analysis={analysis} traits={traits} crossLabel={crossLabel} crossKey={crossKey} onReveal={() => setPunnettHidden(false)} onRun={generate} onClose={() => setShowPrediction(false)} />
            )}
            {showChallenges && <Challenges analysis={analysis} traits={traits} stats={stats} crossLabel={crossLabel} onSetChallengeCross={randomizeParents} onClose={() => setShowChallenges(false)} />}
            {showGenerations && <Generations key={crossKey} organism={organism} traits={traits} p1={p1} p2={p2} mutation={mutation} onClose={() => setShowGenerations(false)} />}
          </div>
        )}

        {/* Main lab bench */}
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <SetupPanel organism={organism} onOrganism={changeOrganism} trait1={trait1} trait2={trait2} onTraits={(a, b) => { setTrait1(a); setTrait2(b); }} onPreset={applyPreset} disabled={running} />
          </div>
          <div className="lg:col-span-3 grid md:grid-cols-3 gap-4">
            <ParentPanel title="والد ۱" emoji="👨" organism={organism} activeTraits={traits} genotype={p1} onChange={changeParent(1)} accent="indigo" />
            <Fertilization
              organism={organism}
              traits={traits}
              lastChild={lastChild}
              animKey={animKey}
              animating={animating}
              progress={progress}
              total={stats.total}
              mutation={mutation}
              onGenerate={generate}
              onStop={stop}
              onReset={resetResults}
              onRandom={randomizeParents}
              onToggleMutation={() => setMutation((m) => !m)}
            />
            <ParentPanel title="والد ۲" emoji="👩" organism={organism} activeTraits={traits} genotype={p2} onChange={changeParent(2)} accent="rose" />
          </div>
        </div>

        {/* Punnett + theoretical */}
        <PunnettSquare analysis={analysis} traits={traits} hidden={hideTheory} onReveal={() => setPunnettHidden(false)} highlightKey={highlightKey} />

        {/* Theoretical summary */}
        {!hideTheory && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="card p-3">
              <div className="text-sm font-black mb-2">🎯 احتمال نظری ژنوتیپ‌ها — {crossLabel}</div>
              <div className="flex flex-wrap gap-2">
                {analysis.genotypeOrder.map((k) => (
                  <div key={k} className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-center min-w-[80px]">
                    <div className="num font-black text-lg">{k}</div>
                    <div className="num text-indigo-700 font-bold">→ {(analysis.genotypeProb[k] * 100).toFixed(analysis.genotypeProb[k] * 100 % 1 ? 2 : 0)}٪</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-3">
              <div className="text-sm font-black mb-2">🌸 احتمال نظری فنوتیپ‌ها</div>
              <div className="flex flex-wrap gap-2">
                {analysis.phenotypeOrder.map((k) => (
                  <div key={k} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center min-w-[80px]">
                    <div className="font-black text-sm">{traits.length === 1 ? (k === "D" ? `غالب (${traits[0].dominant.label})` : `مغلوب (${traits[0].recessive.label})`) : k.split("").map((c, i) => (c === "D" ? traits[i].dominant.label : traits[i].recessive.label)).join(" • ")}</div>
                    <div className="num text-emerald-700 font-bold">→ {(analysis.phenotypeProb[k] * 100).toFixed(analysis.phenotypeProb[k] * 100 % 1 ? 2 : 0)}٪</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div id="results">
          <Results analysis={analysis} stats={stats} traits={traits} organism={organism} hideTheory={hideTheory} />
        </div>

        <Convergence analysis={analysis} history={history} traits={traits} hideTheory={hideTheory} />

        <footer className="text-center text-[11px] text-slate-400 py-4 leading-relaxed">
          این شبیه‌ساز از مدل ساده‌ی <b>وراثت مندلی</b> (یک ژن، دو آلل، غالب/مغلوب کامل، صفات مستقل) استفاده می‌کند و برای آموزش مفاهیم پایه طراحی شده است؛ نماینده‌ی وراثت پیچیده‌ی صفات واقعی انسان یا بیماری‌های ژنتیکی نیست.
          <br />
          نتایج تجربی فقط از فرزندان شبیه‌سازی‌شده‌ی تصادفی (Math.random) محاسبه می‌شوند و به‌صورت مصنوعی به مقدار نظری نزدیک نمی‌شوند.
        </footer>
      </main>
    </div>
  );
}
