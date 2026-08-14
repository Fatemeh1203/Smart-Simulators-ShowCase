"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, Atom, Languages } from "lucide-react";
import { useI18n } from "@/components/sim/i18n-provider";
import { CreatorMenu } from "@/components/sim/creator-menu";

export function SiteHeader() {
  const { t, lang, toggleLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { href: "#sec1", label: lang === "fa" ? "خطاهای سنسور" : "Sensor Errors" },
    { href: "#sec2", label: lang === "fa" ? "فیلتر کالمن" : "Kalman Filter" },
    { href: "#sec3", label: lang === "fa" ? "شار نوترون" : "Neutron Flux" },
    { href: "#sec4", label: lang === "fa" ? "فیبر نوری" : "Fiber Optic" },
    { href: "#sec5", label: lang === "fa" ? "دوقلوی دیجیتال" : "Digital Twin" },
    { href: "#sec6", label: "IEC 61850" },
    { href: "#sec7", label: lang === "fa" ? "استانداردها" : "Standards" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl transition-shadow",
        scrolled && "shadow-lg shadow-primary/5"
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-3">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-md rounded-md group-hover:bg-primary/50 transition-all" />
            <div className="relative h-9 w-9 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground">
              <Atom className="h-4 w-4" />
            </div>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{t.brand.name}</div>
            <div className="text-[10px] text-muted-foreground hidden sm:block font-mono" dir="ltr">
              {t.brand.tagline}
            </div>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs px-3 py-1.5 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card/60 hover:border-primary/50 hover:text-primary transition-colors text-xs"
            aria-label="Toggle language"
          >
            <Languages className="h-3.5 w-3.5" />
            <span className="font-mono">{lang === "en" ? "FA" : "EN"}</span>
          </button>

          <div className="hidden md:block">
            <CreatorMenu
              name="Fatemeh Shams"
              role={t.creator.role}
              creatorLabel={t.creator.label}
            />
          </div>

          <button
            className="lg:hidden p-2 rounded-md hover:bg-accent/20"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-border bg-background">
          <div className="container max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm px-3 py-2 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-border">
              <CreatorMenu
                name="Fatemeh Shams"
                role={t.creator.role}
                creatorLabel={t.creator.label}
              />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
