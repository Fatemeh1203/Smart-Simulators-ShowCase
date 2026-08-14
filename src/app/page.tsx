"use client";

import { SiteHeader } from "@/components/sim/site-header";
import { SiteFooter } from "@/components/sim/site-footer";
import { SensorErrorsSection } from "@/components/sections/sensor-errors";
import { KalmanFilterSection } from "@/components/sections/kalman-filter";
import { NeutronFluxSection } from "@/components/sections/neutron-flux";
import { FiberOpticSection } from "@/components/sections/fiber-optic";
import { DigitalTwinSection } from "@/components/sections/digital-twin";
import { IEC61850Section } from "@/components/sections/iec-61850";
import { StandardsSection } from "@/components/sections/standards-table";
import { GlossarySection } from "@/components/sections/glossary";
import { HeroBg3D } from "@/components/sim/hero-bg-3d";
import { useI18n } from "@/components/sim/i18n-provider";
import { Atom, ArrowRight, BookOpen, Sparkles, Activity, Sigma, Waves, Boxes, Network, BookCheck } from "lucide-react";

const heroFeatureIcons = [
  Activity, Sigma, Atom, Waves, Boxes, Network, BookCheck,
];

export default function Home() {
  const { t, lang } = useI18n();
  const h = t.hero;
  const isRtl = lang === "fa";

  return (
    <div className="relative min-h-screen">
      <HeroBg3D />
      <div className="relative z-10 flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative py-16 md:py-24 border-b border-border/60 overflow-hidden">
        {/* Decorative animated background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/15 blur-3xl rounded-full pulse-ring" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/10 blur-3xl rounded-full pulse-ring" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/5 rounded-full slow-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-accent/5 rounded-full slow-spin" style={{ animationDirection: "reverse" }} />
        </div>

        <div className="container max-w-7xl mx-auto px-4 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs mb-6 border border-primary/30 backdrop-blur-sm fade-in-up">
              <Sparkles className="h-3 w-3" />
              <span>{h.badge}</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6 fade-in-up">
              {h.title1}
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {h.title2}
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl fade-in-up">
              {h.description}
            </p>

            <div className="flex flex-wrap gap-3 mt-8 fade-in-up">
              <a
                href="#sec1"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 active:translate-y-0 active:scale-[0.97] transition-all glow-primary font-medium"
              >
                {h.startBtn}
                {isRtl ? <ArrowRight className="h-4 w-4 rotate-180" /> : <ArrowRight className="h-4 w-4" />}
              </a>
              <a
                href="#glossary"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border bg-card/60 backdrop-blur-sm text-sm hover:bg-accent/20 hover:border-primary/60 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-all"
              >
                <BookOpen className="h-4 w-4" />
                {h.glossaryBtn}
              </a>
            </div>

            <div className="flex flex-wrap gap-8 mt-10 fade-in-up">
              {[
                { label: h.stats.sections, value: "7" },
                { label: h.stats.sources, value: "12+" },
                { label: h.stats.standards, value: "10" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-mono text-3xl font-semibold text-primary text-glow-primary">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14">
            {h.features.map((f, i) => {
              const Icon = heroFeatureIcons[i] || Activity;
              return (
                <a
                  key={i}
                  href={`#sec${i + 1}`}
                  className="group block p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all hover:shadow-[0_0_15px_-4px_var(--primary)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-[10px] text-primary">{f.num}</div>
                    <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-sm font-semibold">{f.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 font-mono" dir="ltr">
                    {f.desc}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <main className="flex-1">
        <SensorErrorsSection />
        <KalmanFilterSection />
        <NeutronFluxSection />
        <FiberOpticSection />
        <DigitalTwinSection />
        <IEC61850Section />
        <StandardsSection />
        <GlossarySection />
      </main>

      <SiteFooter />
      </div>
    </div>
  );
}
