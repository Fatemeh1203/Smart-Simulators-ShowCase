import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { HistoryPoint } from '../hooks/useSimulation';

interface Props {
  history: HistoryPoint[];
  color?: string;
  height?: number;
  title?: string;
}

export default function LiveChart({ history, color = '#10b981', height = 220, title }: Props) {
  const data = history.length > 1 ? history : [...history, { t: history[0]?.t ?? 0, rate: history[0]?.rate ?? 0 }];
  const gradId = `grad-${color.replace('#', '')}`;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">📈 {title ?? 'نمودار زنده نرخ فتوسنتز'}</h3>
        <span className="text-xs text-slate-500">محور افقی: زمان (ثانیه) — محور عمودی: نرخ فتوسنتز (%)</span>
      </div>
      <div style={{ height }} dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${Math.round(v)}s`} minTickGap={30} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(v) => [`${v}%`, 'نرخ فتوسنتز']}
              labelFormatter={(l) => `زمان: ${l} ثانیه`}
              contentStyle={{ borderRadius: 12, fontFamily: 'Vazirmatn', direction: 'rtl', fontSize: 12 }}
            />
            <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'بالا', position: 'insideTopRight', fontSize: 10, fill: '#10b981' }} />
            <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'متوسط', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b' }} />
            <Area type="monotone" dataKey="rate" stroke={color} strokeWidth={3} fill={`url(#${gradId})`} isAnimationActive={false} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
