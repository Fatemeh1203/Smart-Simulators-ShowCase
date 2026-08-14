"use client";

import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sim/section-header";
import { useI18n } from "@/components/sim/i18n-provider";
import {
  Activity, Atom, Database, Shield, BookOpen, Network, Waves, Boxes,
} from "lucide-react";

const icons = [
  Activity, Activity, Atom, Database, Activity, Network, Shield, BookOpen,
];

export function GlossarySection() {
  const { t } = useI18n();
  const g = t.glossary;

  return (
    <section id="glossary" className="py-14 md:py-20 border-b border-border/60 relative overflow-hidden">
      <div className="absolute top-0 right-1/2 w-96 h-96 bg-primary/5 blur-3xl rounded-full" aria-hidden />
      <div className="container max-w-7xl mx-auto px-4 relative">
        <SectionHeader
          number={g.number}
          title={g.title}
          en={g.en}
          icon={<BookOpen className="h-5 w-5" />}
          accentColor="var(--primary)"
        />

        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">{g.intro}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {g.items.map((c, i) => {
            const Icon = icons[i] || Activity;
            return (
              <Card
                key={i}
                className="p-4 glass-card hover:border-primary/40 transition-all hover:shadow-[0_0_15px_-4px_var(--primary)]"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-md bg-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{c.fa}</span>
                      <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">
                        {c.en}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {c.def}
                    </p>
                    <div className="text-[10px] text-primary mt-2 font-mono" dir="ltr">
                      {c.source}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
