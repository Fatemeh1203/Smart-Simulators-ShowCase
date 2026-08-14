"use client";

import { useState } from "react";
import { Github, Linkedin, Mail, FileText, ChevronDown } from "lucide-react";

const links = {
  github: "https://github.com/Fatemeh1203",
  linkedin: "https://www.linkedin.com/in/fatemeh-shams/",
  researchgate: "https://www.researchgate.net/profile/Fatemeh-Shams-3",
  email: "mailto:fatemeh.shams19@gmail.com",
};

interface CreatorMenuProps {
  name: string;
  role: string;
  creatorLabel: string;
  compact?: boolean;
}

export function CreatorMenu({ name, role, creatorLabel, compact }: CreatorMenuProps) {
  const [open, setOpen] = useState(false);

  if (compact) {
    // Inline icon row for footer
    return (
      <div className="flex items-center gap-2">
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="h-8 w-8 rounded-md border border-border bg-card/50 hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
        >
          <Github className="h-3.5 w-3.5" />
        </a>
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="h-8 w-8 rounded-md border border-border bg-card/50 hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
        >
          <Linkedin className="h-3.5 w-3.5" />
        </a>
        <a
          href={links.researchgate}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="ResearchGate"
          className="h-8 w-8 rounded-md border border-border bg-card/50 hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
        >
          <FileText className="h-3.5 w-3.5" />
        </a>
        <a
          href={links.email}
          aria-label="Email"
          className="h-8 w-8 rounded-md border border-border bg-card/50 hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
        >
          <Mail className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-border bg-card/60 hover:border-primary/50 hover:bg-card transition-colors text-xs"
      >
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-[11px]">
          FS
        </div>
        <div className="hidden md:block text-right leading-tight">
          <div className="font-semibold text-foreground">{name}</div>
          <div className="text-[10px] text-muted-foreground">{role}</div>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 left-0 md:left-auto md:right-0 w-64 rounded-lg border border-border bg-popover shadow-xl z-50 overflow-hidden fade-in-up">
            <div className="p-3 border-b border-border bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                  FS
                </div>
                <div>
                  <div className="font-semibold text-sm">{name}</div>
                  <div className="text-[10px] text-muted-foreground">{role}</div>
                </div>
              </div>
            </div>
            <div className="p-2">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                {creatorLabel}
              </div>
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent/20 transition-colors text-xs"
              >
                <Github className="h-3.5 w-3.5 text-primary" />
                <div>
                  <div className="font-medium">GitHub</div>
                  <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">@Fatemeh1203</div>
                </div>
              </a>
              <a
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent/20 transition-colors text-xs"
              >
                <Linkedin className="h-3.5 w-3.5 text-primary" />
                <div>
                  <div className="font-medium">LinkedIn</div>
                  <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">/in/fatemeh-shams</div>
                </div>
              </a>
              <a
                href={links.researchgate}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent/20 transition-colors text-xs"
              >
                <FileText className="h-3.5 w-3.5 text-primary" />
                <div>
                  <div className="font-medium">ResearchGate</div>
                  <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">Fatemeh Shams</div>
                </div>
              </a>
              <a
                href={links.email}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent/20 transition-colors text-xs"
              >
                <Mail className="h-3.5 w-3.5 text-primary" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">fatemeh.shams19@gmail.com</div>
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
