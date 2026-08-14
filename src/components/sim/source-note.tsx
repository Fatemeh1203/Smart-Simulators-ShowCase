"use client";

import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface SourceNoteProps {
  sources: string;
  className?: string;
  label: string;
}

export function SourceNote({ sources, className, label }: SourceNoteProps) {
  return (
    <div
      className={cn(
        "mt-4 pt-4 border-t border-dashed border-border/70 flex gap-2 items-start text-xs text-muted-foreground",
        className
      )}
    >
      <BookOpen className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-primary">{label}: </span>
        <span dir="ltr" className="font-mono text-[11px]">
          {sources}
        </span>
      </div>
    </div>
  );
}
