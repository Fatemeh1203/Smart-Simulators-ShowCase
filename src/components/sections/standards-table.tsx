"use client";

import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sim/section-header";
import { WhatIsCard } from "@/components/sim/what-is-card";
import { SourceNote } from "@/components/sim/source-note";
import { InfoBox } from "@/components/sim/ui-bits";
import { useI18n } from "@/components/sim/i18n-provider";
import { BookCheck, Lightbulb } from "lucide-react";

export function StandardsSection() {
  const { t } = useI18n();
  const s = t.sec7;

  const rows = [
    { dim: s.safety, nuclear: { text: s.nuclearSafety, pill: "IEC 61226" }, smart: { text: s.smartSafety } },
    { dim: s.software, nuclear: { text: s.nuclearSoftware, pill: "IEC 60880 · IEEE 7-4.3.2" }, smart: { text: s.smartSoftware } },
    { dim: s.protocol, nuclear: { text: s.nuclearProtocol }, smart: { text: s.smartProtocol, pill: "IEC 61850" } },
    { dim: s.cybersec, nuclear: { text: s.nuclearCyber, pill: "IEC 63096 · IEC 62645" }, smart: { text: s.smartCyber, pill: "IEC 62351" } },
    { dim: s.twin, nuclear: { text: s.nuclearTwin, pill: "GAP", warn: true }, smart: { text: s.smartTwin, pill: "ISO 23247" } },
  ];

  return (
    <section id="sec7" className="py-14 md:py-20 border-b border-border/60 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/8 blur-3xl rounded-full" aria-hidden />
      <div className="container max-w-7xl mx-auto px-4 relative">
        <SectionHeader
          number={s.number}
          title={s.title}
          en={s.en}
          icon={<BookCheck className="h-5 w-5" />}
          accentColor="var(--accent)"
        />

        <WhatIsCard text={s.whatIs} label={t.whatIs} variant="accent" />

        <Card className="overflow-hidden p-0 glass-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-primary/15 to-accent/15 border-b border-border">
                  <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider">{s.colDim}</th>
                  <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-chart-3" />
                      {s.colNuclear}
                    </span>
                  </th>
                  <th className="text-right p-3 font-semibold text-xs uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      {s.colSmart}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-accent/10 transition-colors">
                    <td className="p-3 font-medium">{row.dim}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground/90">{row.nuclear.text}</span>
                        {row.nuclear.pill && (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono ${
                              row.nuclear.warn
                                ? "bg-accent/20 text-accent border border-accent/40"
                                : "bg-primary/15 text-primary"
                            }`}
                            dir="ltr"
                          >
                            {row.nuclear.pill}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground/90">{row.smart.text}</span>
                        {row.smart.pill && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/15 text-primary" dir="ltr">
                            {row.smart.pill}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <InfoBox variant="warning" icon={<Lightbulb className="h-4 w-4" />} className="mt-4">
          <strong>{t.lang === "fa" ? "فرصت علمی:" : "Scientific opportunity:"}</strong> {s.opportunity}
        </InfoBox>

        <SourceNote sources={s.source} label={t.sources} />
      </div>
    </section>
  );
}
