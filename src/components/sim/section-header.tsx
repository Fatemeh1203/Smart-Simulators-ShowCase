"use client";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  number: string;
  title: string;
  en: string;
  className?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export function SectionHeader({ number, title, en, className, icon, accentColor }: SectionHeaderProps) {
  return (
    <div className={cn("mb-6 flex items-start gap-4", className)}>
      {icon && (
        <div
          className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 border"
          style={{
            background: accentColor ? `${accentColor}1a` : "var(--accent)",
            borderColor: accentColor ? `${accentColor}40` : "var(--accent)",
            color: accentColor || "var(--background)",
          }}
        >
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div
          className="font-mono text-xs tracking-widest uppercase mb-2"
          style={{ color: accentColor || "var(--primary)" }}
        >
          {number}
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1 leading-tight">
          {title}
        </h2>
        <div className="font-mono text-xs text-muted-foreground" dir="ltr">
          {en}
        </div>
      </div>
    </div>
  );
}
