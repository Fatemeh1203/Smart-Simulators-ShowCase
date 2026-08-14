"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sim/section-header";
import { WhatIsCard } from "@/components/sim/what-is-card";
import { SourceNote } from "@/components/sim/source-note";
import { InfoBox } from "@/components/sim/ui-bits";
import { useI18n } from "@/components/sim/i18n-provider";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Info, Network } from "lucide-react";

type Level = "station" | "bay" | "process";

export function IEC61850Section() {
  const { t } = useI18n();
  const s = t.sec6;
  const [active, setActive] = useState<Level>("station");

  const levels: { key: Level; name: string; desc: string; icon: string; items: [string, string][]; color: string }[] = [
    {
      key: "station",
      name: s.levelStation,
      desc: s.stationDesc,
      icon: "3",
      color: "var(--chart-5)",
      items: [
        [s.protocol, s.station.protocol],
        [s.equipment, s.station.equipment],
        [s.latency, s.station.latency],
        [s.role, s.station.role],
        [s.forYou, s.station.forYou],
      ],
    },
    {
      key: "bay",
      name: s.levelBay,
      desc: s.bayDesc,
      icon: "2",
      color: "var(--accent)",
      items: [
        [s.protocol, s.bay.protocol],
        [s.equipment, s.bay.equipment],
        [s.latency, s.bay.latency],
        [s.role, s.bay.role],
        [s.forYou, s.bay.forYou],
      ],
    },
    {
      key: "process",
      name: s.levelProcess,
      desc: s.processDesc,
      icon: "1",
      color: "var(--primary)",
      items: [
        [s.protocol, s.process.protocol],
        [s.equipment, s.process.equipment],
        [s.latency, s.process.latency],
        [s.role, s.process.role],
        [s.forYou, s.process.forYou],
      ],
    },
  ];

  const activeLevel = levels.find((l) => l.key === active)!;

  return (
    <section id="sec6" className="py-14 md:py-20 border-b border-border/60 relative overflow-hidden">
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-primary/8 blur-3xl rounded-full" aria-hidden />
      <div className="container max-w-7xl mx-auto px-4 relative">
        <SectionHeader
          number={s.number}
          title={s.title}
          en={s.en}
          icon={<Network className="h-5 w-5" />}
          accentColor="var(--primary)"
        />

        <WhatIsCard text={s.whatIs} label={t.whatIs} />

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Card className="p-5 glass-card">
            <h3 className="text-sm font-semibold mb-4">{s.cardTitle}</h3>
            <div className="flex flex-col gap-2">
              {levels.map((level) => (
                <div key={level.key}>
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-md border transition-all text-left",
                      active === level.key
                        ? "shadow-[0_0_15px_-4px_var(--primary)]"
                        : "border-border hover:bg-accent/20"
                    )}
                    style={active === level.key ? {
                      borderColor: level.color,
                      background: `${level.color}15`,
                    } : {}}
                    onClick={() => setActive(level.key)}
                  >
                    <div
                      className="h-9 w-9 rounded-md flex items-center justify-center font-semibold text-sm flex-shrink-0"
                      style={{ background: level.color, color: "var(--background)" }}
                    >
                      {level.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{level.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 font-mono" dir="ltr">{level.desc}</div>
                    </div>
                  </button>
                  {level.key !== "process" && (
                    <div className="flex justify-center text-muted-foreground/60 my-1">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 glass-card">
            <h3 className="text-sm font-semibold mb-4">
              {s.detailTitle}: <span style={{ color: activeLevel.color }}>{activeLevel.name}</span>
            </h3>
            <ul className="space-y-2 text-xs">
              {activeLevel.items.map(([k, v]) => (
                <li key={k} className="flex flex-col gap-1 pb-2 border-b border-dashed border-border/60 last:border-0 last:pb-0">
                  <span className="font-semibold" style={{ color: activeLevel.color }}>{k}:</span>
                  <span className="text-muted-foreground font-mono" dir="ltr">{v}</span>
                </li>
              ))}
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
