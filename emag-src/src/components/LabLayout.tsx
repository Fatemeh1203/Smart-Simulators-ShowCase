import { ReactNode } from "react";
import { Card, Collapse } from "./ui";

export function LabLayout({
  title,
  subtitle,
  levelTag,
  headerExtra,
  simulation,
  parameters,
  measurements,
  equation,
  graph,
  learned,
  misconceptions,
  extra,
}: {
  title: string;
  subtitle: string;
  levelTag?: string;
  headerExtra?: ReactNode;
  simulation: ReactNode;
  parameters: ReactNode;
  measurements: ReactNode;
  equation: ReactNode;
  graph?: ReactNode;
  learned: ReactNode;
  misconceptions: string[];
  extra?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {levelTag && (
            <span className="mb-1 inline-block rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300 ring-1 ring-indigo-500/30">
              {levelTag}
            </span>
          )}
          <h1 className="text-2xl font-extrabold text-white">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p>
        </div>
        {headerExtra}
      </div>

      <Card className="!p-2 sm:!p-4">
        <div className="mb-2 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wide text-sky-400">
          <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse-soft" /> شبیه‌سازی زنده
        </div>
        {simulation}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="پارامترها (ورودی)" icon="🎛️">
          <div className="space-y-4">{parameters}</div>
        </Card>
        <Card title="اندازه‌گیری (خروجی)" icon="📏">
          <div className="space-y-2">{measurements}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="رابطهٔ ریاضی" icon="∑">
          {equation}
        </Card>
        {graph && (
          <Card title="نمودار زنده" icon="📈">
            {graph}
          </Card>
        )}
      </div>

      {extra}

      <Card title="🧠 چه چیزی یاد گرفتیم؟" className="border-emerald-500/30 bg-emerald-950/10">
        <div className="text-sm leading-7 text-slate-300">{learned}</div>
      </Card>

      <Collapse title="⚠️ اشتباهات مفهومی رایج در این آزمایشگاه" color="amber">
        <ul className="list-inside list-disc space-y-1.5">
          {misconceptions.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </Collapse>
    </div>
  );
}
