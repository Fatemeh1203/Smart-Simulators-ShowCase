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
import { formatNum, randn } from "@/lib/format";
import { Play, Pause, AlertTriangle, Atom, Zap } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";

interface ReactorState {
  target: number; current: number; rate: number; scram: boolean; t: number;
}
const initial: ReactorState = { target: 80, current: 80, rate: 0.1, scram: false, t: 0 };

export function NeutronFluxSection() {
  const { t, lang } = useI18n();
  const s = t.sec3;
  const fa = lang === "fa";

  const [power, setPower] = useState(80);
  const [rho, setRho] = useState(0.1);
  const [running, setRunning] = useState(false);
  const [state, setState] = useState<ReactorState>(initial);
  const [data, setData] = useState<{ t: number; incore: number; excore: number }[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const step = () => {
    setState((prev) => {
      const target = prev.scram ? 0 : prev.target;
      const diff = target - prev.current;
      let nextCurrent = prev.current + diff * prev.rate * 0.1;
      nextCurrent = Math.max(0, Math.min(120, nextCurrent));
      const incore = nextCurrent + randn() * 0.5;
      const excore = nextCurrent * 0.98 + randn() * 0.8;
      const next = { ...prev, current: nextCurrent, t: prev.t + 1 };
      setData((old) => {
        const newData = [...old, { t: next.t, incore, excore }];
        if (newData.length > 80) newData.shift();
        return newData;
      });
      return next;
    });
  };

  useEffect(() => {
    if (running) timerRef.current = setInterval(step, 200);
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const applyScenario = (sc: "startup" | "steady" | "scram") => {
    if (sc === "startup") setState({ ...initial, target: 80, current: 5, rate: 0.05 });
    else if (sc === "steady") setState({ ...initial, target: 80, current: 80, rate: 0.05 });
    else if (sc === "scram") setState((prev) => ({ ...prev, scram: true, rate: 0.8 }));
  };

  const updateTarget = (v: number) => {
    setPower(v);
    setState((prev) => ({ ...prev, target: v, scram: false }));
  };
  const updateRate = (v: number) => {
    setRho(v);
    setState((prev) => ({ ...prev, rate: v }));
  };

  const lastData = data[data.length - 1];
  const incoreVal = lastData ? lastData.incore : 80;
  const excoreVal = lastData ? lastData.excore : 78.4;
  const status = state.scram ? s.statusScram
    : Math.abs(state.target - state.current) > 5 ? s.statusChanging : s.statusStable;

  return (
    <section id="sec3" className="py-14 md:py-20 border-b border-border/60 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-chart-3/8 blur-3xl rounded-full" aria-hidden />
      <div className="container max-w-7xl mx-auto px-4 relative">
        <SectionHeader
          number={s.number}
          title={s.title}
          en={s.en}
          icon={<Atom className="h-5 w-5" />}
          accentColor="var(--chart-3)"
        />

        <WhatIsCard text={s.whatIs} analogy={s.analogy} label={t.whatIs} variant="danger" />

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Card className="p-5 glass-card">
            <h3 className="text-sm font-semibold mb-4">{s.cardControl}</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.power}</span>
                  <span className="font-mono text-primary">{formatNum(power, 0)}</span>
                </div>
                <Slider value={[power]} onValueChange={(v) => updateTarget(v[0])} min={0} max={100} step={1} />
              </div>
              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.rate}</span>
                  <span className="font-mono text-primary">{formatNum(rho, 2)}</span>
                </div>
                <Slider value={[rho]} onValueChange={(v) => updateRate(v[0])} min={0} max={0.5} step={0.01} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <Button size="sm" onClick={() => setRunning((r) => !r)} className={running ? "glow-primary" : ""}>
                {running ? <Pause className="h-3 w-3 ml-1" /> : <Play className="h-3 w-3 ml-1" />}
                {running ? s.pause : s.play}
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyScenario("startup")}>
                <Zap className="h-3 w-3 ml-1" />
                {s.startup}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => applyScenario("steady")}>{s.steady}</Button>
              <Button size="sm" variant="destructive" onClick={() => applyScenario("scram")} className="hover:glow-danger">
                <AlertTriangle className="h-3 w-3 ml-1" />
                {s.scram}
              </Button>
            </div>

            <ul className="mt-5 space-y-2 text-xs">
              <li className="flex items-start gap-2 pb-2 border-b border-dashed border-border/60">
                <span className="font-semibold text-primary font-mono">Incore:</span>
                <span className="text-muted-foreground">{s.incoreDesc}</span>
              </li>
              <li className="flex items-start gap-2 pb-2 border-b border-dashed border-border/60">
                <span className="font-semibold text-accent font-mono">Excore:</span>
                <span className="text-muted-foreground">{s.excoreDesc}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-destructive font-mono">SCRAM:</span>
                <span className="text-muted-foreground">{s.scramDesc}</span>
              </li>
            </ul>
          </Card>

          <Card className="p-5 glass-card">
            <h3 className="text-sm font-semibold mb-4">{s.chartTitle}</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.025 250 / 0.4)" />
                  <XAxis dataKey="t" hide />
                  <YAxis fontSize={10} domain={[0, 120]} stroke="oklch(0.6 0.02 200)" />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12, fontFamily: "var(--font-vazirmatn)",
                      background: "oklch(0.18 0.025 250)",
                      border: "1px solid oklch(0.3 0.03 195)",
                      borderRadius: 8, color: "oklch(0.95 0.01 200)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <ReferenceLine y={state.target} stroke="var(--chart-3)" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <Line type="monotone" dataKey="incore" name={s.legendIncore} stroke="var(--chart-1)" strokeWidth={2} dot={false} fill="oklch(0.72 0.16 195 / 0.1)" />
                  <Line type="monotone" dataKey="excore" name={s.legendExcore} stroke="var(--chart-2)" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <StatBox label={s.statIncore} value={formatNum(incoreVal, 1)} variant="primary" />
              <StatBox label={s.statExcore} value={formatNum(excoreVal, 1)} variant="warning" />
              <StatBox
                label={s.statStatus}
                value={status}
                variant={state.scram ? "danger" : status === s.statusStable ? "primary" : "warning"}
              />
            </div>
          </Card>
        </div>

        <InfoBox variant="warning" icon={<AlertTriangle className="h-4 w-4" />}>
          <strong>{fa ? "چرا اهمیت دارد؟" : "Why it matters:"}</strong> {s.note}
        </InfoBox>

        <SourceNote sources={s.source} label={t.sources} />
      </div>
    </section>
  );
}
