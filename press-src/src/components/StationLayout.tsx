import React, { createContext, useContext } from "react";
import { Chip, DynDef, DefPart, Formula, Levels, Quiz, QuizQ, Section, Btn } from "./ui";

export type Settings = {
  paused: boolean; slow: boolean; showVectors: boolean; showData: boolean; showFormula: boolean; explore: boolean;
};
export const SettingsCtx = createContext<Settings>({ paused: false, slow: false, showVectors: true, showData: true, showFormula: true, explore: false });
export const useSettings = () => useContext(SettingsCtx);

export type StationProps = {
  title: string; icon: string; concept: string;
  formula: React.ReactNode; formulaSub?: React.ReactNode; unit: string;
  values: { label: string; value: string | number; unit?: string; color?: string; flash?: boolean }[];
  result: React.ReactNode;
  definition: { parts: DefPart[]; active: string[]; note?: string };
  scene: React.ReactNode; controls: React.ReactNode; chart?: React.ReactNode;
  levels: { observe: string; concept: string; math: React.ReactNode };
  quiz?: QuizQ[]; onQuizRun?: (i: number) => void; onReset?: () => void;
  extra?: React.ReactNode;
};

export default function StationLayout(p: StationProps) {
  const s = useSettings();
  const formulaVisible = s.showFormula && !s.explore;
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="panel p-3 md:p-4">
        <div className="flex flex-col lg:flex-row lg:items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">{p.icon}</span>
              <h2 className="text-lg md:text-xl font-bold text-white">{p.title}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 ltr">SI: {p.unit}</span>
              {p.onReset && <Btn small tone="rose" onClick={p.onReset}>↺ بازنشانی</Btn>}
            </div>
            <p className="text-sm text-slate-300 mt-1 leading-6">{p.concept}</p>
            <div className="mt-2"><DynDef parts={p.definition.parts} active={p.definition.active} note={p.definition.note} /></div>
          </div>
          <div className="lg:w-72 shrink-0 space-y-2">
            <Formula hidden={!formulaVisible} sub={p.formulaSub}>{p.formula}</Formula>
            <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-3 py-2 text-sm text-emerald-100 leading-6">
              <span className="text-[10px] text-emerald-300 block">نتیجه‌ی آزمایش</span>{p.result}
            </div>
          </div>
        </div>
        {s.showData && (
          <div className="flex flex-wrap gap-2 mt-3">
            {p.values.map((v, i) => <Chip key={i} label={v.label} value={v.value} unit={v.unit} color={v.color} flash={v.flash} />)}
          </div>
        )}
      </div>

      {/* Scene + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 panel p-2 md:p-3 grid-bg overflow-hidden">{p.scene}</div>
        <Section title="پنل کنترل" icon="🎛️" className="max-h-[560px] overflow-y-auto scrollbar-thin">{p.controls}</Section>
      </div>

      {p.extra}

      {/* Chart + Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {p.chart && <Section title="نمودار زنده" icon="📈">{p.chart}</Section>}
        <Section title="نمایش چندلایه مفهوم" icon="🧠">
          <Levels observe={p.levels.observe} concept={p.levels.concept} math={p.levels.math} showMath={formulaVisible} />
        </Section>
      </div>

      {p.quiz && (
        <Section title="سیستم سؤال هوشمند — پاسخ بده، سپس آزمایش خودکار اجرا می‌شود" icon="❓">
          <Quiz questions={p.quiz} onRun={p.onQuizRun} />
        </Section>
      )}
    </div>
  );
}
