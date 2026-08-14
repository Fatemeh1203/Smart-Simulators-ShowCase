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
import { cn } from "@/lib/utils";
import { Play, Pause, Info, Boxes, Shield, AlertOctagon } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";

const stages = [
  { num: "1", tech: "Kafka / MQTT", icon: Boxes },
  { num: "2", tech: "Flink / Streams", icon: Boxes },
  { num: "3", tech: "UKF", icon: Boxes },
  { num: "4", tech: "Model Sync", icon: Boxes },
  { num: "5", tech: "Control", icon: Boxes },
];

export function DigitalTwinSection() {
  const { t } = useI18n();
  const s = t.sec5;

  const [mode, setMode] = useState<"streaming" | "batch">("streaming");
  const [running, setRunning] = useState(false);
  const [freq, setFreq] = useState(100);
  const [scenario, setScenario] = useState<"normal" | "drift" | "attack">("normal");
  const [data, setData] = useState<{ t: number; residual: number }[]>([]);
  const [activeStage, setActiveStage] = useState(0);
  const [state, setState] = useState({ t: 0, drift: 0, attack: false, residual: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const step = () => {
    setState((prev) => {
      const tn = prev.t + 1;
      const trueVal = 80 + 5 * Math.sin(tn * 0.1);
      prev.drift += prev.attack ? 0.05 : (Math.random() - 0.48) * 0.02;
      const modelVal = trueVal + prev.drift + randn() * 0.5;
      const residual = Math.abs(trueVal - modelVal);

      setData((old) => {
        const newData = [...old, { t: tn, residual }];
        if (newData.length > 60) newData.shift();
        return newData;
      });

      if (mode === "streaming") {
        setActiveStage((st) => (st + 1) % 5);
      }

      return { ...prev, t: tn, residual };
    });
  };

  useEffect(() => {
    if (running) timerRef.current = setInterval(step, 200);
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, mode]);

  const applyScenario = (sc: typeof scenario) => {
    setScenario(sc);
    setState((prev) => ({ ...prev, drift: sc === "drift" ? 1.5 : 0, attack: sc === "attack" }));
    if (sc !== "normal") setData([]);
  };

  const latency = mode === "streaming" ? (15 + Math.random() * 20).toFixed(0) : "3600";
  const rate = mode === "streaming" ? "1000 r/s" : "1/hr";
  const syncStatus = state.residual > 3 ? s.syncDiverged : s.syncActive;

  const stageNames = [s.stage1, s.stage2, s.stage3, s.stage4, s.stage5];

  return (
    <section id="sec5" className="py-14 md:py-20 border-b border-border/60 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-chart-5/8 blur-3xl rounded-full" aria-hidden />
      <div className="container max-w-7xl mx-auto px-4 relative">
        <SectionHeader
          number={s.number}
          title={s.title}
          en={s.en}
          icon={<Boxes className="h-5 w-5" />}
          accentColor="var(--chart-5)"
        />

        <WhatIsCard text={s.whatIs} analogy={s.analogy} label={t.whatIs} />

        <div className="inline-flex border border-border rounded-md overflow-hidden mb-6 bg-card/40">
          <button
            className={cn(
              "px-4 py-2 text-xs transition-all",
              mode === "streaming" ? "bg-primary text-primary-foreground glow-primary" : "bg-transparent text-muted-foreground hover:bg-accent/20"
            )}
            onClick={() => setMode("streaming")}
          >
            {s.streaming}
          </button>
          <button
            className={cn(
              "px-4 py-2 text-xs transition-all",
              mode === "batch" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent/20"
            )}
            onClick={() => setMode("batch")}
          >
            {s.batch}
          </button>
        </div>

        <Card className="p-5 mb-4 glass-card">
          <h3 className="text-sm font-semibold mb-4">{s.pipelineTitle}</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 min-w-[120px] p-3 border rounded-md text-center transition-all relative",
                    mode === "streaming" && i === activeStage && running
                      ? "border-primary bg-primary/15 shadow-[0_0_15px_-2px_var(--primary)]"
                      : "border-border bg-card/40"
                  )}
                >
                  <div className="flex justify-center mb-1">
                    <Icon className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      mode === "streaming" && i === activeStage && running ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">{stage.num}</div>
                  <div className="text-xs font-semibold mt-0.5">{stageNames[i]}</div>
                  <div className="font-mono text-[10px] text-primary mt-1" dir="ltr">{stage.tech}</div>
                  {i < stages.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-1.5 -translate-y-1/2 text-primary/60 z-10">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label={s.statLatency} value={`${latency} ms`} variant="primary" />
            <StatBox label={s.statRate} value={rate} />
            <StatBox label={s.statResidual} value={formatNum(state.residual, 2)} />
            <StatBox label={s.statSync} value={syncStatus} variant={syncStatus === s.syncDiverged ? "danger" : "primary"} />
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Card className="p-5 glass-card">
            <h3 className="text-sm font-semibold mb-4">{s.chartTitle}</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.025 250 / 0.4)" />
                  <XAxis dataKey="t" hide />
                  <YAxis fontSize={10} stroke="oklch(0.6 0.02 200)" />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12, fontFamily: "var(--font-vazirmatn)",
                      background: "oklch(0.18 0.025 250)",
                      border: "1px solid oklch(0.3 0.03 195)",
                      borderRadius: 8, color: "oklch(0.95 0.01 200)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <ReferenceLine y={3} stroke="var(--accent)" strokeDasharray="5 5" strokeOpacity={0.6} />
                  <Line type="monotone" dataKey="residual" name={s.statResidual} stroke="var(--chart-1)" strokeWidth={1.5} dot={false} fill="oklch(0.72 0.16 195 / 0.2)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button size="sm" onClick={() => setRunning((r) => !r)} className={running ? "glow-primary" : ""}>
                {running ? <Pause className="h-3 w-3 ml-1" /> : <Play className="h-3 w-3 ml-1" />}
                {running ? s.pause : s.play}
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyScenario("normal")}>{s.scenarioNormal}</Button>
              <Button size="sm" variant="secondary" onClick={() => applyScenario("drift")}>
                <AlertOctagon className="h-3 w-3 ml-1" />
                {s.scenarioDrift}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => applyScenario("attack")}>
                <Shield className="h-3 w-3 ml-1" />
                {s.scenarioAttack}
              </Button>
            </div>
          </Card>

          <Card className="p-5 glass-card">
            <h3 className="text-sm font-semibold mb-4">{s.freqTitle}</h3>
            <div>
              <div className="flex justify-between items-baseline text-xs mb-2">
                <span className="font-medium">{s.freqLabel}</span>
                <span className="font-mono text-primary">{freq} ms</span>
              </div>
              <Slider value={[freq]} onValueChange={(v) => setFreq(v[0])} min={1} max={1000} step={1} />
            </div>
            <ul className="mt-5 space-y-2 text-xs">
              <li className="flex items-start gap-2 pb-2 border-b border-dashed border-border/60">
                <span className="font-semibold text-primary">1 ms:</span>
                <span className="text-muted-foreground">{s.freqFast}</span>
              </li>
              <li className="flex items-start gap-2 pb-2 border-b border-dashed border-border/60">
                <span className="font-semibold text-primary">100 ms:</span>
                <span className="text-muted-foreground">{s.freqMed}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-destructive">1 hr:</span>
                <span className="text-muted-foreground">{s.freqSlow}</span>
              </li>
            </ul>
            <InfoBox variant="info" icon={<Info className="h-3.5 w-3.5" />} className="mt-5 mb-0">
              <span className="text-xs">{s.note}</span>
            </InfoBox>
          </Card>
        </div>

        <SourceNote sources={s.source} label={t.sources} />
      </div>
    </section>
  );
}
