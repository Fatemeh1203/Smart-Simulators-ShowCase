import { ReactNode, useState } from "react";
import { Button, Card } from "./ui";
import { LineGraph } from "./Graph";

export interface Trial {
  x: number;
  y: number;
  label: string;
}

export function DiscoveryPanel({
  title,
  question,
  xLabel,
  yLabel,
  trials,
  onRecord,
  onClear,
  formula,
  hint,
  children,
}: {
  title: string;
  question: string;
  xLabel: string;
  yLabel: string;
  trials: Trial[];
  onRecord: () => void;
  onClear: () => void;
  formula: string;
  hint: string;
  children?: ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Card title={`🔬 ${title} — حالت کشف قانون`} className="border-violet-500/30 bg-violet-950/10">
      <p className="mb-3 text-sm text-slate-300">{question}</p>
      {children && <div className="mb-3">{children}</div>}
      <div className="mb-3 flex flex-wrap gap-2">
        <Button variant="primary" onClick={onRecord}>
          + ثبت این آزمایش به‌عنوان یک نقطه داده
        </Button>
        <Button variant="ghost" onClick={onClear}>
          پاک کردن داده‌ها
        </Button>
        <Button variant="default" active={revealed} onClick={() => setRevealed((r) => !r)} disabled={trials.length < 3}>
          {revealed ? "پنهان کردن رابطه" : "رابطه را نشان بده (حداقل ۳ داده)"}
        </Button>
      </div>

      {trials.length === 0 ? (
        <p className="rounded-lg bg-slate-800/50 px-3 py-4 text-center text-xs text-slate-500">
          پارامترها را تغییر بده، سپس روی «ثبت آزمایش» بزن تا نقطهٔ داده به نمودار اضافه شود.
        </p>
      ) : (
        <>
          <LineGraph points={trials.map((t) => ({ x: t.x, y: t.y }))} xLabel={xLabel} yLabel={yLabel} />
          <div className="mt-2 max-h-24 space-y-1 overflow-y-auto text-[11px] text-slate-400">
            {trials.map((t, i) => (
              <div key={i} className="tabular flex justify-between rounded bg-slate-800/40 px-2 py-0.5">
                <span>{t.label}</span>
                <span>
                  x={t.x.toPrecision(3)} , y={t.y.toPrecision(3)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {!revealed && trials.length >= 1 && (
        <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">💡 راهنما: {hint}</p>
      )}
      {revealed && (
        <div className="tabular mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-center text-base font-bold text-emerald-300">
          {formula}
        </div>
      )}
    </Card>
  );
}
