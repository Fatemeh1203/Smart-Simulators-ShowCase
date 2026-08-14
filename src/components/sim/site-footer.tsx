"use client";

import { Atom, BookOpen } from "lucide-react";
import { useI18n } from "@/components/sim/i18n-provider";
import { CreatorMenu } from "@/components/sim/creator-menu";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-border bg-card/30 backdrop-blur-sm">
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground">
                <Atom className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-sm">{t.brand.name}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              {t.footer.basedOn}
            </p>
            <div className="mt-4 text-[10px] text-muted-foreground">{t.footer.copyright}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 font-semibold text-sm">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              {t.footer.sourcesTitle}
            </div>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground font-mono" dir="ltr">
              <li>IEC 61226 · IEC 60880 · IEC 61468 · IEC 61513</li>
              <li>IEC 61850 · IEC 62351 · IEC 62645 · IEC 63096</li>
              <li>ISO 23247 · IEEE 7-4.3.2</li>
              <li>IAEA-TECDOC on Digital Twins</li>
              <li>Kalman, R.E. (1960) · Wan & Van der Merwe</li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold mb-3 text-foreground">
              {t.creator.label}: Fatemeh Shams
            </div>
            <CreatorMenu
              name="Fatemeh Shams"
              role={t.creator.role}
              creatorLabel={t.creator.label}
              compact
            />
            <div className="mt-3 text-[10px] text-muted-foreground font-mono" dir="ltr">
              fatemeh.shams19@gmail.com
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
