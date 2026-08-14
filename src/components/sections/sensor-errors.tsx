"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/sim/section-header";
import { WhatIsCard } from "@/components/sim/what-is-card";
import { SourceNote } from "@/components/sim/source-note";
import { InfoBox, StatBox } from "@/components/sim/ui-bits";
import { useI18n } from "@/components/sim/i18n-provider";
import { formatNum } from "@/lib/format";
import { Activity, RefreshCw, Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Scenario {
  bias: number;
  gain: number;
  drift: number;
  noise: number;
}

const scenarios: Record<string, Scenario> = {
  calibrated: { bias: 0, gain: 1, drift: 0, noise: 0.5 },
  aged: { bias: 5, gain: 0.9, drift: 0.6, noise: 3 },
  failed: { bias: -8, gain: 1.15, drift: 0.9, noise: 6 },
};

export function SensorErrorsSection() {
  const { t, lang } = useI18n();
  const s = t.sec1;

  const [bias, setBias] = useState(3);
  const [gain, setGain] = useState(0.95);
  const [drift, setDrift] = useState(0.2);
  const [noise, setNoise] = useState(2);
  const [seed, setSeed] = useState(0);

  const seededRandn = (sn: number) => {
    const x = Math.sin(sn * 9301 + 49297) * 233280;
    const r = x - Math.floor(x);
    const u = (r + 0.0001) % 1;
    const v = ((r * 7) + 0.0001) % 1;
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const chartData: { i: number; true: number; measured: number }[] = [];
  let lastTrue = 100;
  for (let i = 0; i < 50; i++) {
    const tn = i / 50;
    const trueValue = 100 + 20 * Math.sin(tn * Math.PI * 2);
    lastTrue = trueValue;
    const driftComp = drift * tn * 5;
    const measured = trueValue * gain + bias + driftComp + seededRandn(seed + i) * noise;
    chartData.push({ i, true: trueValue, measured });
  }
  const trueVal = lastTrue;
  const readValue = trueVal * gain + bias + drift * 5;
  const totalError = Math.abs(readValue - trueVal);

  const regenerate = () => setSeed((sn) => sn + 1);

  const applyScenario = (key: string) => {
    const sc = scenarios[key];
    setBias(sc.bias);
    setGain(sc.gain);
    setDrift(sc.drift);
    setNoise(sc.noise);
  };

  const fa = lang === "fa";

  return (
    <section id="sec1" className="py-14 md:py-20 border-b border-border/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 blur-3xl rounded-full" aria-hidden />
      <div className="container max-w-7xl mx-auto px-4 relative">
        <SectionHeader
          number={s.number}
          title={s.title}
          en={s.en}
          icon={<Activity className="h-5 w-5" />}
          accentColor="var(--primary)"
        />

        <WhatIsCard text={s.whatIs} analogy={s.analogy} label={t.whatIs} />

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Card className="p-5 glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">{s.cardParams}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-mono">
                {s.slider}
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.bias}</span>
                  <span className="font-mono text-primary">{formatNum(bias, 1)}</span>
                </div>
                <Slider value={[bias]} onValueChange={(v) => setBias(v[0])} min={-10} max={10} step={0.1} />
              </div>

              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.gain}</span>
                  <span className="font-mono text-primary">{formatNum(gain, 2)}</span>
                </div>
                <Slider value={[gain]} onValueChange={(v) => setGain(v[0])} min={0.8} max={1.2} step={0.01} />
              </div>

              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.drift}</span>
                  <span className="font-mono text-primary">{formatNum(drift, 1)}</span>
                </div>
                <Slider value={[drift]} onValueChange={(v) => setDrift(v[0])} min={0} max={1} step={0.05} />
              </div>

              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.noise}</span>
                  <span className="font-mono text-primary">{formatNum(noise, 1)}</span>
                </div>
                <Slider value={[noise]} onValueChange={(v) => setNoise(v[0])} min={0} max={8} step={0.1} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <Button size="sm" onClick={() => applyScenario("calibrated")}>{s.scenarioCalibrated}</Button>
              <Button size="sm" variant="secondary" onClick={() => applyScenario("aged")}>{s.scenarioAged}</Button>
              <Button size="sm" variant="destructive" onClick={() => applyScenario("failed")}>{s.scenarioFailed}</Button>
              <Button size="sm" variant="outline" onClick={regenerate}>
                <RefreshCw className="h-3 w-3 ml-1" />
                {s.sampleNew}
              </Button>
            </div>
          </Card>

          <Card className="p-5 glass-card">
            <h3 className="text-sm font-semibold mb-4">{s.chartTitle}</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.025 250 / 0.4)" />
                  <XAxis dataKey="i" hide />
                  <YAxis domain={["auto", "auto"]} fontSize={10} stroke="oklch(0.6 0.02 200)" />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      fontFamily: "var(--font-vazirmatn)",
                      background: "oklch(0.18 0.025 250)",
                      border: "1px solid oklch(0.3 0.03 195)",
                      borderRadius: 8,
                      color: "oklch(0.95 0.01 200)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="true" name={s.legendTrue} stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="measured" name={s.legendMeasured} stroke="var(--chart-2)" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <StatBox label={s.statTrue} value={formatNum(trueVal, 1)} variant="primary" />
              <StatBox label={s.statRead} value={formatNum(readValue, 1)} variant="warning" />
              <StatBox label={s.statError} value={formatNum(totalError, 1)} variant="danger" />
            </div>
          </Card>
        </div>

        <InfoBox icon={<Info className="h-4 w-4" />}>
          <strong>{fa ? "نکته:" : "Note:"}</strong> {s.note}
        </InfoBox>

        <SourceNote sources={s.source} label={t.sources} />
      </div>
    </section>
  );
}
