"use client";

import { cn } from "@/lib/utils";

interface WhatIsCardProps {
  text: string;
  analogy?: string;
  label?: string;
  className?: string;
  variant?: "primary" | "accent" | "danger";
}

export function WhatIsCard({
  text,
  analogy,
  label,
  className,
  variant = "primary",
}: WhatIsCardProps) {
  const accentColor =
    variant === "accent"
      ? "border-accent"
      : variant === "danger"
      ? "border-destructive"
      : "border-primary";
  const bg =
    variant === "accent"
      ? "bg-accent/10"
      : variant === "danger"
      ? "bg-destructive/10"
      : "bg-primary/8";
  const textColor =
    variant === "accent" ? "text-accent" : variant === "danger" ? "text-destructive" : "text-primary";

  return (
    <div
      className={cn(
        "rounded-lg border-r-4 p-4 md:p-5 mb-6 backdrop-blur-sm",
        accentColor,
        bg,
        className
      )}
    >
      <div className={cn("text-[11px] font-semibold uppercase tracking-wider mb-2", textColor)}>
        {label}
      </div>
      <div className="text-sm leading-relaxed text-foreground/95">{text}</div>
      {analogy && (
        <div className="text-xs text-muted-foreground mt-3 italic leading-relaxed border-r-2 border-border pr-3">
          {analogy}
        </div>
      )}
    </div>
  );
}
