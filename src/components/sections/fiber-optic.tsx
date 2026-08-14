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
import { Play, Pause, Info, Waves } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export function FiberOpticSection() {
  const { t } = useI18n();
  const s = t.sec4;

  const [temp, setTemp] = useState(60);
  const [strain, setStrain] = useState(100);
  const [nidx, setNidx] = useState(0.5);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animTRef = useRef(0);

  const deltaPhi = (temp - 20) * 0.01 + strain * 0.0005 + nidx * 0.4;

  const data: { wl: string; intensity: number }[] = [];
  const baseWL = 1550;
  for (let i = 0; i < 200; i++) {
    const wl = baseWL + (i - 100) * 0.5;
    const E1 = 0.5, E2 = 0.3, E3 = 0.2;
    const realPart = E1 + E2 * Math.cos(deltaPhi) + E3 * Math.cos(2 * deltaPhi);
    const imagPart = E2 * Math.sin(deltaPhi) + E3 * Math.sin(2 * deltaPhi);
    let I = realPart * realPart + imagPart * imagPart;
    I *= 0.7 + 0.3 * Math.cos((wl - baseWL) * 0.5 + deltaPhi);
    I = Math.max(0, I);
    data.push({ wl: wl.toFixed(1), intensity: I });
  }

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        animTRef.current += 0.05;
        const tn = 60 + 40 * Math.sin(animTRef.current);
        setTemp(Math.round(tn));
      }, 100);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const applyScenario = (sc: "normal" | "hot" | "stressed") => {
    setRunning(false);
    if (sc === "normal") { setTemp(60); setStrain(100); setNidx(0.5); }
    else if (sc === "hot") { setTemp(250); setStrain(100); setNidx(0.5); }
    else if (sc === "stressed") { setTemp(60); setStrain(1500); setNidx(2); }
  };

  const modesPath = (phaseOffset: number, amp: number) => {
    const w = 760, y0 = 70, steps = 80;
    let path = `M 20 ${y0}`;
    for (let i = 0; i <= steps; i++) {
      const x = 20 + (i / steps) * w;
      const y = y0 + Math.sin(i * 0.3 + phaseOffset) * amp;
      path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return path;
  };

  const intensities = data.map((d) => d.intensity);
  const maxI = intensities.length ? Math.max(...intensities) : 1;
  const minI = intensities.length ? Math.min(...intensities) : 0;
  const depth = maxI > 0 ? ((maxI - minI) / maxI) * 100 : 0;

  return (
    <section id="sec4" className="py-14 md:py-20 border-b border-border/60 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-chart-4/8 blur-3xl rounded-full" aria-hidden />
      <div className="container max-w-7xl mx-auto px-4 relative">
        <SectionHeader
          number={s.number}
          title={s.title}
          en={s.en}
          icon={<Waves className="h-5 w-5" />}
          accentColor="var(--chart-4)"
        />

        <WhatIsCard text={s.whatIs} analogy={s.analogy} label={t.whatIs} />

        <Card className="p-4 mb-4 bg-gradient-to-br from-[#0a0e1a] to-[#0a1420] border-primary/30 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute inset-0 opacity-20" aria-hidden>
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-primary/30 blur-3xl rounded-full pulse-ring" />
          </div>
          <svg viewBox="0 0 800 140" preserveAspectRatio="none" className="w-full h-[140px] relative">
            <defs>
              <linearGradient id="fiberGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="oklch(0.72 0.16 195)" stopOpacity="0.1" />
                <stop offset="50%" stopColor="oklch(0.72 0.16 195)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="oklch(0.72 0.16 195)" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <rect x="20" y="60" width="760" height="20" fill="url(#fiberGrad)" stroke="oklch(0.72 0.16 195)" strokeWidth="0.5" rx="2" />
            <text x="30" y="55" fill="oklch(0.7 0.1 195)" fontSize="10" fontFamily="monospace">INPUT</text>
            <text x="730" y="55" fill="oklch(0.7 0.1 195)" fontSize="10" fontFamily="monospace">OUTPUT</text>
            <path d={modesPath(0, 4)} fill="none" stroke="oklch(0.72 0.16 195)" strokeWidth="1.2" opacity="0.85" />
            <path d={modesPath(deltaPhi, 4)} fill="none" stroke="oklch(0.7 0.18 65)" strokeWidth="1.2" opacity="0.85" />
            <path d={modesPath(deltaPhi * 2, 4)} fill="none" stroke="oklch(0.7 0.18 300)" strokeWidth="1.2" opacity="0.85" />
            <text x="400" y="100" fill="oklch(0.7 0.1 195)" fontSize="9" textAnchor="middle" fontFamily="monospace">
              {s.fiberLabel}
            </text>
            <text x="400" y="115" fill="oklch(0.5 0.08 195)" fontSize="8" textAnchor="middle" fontFamily="monospace">
              Δφ = {deltaPhi.toFixed(2)} rad
            </text>
          </svg>
        </Card>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Card className="p-5 glass-card">
            <h3 className="text-sm font-semibold mb-4">{s.cardParams}</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.temp}</span>
                  <span className="font-mono text-primary">{formatNum(temp, 0)}</span>
                </div>
                <Slider value={[temp]} onValueChange={(v) => setTemp(v[0])} min={20} max={300} step={1} />
              </div>
              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.strain}</span>
                  <span className="font-mono text-primary">{formatNum(strain, 0)}</span>
                </div>
                <Slider value={[strain]} onValueChange={(v) => setStrain(v[0])} min={0} max={2000} step={10} />
              </div>
              <div>
                <div className="flex justify-between items-baseline text-xs mb-2">
                  <span className="font-medium">{s.nidx}</span>
                  <span className="font-mono text-primary">{formatNum(nidx, 1)}</span>
                </div>
                <Slider value={[nidx]} onValueChange={(v) => setNidx(v[0])} min={0} max={5} step={0.1} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              <Button size="sm" onClick={() => setRunning((r) => !r)} className={running ? "glow-primary" : ""}>
                {running ? <Pause className="h-3 w-3 ml-1" /> : <Play className="h-3 w-3 ml-1" />}
                {running ? s.pause : s.play}
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyScenario("normal")}>{s.normal}</Button>
              <Button size="sm" variant="secondary" onClick={() => applyScenario("hot")}>{s.hot}</Button>
              <Button size="sm" variant="destructive" onClick={() => applyScenario("stressed")}>{s.stressed}</Button>
            </div>
          </Card>

          <Card className="p-5 glass-card">
            <h3 className="text-sm font-semibold mb-4">{s.chartTitle}</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.025 250 / 0.4)" />
                  <XAxis dataKey="wl" fontSize={9} tickMargin={5} interval={19} stroke="oklch(0.6 0.02 200)" />
                  <YAxis fontSize={10} domain={[0, 1.1]} stroke="oklch(0.6 0.02 200)" />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11, fontFamily: "var(--font-vazirmatn)",
                      background: "oklch(0.18 0.025 250)",
                      border: "1px solid oklch(0.3 0.03 195)",
                      borderRadius: 8, color: "oklch(0.95 0.01 200)",
                    }}
                  />
                  <Line type="monotone" dataKey="intensity" stroke="oklch(0.72 0.16 195)" strokeWidth={1.5} dot={false} fill="oklch(0.72 0.16 195 / 0.25)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <StatBox label={s.statShift} value={`${formatNum(deltaPhi * 2, 2)} nm`} variant="primary" />
              <StatBox label={s.statDepth} value={`${formatNum(depth, 0)}%`} />
            </div>
          </Card>
        </div>

        <InfoBox icon={<Info className="h-4 w-4" />}>
          <strong>{t.lang === "fa" ? "چالش پژوهش:" : "Research challenge:"}</strong> {s.note}
        </InfoBox>

        <SourceNote sources={s.source} label={t.sources} />
      </div>
    </section>
  );
}
