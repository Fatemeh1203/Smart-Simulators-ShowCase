import React, { useEffect, useMemo, useRef, useState } from "react";
import { Target, BookOpen, Wrench, FunctionSquare, ListChecks, FlaskConical, Table2, HelpCircle, FileText, Play, Pause, Square, RotateCcw, StepForward, AlertTriangle, Download, Lightbulb, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useStore, download, toCSV, type Model, type Level, type NoiseFlags } from "../lib/store";
import type { Bi } from "../lib/i18n";
import { Panel, Tabs, Button, Badge, Eq, Segmented, Callout, Stat, fmt, Toggle } from "./ui";
import { XYChart } from "./Chart";
import { cn } from "../utils/cn";

export type Depth = "basic" | "engineering" | "advanced" | "research";
export interface Question { q: Bi; type: "numeric" | "mc"; answer: number; tolerance?: number; options?: Bi[]; hints: [Bi, Bi]; explanation: Bi; deep?: Bi; unit?: string }
export interface SimProps { model: Model; level: Level; noise: NoiseFlags; record: (params: Record<string, number | string>, results: Record<string, number | string>) => void; sim: SimState; L: (b: Bi) => string; lang: "en" | "fa"; }
export interface SimState { running: boolean; t: number; speed: number; resetKey: number; }
export interface ExperimentDef {
  id: string; num: number; category: "basic" | "systems" | "advanced"; level: Level; title: Bi; short: Bi; objective: Bi;
  prerequisites: Bi[]; equipment: Bi[]; theory: Record<Depth, Bi>; equations: { eq: string; desc: Bi }[]; procedure: Bi[]; errors: Bi[]; conclusion: Bi;
  questions: Question[]; assumptions?: Bi; numerics?: Bi; Sim: React.FC<SimProps>; dataKeys?: { x: string; y: string[] };
}

export function useExplain(params: Record<string, number | string>, rules: Record<string, Bi>) {
  const prev = useRef(params);
  const [last, setLast] = useState<{ key: string; from: number | string; to: number | string } | null>(null);
  useEffect(() => {
    for (const k of Object.keys(params)) if (params[k] !== prev.current[k]) { setLast({ key: k, from: prev.current[k], to: params[k] }); break; }
    prev.current = params;
  }, [params]);
  const { t, L } = useStore();
  if (!last || !rules[last.key]) return null;
  return (
    <Callout tone="info" title={<span className="flex items-center gap-1"><Sparkles size={13} />{t("whatChanged")}</span>}>
      <div className="mb-1"><b className="num">{last.key}</b>: <span className="num">{typeof last.from === "number" ? fmt(last.from, 3) : last.from}</span> → <span className="num text-brand-500">{typeof last.to === "number" ? fmt(last.to, 3) : last.to}</span></div>
      <div>{L(rules[last.key])}</div>
    </Callout>
  );
}

export function Compare({ rows }: { rows: { label: React.ReactNode; theory: number; measured: number; unit?: string; digits?: number }[] }) {
  const { t } = useStore();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead><tr className="muted text-[11px]"><th className="text-start py-1">—</th><th>{t("theoretical")}</th><th>{t("measured")}</th><th>{t("absError")}</th><th>{t("pctError")}</th></tr></thead>
        <tbody>
          {rows.map((r, i) => { const abs = r.measured - r.theory; const pct = r.theory !== 0 ? (abs / r.theory) * 100 : NaN; const d = r.digits ?? 3; return (
            <tr key={i} className="border-t border-line"><td className="py-1.5 font-medium">{r.label}</td><td className="num text-center">{fmt(r.theory, d)} {r.unit}</td><td className="num text-center text-brand-500">{fmt(r.measured, d)} {r.unit}</td><td className="num text-center">{fmt(abs, d)}</td><td className={cn("num text-center", Math.abs(pct) > 10 ? "text-rose-500" : Math.abs(pct) > 3 ? "text-amber-500" : "text-emerald-500")}>{fmt(pct, 2)}%</td></tr>
          ); })}
        </tbody>
      </table>
    </div>
  );
}

function Tutor({ q, idx, expId, onResult }: { q: Question; idx: number; expId: string; onResult: (ok: boolean, attempts: number) => void }) {
  const { L, t, level } = useStore();
  const [val, setVal] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [state, setState] = useState<"idle" | "ok" | "wrong">("idle");
  useEffect(() => { setVal(""); setChoice(null); setAttempts(0); setState("idle"); }, [expId]);
  const check = () => {
    let ok = false;
    if (q.type === "numeric") { const v = parseFloat(val); ok = Number.isFinite(v) && Math.abs(v - q.answer) <= (q.tolerance ?? Math.abs(q.answer) * 0.05); }
    else ok = choice === q.answer;
    const a = attempts + 1; setAttempts(a); setState(ok ? "ok" : "wrong"); onResult(ok, a);
  };
  const done = state === "ok" || attempts >= 3;
  return (
    <div className="panel-2 p-3 space-y-2">
      <div className="text-xs font-medium flex gap-2"><span className="text-brand-500 num">Q{idx + 1}.</span><span>{L(q.q)}</span></div>
      {q.type === "numeric" ? (
        <div className="flex items-center gap-2"><input value={val} onChange={(e) => setVal(e.target.value)} disabled={done} placeholder={t("yourAnswer")} className="num panel-2 px-2 py-1.5 text-xs w-40 outline-none focus:ring-2 ring-brand-400" /><span className="text-xs muted">{q.unit}</span></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-1.5">{q.options?.map((o, i) => <button key={i} disabled={done} onClick={() => setChoice(i)} className={cn("text-start text-xs px-2.5 py-1.5 rounded-lg border transition", choice === i ? "border-brand-500 bg-brand-500/10" : "border-line hover:bg-black/5 dark:hover:bg-white/5")}>{L(o)}</button>)}</div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {!done && <Button size="sm" onClick={check}>{t("check")}</Button>}
        <span className="text-[10px] muted">{attempts}/3 {t("attempts")}</span>
        {state === "ok" && <Badge tone="good"><CheckCircle2 size={11} className="me-1" />{t("correct")}</Badge>}
        {state === "wrong" && !done && <Badge tone="warn"><XCircle size={11} className="me-1" />{t("incorrect")}</Badge>}
      </div>
      {state === "wrong" && attempts === 1 && <Callout tone="warn" title={<span className="flex items-center gap-1"><Lightbulb size={12} />{t("hint")} 1</span>}>{L(q.hints[0])}</Callout>}
      {state === "wrong" && attempts === 2 && <Callout tone="warn" title={<span className="flex items-center gap-1"><Lightbulb size={12} />{t("hint")} 2</span>}>{L(q.hints[1])}</Callout>}
      {done && (
        <Callout tone={state === "ok" ? "good" : "info"} title={t("fullExplanation")}>
          <div>{L(q.explanation)}</div>
          {level >= 2 && q.deep && <div className="mt-1.5 pt-1.5 border-t border-line/60">{L(q.deep)}</div>}
          {q.type === "numeric" && <div className="mt-1 num">✓ {q.answer} {q.unit}</div>}
        </Callout>
      )}
    </div>
  );
}

export function ExperimentShell({ exp }: { exp: ExperimentDef }) {
  const { t, L, level, model, setModel, noise, setNoise, records, addRecord, clearRecords, notes, setNote, quiz, setQuizResult, lang } = useStore();
  const [tab, setTab] = useState<"overview" | "theory" | "procedure" | "sim" | "data" | "questions" | "report">("sim");
  const [depth, setDepth] = useState<Depth>(level === 1 ? "basic" : level === 2 ? "engineering" : "advanced");
  const [sim, setSim] = useState<SimState>({ running: false, t: 0, speed: 1, resetKey: 0 });
  const [evaluated, setEvaluated] = useState(false);
  const qState = useRef<Record<number, { ok: boolean; attempts: number }>>({});
  useEffect(() => { setDepth(level === 1 ? "basic" : level === 2 ? "engineering" : "advanced"); setTab("sim"); setEvaluated(false); qState.current = {}; }, [exp.id, level]);
  useEffect(() => { if (!sim.running) return; const id = setInterval(() => setSim((s) => ({ ...s, t: s.t + 1 })), Math.max(30, 300 / sim.speed)); return () => clearInterval(id); }, [sim.running, sim.speed]);

  const myRecords = records.filter((r) => r.exp === exp.id);
  const record = (params: Record<string, number | string>, results: Record<string, number | string>) => addRecord({ exp: exp.id, params, results });

  const onQ = (i: number, ok: boolean, attempts: number) => {
    qState.current[i] = { ok, attempts };
    const correct = Object.values(qState.current).filter((x) => x.ok).length;
    const att = Object.values(qState.current).reduce((a, x) => a + x.attempts, 0);
    setQuizResult(exp.id, correct, att);
  };

  const evaluation = useMemo(() => {
    const qz = quiz[exp.id] ?? { correct: 0, attempts: 0 };
    const nQ = exp.questions.length || 1;
    const conceptual = Math.round((qz.correct / nQ) * 100 * (qz.attempts > 0 ? Math.max(0.6, nQ / Math.max(nQ, qz.attempts)) : 1));
    const n = myRecords.length;
    const measurementS = Math.min(100, n * 20);
    const paramKeys = myRecords.length ? Object.keys(myRecords[0].params) : [];
    const distinct = paramKeys.reduce((acc, k) => acc + (new Set(myRecords.map((r) => r.params[k])).size > 1 ? 1 : 0), 0);
    const paramS = Math.min(100, distinct * 40 + (n > 0 ? 20 : 0));
    const procedureS = Math.min(100, (n >= 3 ? 50 : n * 15) + (qz.attempts > 0 ? 25 : 0) + ((notes[exp.id]?.length ?? 0) > 0 ? 25 : 0));
    const errs = myRecords.map((r) => { const th = Number(r.results["theory"]), me = Number(r.results["measured"]); return Number.isFinite(th) && Number.isFinite(me) && th !== 0 ? Math.abs((me - th) / th) : NaN; }).filter((x) => Number.isFinite(x));
    const meanErr = errs.length ? errs.reduce((a, b) => a + b, 0) / errs.length : NaN;
    const analysisS = errs.length ? Math.min(100, 60 + errs.length * 10) : n > 0 ? 40 : 0;
    const noteLen = notes[exp.id]?.length ?? 0;
    const interpS = Math.min(100, Math.round(noteLen / 3));
    const finalS = Number.isFinite(meanErr) ? Math.round(Math.max(0, 100 - meanErr * 400)) : Math.round((conceptual + measurementS) / 2);
    const total = Math.round(0.25 * conceptual + 0.1 * procedureS + 0.1 * paramS + 0.15 * measurementS + 0.15 * analysisS + 0.1 * interpS + 0.15 * finalS);
    return { conceptual, procedureS, paramS, measurementS, analysisS, interpS, finalS, total, meanErr };
  }, [quiz, exp, myRecords, notes]);

  const depthOpts: { value: Depth; label: string }[] = [{ value: "basic", label: t("basicD") }, { value: "engineering", label: t("engD") }, { value: "advanced", label: t("advD") }, { value: "research", label: t("resD") }];
  const catTone = { basic: "good", systems: "brand", advanced: "violet" } as const;
  const exportReport = () => {
    const lines = [
      `# ${L(exp.title)}`, `Student level: ${level} | Model: ${model} | Date: ${new Date().toLocaleString()}`, "", `## Objective`, L(exp.objective), "", `## Equipment`, ...exp.equipment.map((e) => "- " + L(e)), "",
      `## Equations`, ...exp.equations.map((e) => `- ${e.eq}  (${L(e.desc)})`), "", `## Measurements (${myRecords.length})`, toCSV(myRecords), "",
      `## Error analysis`, `Mean relative error: ${Number.isFinite(evaluation.meanErr) ? (evaluation.meanErr * 100).toFixed(2) + "%" : "n/a"}`, "", `## Discussion / Notes`, notes[exp.id] ?? "", "", `## Questions`, `Correct: ${quiz[exp.id]?.correct ?? 0}/${exp.questions.length}`, "", `## Conclusion`, L(exp.conclusion), "", `## Evaluation`, `Total score: ${evaluation.total}/100`,
    ];
    download(`${exp.id}-report.md`, lines.join("\n"), "text/markdown");
  };

  const dataChart = useMemo(() => {
    if (!exp.dataKeys || myRecords.length < 2) return null;
    const { x, y } = exp.dataKeys;
    const data = myRecords.map((r) => ({ x: Number(r.params[x] ?? r.results[x]), ...Object.fromEntries(y.map((k) => [k, Number(r.results[k] ?? r.params[k])])) })).filter((d) => Number.isFinite(d.x)).sort((a, b) => a.x - b.x);
    return <XYChart data={data} series={y.map((k) => ({ key: k, name: k }))} xLabel={x} height={220} legend brush={false} />;
  }, [exp, myRecords]);

  return (
    <div className="space-y-4">
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute -top-20 -end-20 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-start justify-between gap-3 relative">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge tone={catTone[exp.category]}>{t(exp.category)}</Badge>
              <Badge tone="muted">{t("level")} {exp.level}</Badge>
              <Badge tone="brand">#{exp.num}</Badge>
              {exp.level > level && <Badge tone="warn">{t("lockedLevel")}</Badge>}
            </div>
            <h1 className="text-xl font-bold tracking-tight">{L(exp.title)}</h1>
            <p className="text-sm muted mt-1 max-w-2xl">{L(exp.short)}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2 text-xs"><span className="muted">{t("model")}</span><Segmented value={model} onChange={setModel} options={[{ value: "ideal", label: t("ideal") }, { value: "realistic", label: t("realistic") }, { value: "experimental", label: t("experimental") }]} /></div>
            <div className="flex items-center gap-2 text-xs"><span className="muted">{t("levelUp")}</span><Segmented value={depth} onChange={setDepth} options={depthOpts} size="xs" /></div>
          </div>
        </div>
      </div>

      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "overview", label: t("objective"), icon: <Target size={13} /> }, { id: "theory", label: t("theory"), icon: <BookOpen size={13} /> }, { id: "procedure", label: t("procedure"), icon: <ListChecks size={13} /> },
        { id: "sim", label: t("simulation"), icon: <FlaskConical size={13} /> }, { id: "data", label: t("dataTable"), icon: <Table2 size={13} /> }, { id: "questions", label: t("questions"), icon: <HelpCircle size={13} /> }, { id: "report", label: t("report"), icon: <FileText size={13} /> },
      ]} />

      {tab === "overview" && (
        <div className="grid md:grid-cols-3 gap-4">
          <Panel title={t("objective")} icon={<Target size={14} />} className="md:col-span-3"><p className="text-sm leading-relaxed">{L(exp.objective)}</p></Panel>
          <Panel title={t("prerequisites")} icon={<BookOpen size={14} />}><ul className="text-xs space-y-1.5 list-disc ps-4">{exp.prerequisites.map((p, i) => <li key={i}>{L(p)}</li>)}</ul></Panel>
          <Panel title={t("equipment")} icon={<Wrench size={14} />}><ul className="text-xs space-y-1.5">{exp.equipment.map((p, i) => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" />{L(p)}</li>)}</ul></Panel>
          <Panel title={t("errors")} icon={<AlertTriangle size={14} />}><ul className="text-xs space-y-1.5 list-disc ps-4">{exp.errors.map((p, i) => <li key={i}>{L(p)}</li>)}</ul></Panel>
        </div>
      )}

      {tab === "theory" && (
        <div className="grid lg:grid-cols-5 gap-4">
          <Panel title={`${t("theory")} — ${depthOpts.find((d) => d.value === depth)?.label}`} icon={<BookOpen size={14} />} className="lg:col-span-3">
            <p className="text-sm leading-7 whitespace-pre-line">{L(exp.theory[depth])}</p>
            {(depth === "research" || level === 3) && exp.assumptions && <Callout tone="info" title={t("assumptions")}><div className="whitespace-pre-line">{L(exp.assumptions)}</div></Callout>}
            {(depth === "research" || level === 3) && exp.numerics && <div className="mt-2"><Callout tone="info" title={t("numerics")}><div className="whitespace-pre-line">{L(exp.numerics)}</div></Callout></div>}
          </Panel>
          <Panel title={t("equations")} icon={<FunctionSquare size={14} />} className="lg:col-span-2">{exp.equations.map((e, i) => <Eq key={i} label={L(e.desc)}>{e.eq}</Eq>)}</Panel>
        </div>
      )}

      {tab === "procedure" && (
        <Panel title={t("procedure")} icon={<ListChecks size={14} />}>
          <ol className="space-y-2">{exp.procedure.map((p, i) => <li key={i} className="flex gap-3 text-sm"><span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 num text-xs flex items-center justify-center shrink-0 font-bold">{i + 1}</span><span className="leading-relaxed">{L(p)}</span></li>)}</ol>
        </Panel>
      )}

      {tab === "sim" && (
        <div className="space-y-4">
          <div className="panel p-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold flex items-center gap-1.5 me-2"><Play size={13} className="text-brand-500" />{t("simControl")}</span>
            <Button size="sm" variant={sim.running ? "outline" : "primary"} onClick={() => setSim((s) => ({ ...s, running: !s.running }))}>{sim.running ? <><Pause size={12} />{t("pause")}</> : <><Play size={12} />{t("start")}</>}</Button>
            <Button size="sm" variant="outline" onClick={() => setSim((s) => ({ ...s, running: false, t: 0 }))}><Square size={12} />{t("stop")}</Button>
            <Button size="sm" variant="outline" onClick={() => setSim((s) => ({ ...s, t: s.t + 1 }))}><StepForward size={12} />{t("step")}</Button>
            <Button size="sm" variant="ghost" onClick={() => setSim((s) => ({ running: false, t: 0, speed: 1, resetKey: s.resetKey + 1 }))}><RotateCcw size={12} />{t("reset")}</Button>
            <Segmented size="xs" value={sim.speed} onChange={(v) => setSim((s) => ({ ...s, speed: v }))} options={[{ value: 0.25, label: t("slow") }, { value: 1, label: t("realtime") }, { value: 4, label: t("fast") }]} />
            <span className="num text-xs muted ms-auto">t = {sim.t}</span>
          </div>
          <exp.Sim key={sim.resetKey + exp.id} model={model} level={level} noise={noise} record={record} sim={sim} L={L} lang={lang} />
          <Panel title={t("noise")} icon={<AlertTriangle size={14} />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4">
              <Toggle checked={noise.meas} onChange={(v) => setNoise({ meas: v })} label={t("measNoise")} /><Toggle checked={noise.inst} onChange={(v) => setNoise({ inst: v })} label={t("instErr")} />
              <Toggle checked={noise.conn} onChange={(v) => setNoise({ conn: v })} label={t("connVar")} /><Toggle checked={noise.splice} onChange={(v) => setNoise({ splice: v })} label={t("spliceVar")} />
              <Toggle checked={noise.temp} onChange={(v) => setNoise({ temp: v })} label={t("tempVar")} /><Toggle checked={noise.laser} onChange={(v) => setNoise({ laser: v })} label={t("laserFluct")} /><Toggle checked={noise.det} onChange={(v) => setNoise({ det: v })} label={t("detNoise")} />
            </div>
            <div className="text-[10px] muted mt-2">{lang === "fa" ? "این گزینه‌ها فقط در مدل «تجربی» اثر می‌گذارند." : "These flags only take effect in the Experimental model."}</div>
          </Panel>
        </div>
      )}

      {tab === "data" && (
        <Panel title={`${t("dataTable")} (${myRecords.length})`} icon={<Table2 size={14} />} right={<div className="flex gap-1.5"><Button size="sm" variant="outline" onClick={() => download(`${exp.id}.csv`, toCSV(myRecords), "text/csv")}><Download size={12} />{t("exportCSV")}</Button><Button size="sm" variant="outline" onClick={() => download(`${exp.id}.json`, JSON.stringify(myRecords, null, 2), "application/json")}><Download size={12} />{t("exportJSON")}</Button><Button size="sm" variant="danger" onClick={() => clearRecords(exp.id)}>{t("clear")}</Button></div>}>
          {myRecords.length === 0 ? <div className="text-xs muted py-6 text-center">{lang === "fa" ? "هنوز داده‌ای ثبت نشده است. در تب شبیه‌سازی دکمه «ثبت اندازه‌گیری» را بزنید." : "No data yet. Use “Record measurement” in the Simulation tab."}</div> : (
            <>
              <div className="overflow-x-auto scrollbar-thin mb-4">
                <table className="w-full text-[11px]">
                  <thead><tr className="muted"><th className="text-start py-1">#</th>{Object.keys(myRecords[0].params).map((k) => <th key={k} className="px-2 font-medium">{k}</th>)}{Object.keys(myRecords[0].results).map((k) => <th key={k} className="px-2 font-medium text-brand-500">{k}</th>)}</tr></thead>
                  <tbody>{myRecords.map((r, i) => <tr key={r.id} className="border-t border-line"><td className="py-1 num">{i + 1}</td>{Object.keys(myRecords[0].params).map((k) => <td key={k} className="num text-center px-2">{typeof r.params[k] === "number" ? fmt(r.params[k] as number, 3) : r.params[k]}</td>)}{Object.keys(myRecords[0].results).map((k) => <td key={k} className="num text-center px-2">{typeof r.results[k] === "number" ? fmt(r.results[k] as number, 4) : r.results[k]}</td>)}</tr>)}</tbody>
                </table>
              </div>
              {dataChart}
            </>
          )}
        </Panel>
      )}

      {tab === "questions" && (
        <div className="space-y-3">
          <Callout tone="info">{lang === "fa" ? "دستیار هوشمند: در صورت پاسخ اشتباه ابتدا راهنمایی ۱، سپس راهنمایی ۲ و در نهایت توضیح کامل ارائه می‌شود. پاسخ صحیح پیش از پایان تلاش‌ها نمایش داده نمی‌شود." : "Smart tutor: on a wrong answer you first get Hint 1, then Hint 2, and finally the full explanation. The correct answer is not revealed before you finish your attempts."}</Callout>
          {exp.questions.map((q, i) => <Tutor key={exp.id + i} q={q} idx={i} expId={exp.id} onResult={(ok, a) => onQ(i, ok, a)} />)}
        </div>
      )}

      {tab === "report" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Panel title={t("notebook")} icon={<FileText size={14} />} className="lg:col-span-2">
            <textarea value={notes[exp.id] ?? ""} onChange={(e) => setNote(exp.id, e.target.value)} placeholder={t("notesPh")} className="w-full h-48 panel-2 p-3 text-sm outline-none focus:ring-2 ring-brand-400 resize-y" />
            <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs">
              <div><div className="font-semibold mb-1">{t("analysis")}</div><p className="muted leading-relaxed">{lang === "fa" ? `تعداد اندازه‌گیری: ${myRecords.length}. میانگین خطای نسبی: ${Number.isFinite(evaluation.meanErr) ? (evaluation.meanErr * 100).toFixed(2) + "%" : "—"}` : `Measurements: ${myRecords.length}. Mean relative error: ${Number.isFinite(evaluation.meanErr) ? (evaluation.meanErr * 100).toFixed(2) + "%" : "—"}`}</p></div>
              <div><div className="font-semibold mb-1">{t("conclusion")}</div><p className="muted leading-relaxed">{L(exp.conclusion)}</p></div>
            </div>
            <div className="flex gap-2 mt-3"><Button onClick={exportReport}><Download size={13} />{t("exportReport")}</Button><Button variant="outline" onClick={() => setEvaluated(true)}>{t("finishExperiment")}</Button></div>
          </Panel>
          <Panel title={t("evaluation")} icon={<CheckCircle2 size={14} />}>
            {!evaluated ? <div className="text-xs muted py-6 text-center">{lang === "fa" ? "برای مشاهده نمره، آزمایش را به پایان برسانید." : "Finish the experiment to see your score."}</div> : (
              <div className="space-y-2">
                <div className="text-center py-3"><div className="text-4xl font-black num bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">{evaluation.total}</div><div className="text-[11px] muted">{t("score")} / 100</div></div>
                {[[t("conceptual"), evaluation.conceptual], [t("procedureScore"), evaluation.procedureS], [t("paramSel"), evaluation.paramS], [t("measScore"), evaluation.measurementS], [t("dataAnalysis"), evaluation.analysisS], [t("interpretation"), evaluation.interpS], [t("finalResult"), evaluation.finalS]].map(([l, v]) => (
                  <div key={String(l)} className="text-[11px]"><div className="flex justify-between mb-0.5"><span>{l}</span><span className="num">{v}</span></div><div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-accent-400" style={{ width: `${v}%` }} /></div></div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}

export function RecordBar({ onRecord, children }: { onRecord: () => void; children?: React.ReactNode }) {
  const { t } = useStore();
  return <div className="flex flex-wrap items-center gap-2"><Button onClick={onRecord}><Table2 size={13} />{t("record")}</Button>{children}</div>;
}
export { Stat };
