"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/sim/section-header";
import { WhatIsCard } from "@/components/sim/what-is-card";
import { SourceNote } from "@/components/sim/source-note";
import { InfoBox, StatBox } from "@/components/sim/ui-bits";
import { useI18n } from "@/components/sim/i18n-provider";
import { formatNum } from "@/lib/format";
import { Play, Pause, RotateCcw, Info, Sigma } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface KalmanState {
  x_est: number; P: number; K: number; step: number;
  trueVal: number; trueVel: number;
  jumpAt: number; jumpApplied: boolean;
}

const initialState: KalmanState = {
  x_est: 20, P: 1, K: 0.5, step: 0, trueVal: 20, trueVel: 0, jumpAt: 80, jumpApplied: false,
};

function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function KalmanFilterSection() {
  const { t, lang } = useI18n();
  const s = t.sec2;
  const fa = lang === "fa";

  const [Q, setQ] = useState(0.1);
  const [R, setR] = useState(4);
  const [speed, setSpeed] = useState(300);
  const [running, setRunning] = useState(false);
  const [scenario, setScenario] = useState<"normal" | "trust-sensor" | "trust-model" | "jump">("normal");
  const [state, setState] = useState<KalmanState>(initialState);
  const [data, setData] = useState<{ step: number; true: number; measured: number; estimate: number }[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = (sc: typeof scenario = scenario) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setState({ ...initialState, jumpAt: sc === "jump" ? 40 : 80 });
    setData([]);
  };

  const applyScenario = (sc: typeof scenario) => {
    setScenario(sc);
    if (sc === "trust-sensor") { setQ(0.5); setR(0.5); }
    else if (sc === "trust-model") { setQ(0.001); setR(15); }
    else if (sc === "jump") { setQ(0.1); setR(4); }
    else { setQ(0.1); setR(4); }
    reset(sc);
  };

  const step = () => {
    setState((prev) => {
      const next = { ...prev };
      next.trueVel += (Math.random() - 0.5) * 0.1;
      next.trueVel *= 0.95;
      next.trueVal += next.trueVel;
      if (!next.jumpApplied && next.step === next.jumpAt) {
        next.trueVal += 15;
        next.jumpApplied = true;
      }
      next.x_est = prev.x_est;
      next.P = prev.P + Q;
      const z = next.trueVal + randn() * Math.sqrt(R);
      next.K = next.P / (next.P + R);
      next.x_est = next.x_est + next.K * (z - next.x_est);
      next.P = (1 - next.K) * next.P;
      next.step = prev.step + 1;

      setData((oldData) => {
        const newData = [...oldData, { step: next.step, true: next.trueVal, measured: z, estimate: next.x_est }];
        if (newData.length > 80) newData.shift();
        return newData;
      });
      return next;
    });
  };

  useEffect(() => {
    if (running) timerRef.current = setInterval(step, speed);
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, Q, R, speed]);

  const kErr = Math.abs(state.x_est - state.trueVal);

  return (
    <section id="sec2" className="py-14 md:py-20 border-b border-border/60 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-accent/5 blur-3xl rounded-full" aria-hidden />
      <div className="container max-w-7xl mx-auto px-4 relative">
        <SectionHeader
          number={s.number}
          title={s.title}
          en={s.en}
          icon={<Sigma className="h-5 w-5" />}
          accentColor="var(--accent)"
        />

        <WhatIsCard text={s.whatIs} analogy={s.analogy} label={t.whatIs} variant="accent" />

        <div className="rounded-md bg-muted/60 p-4 mb-6 text-center font-mono text-sm border border-border/50" dir="ltr">
          x̂ = x̂<sub>predict</sub> + K × (z − x̂<sub>predict</sub>)
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Card className="p-5 glass-card">
            <h3 className="text-sm font-semibold mb-4">{s.cardParams}</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.Q}</span>
                  <span className="font-mono text-primary">{formatNum(Q, 3)}</span>
                </div>
                <Slider value={[Q]} onValueChange={(v) => setQ(v[0])} min={0.001} max={1} step={0.001} />
              </div>
              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.R}</span>
                  <span className="font-mono text-primary">{formatNum(R, 1)}</span>
                </div>
                <Slider value={[R]} onValueChange={(v) => setR(v[0])} min={0.1} max={20} step={0.1} />
              </div>
              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.speed}</span>
                  <span className="font-mono text-primary">{speed}ms</span>
                </div>
                <Slider value={[speed]} onValueChange={(v) => setSpeed(v[0])} min={100} max={1000} step={50} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <Button size="sm" onClick={() => setRunning((r) => !r)} className={running ? "bg-primary glow-primary" : ""}>
                {running ? <Pause className="h-3 w-3 ml-1" /> : <Play className="h-3 w-3 ml-1" />}
                {running ? s.pause : s.play}
              </Button>
              <Button size="sm" variant="outline" onClick={() => reset()}>
                <RotateCcw className="h-3 w-3 ml-1" />
                {s.reset}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => applyScenario("trust-sensor")}>{s.trustSensor}</Button>
              <Button size="sm" variant="outline" onClick={() => applyScenario("trust-model")}>{s.trustModel}</Button>
              <Button size="sm" variant="outline" onClick={() => applyScenario("jump")}>{s.jump}</Button>
            </div>
          </Card>

          <Card className="p-5 glass-card">
            <h3 className="text-sm font-semibold mb-4">{s.chartTitle}</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.025 250 / 0.4)" />
                  <XAxis dataKey="step" hide />
                  <YAxis domain={["auto", "auto"]} fontSize={10} stroke="oklch(0.6 0.02 200)" />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12, fontFamily: "var(--font-vazirmatn)",
                      background: "oklch(0.18 0.025 250)",
                      border: "1px solid oklch(0.3 0.03 195)",
                      borderRadius: 8, color: "oklch(0.95 0.01 200)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="true" name={s.legendTrue} stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="measured" name={s.legendMeasured} stroke="var(--chart-2)" strokeWidth={1} dot={{ r: 1.5, fill: "var(--chart-2)" }} />
                  <Line type="monotone" dataKey="estimate" name={s.legendEstimate} stroke="var(--chart-3)" strokeWidth={2} dot={false} fill="oklch(0.62 0.24 25 / 0.08)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <StatBox label={s.statK} value={formatNum(state.K, 3)} variant="primary" />
              <StatBox label={s.statErr} value={formatNum(kErr, 2)} />
              <StatBox label={s.statStep} value={formatNum(state.step, 0)} />
            </div>
          </Card>
        </div>

        <InfoBox variant="warning" icon={<Info className="h-4 w-4" />}>
          <strong>{fa ? "قاعده‌ی طلایی:" : "Golden rule:"}</strong> {s.note}
        </InfoBox>

        <SourceNote sources={s.source} label={t.sources} />
      </div>
    </section>
  );
}
