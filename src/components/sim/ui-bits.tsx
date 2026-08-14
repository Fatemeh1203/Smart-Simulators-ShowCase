"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface InfoBoxProps {
  children: ReactNode;
  variant?: "info" | "warning" | "danger";
  icon?: ReactNode;
  className?: string;
}

export function InfoBox({ children, variant = "info", icon, className }: InfoBoxProps) {
  const styles = {
    info: "bg-primary/10 border-primary/30 text-primary",
    warning: "bg-accent/10 border-accent/30 text-accent",
    danger: "bg-destructive/10 border-destructive/30 text-destructive",
  };
  return (
    <div
      className={cn(
        "rounded-lg border p-4 flex gap-3 items-start",
        styles[variant],
        className
      )}
    >
      {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
      <div className="text-sm leading-relaxed text-foreground/90 flex-1">{children}</div>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
  variant?: "default" | "primary" | "accent" | "warning" | "danger";
  className?: string;
}

export function StatBox({ label, value, variant = "default", className }: StatBoxProps) {
  const colors = {
    default: "text-foreground",
    primary: "text-primary",
    accent: "text-accent",
    warning: "text-accent",
    danger: "text-destructive",
  };
  return (
    <div className={cn("p-3 rounded-md bg-muted/40 border border-border/50", className)}>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-lg font-medium mt-1 transition-colors",
          colors[variant]
        )}
      >
        {value}
      </div>
    </div>
  );
}
