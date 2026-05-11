"use client";

import { Terminal, Keyboard } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/20 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-2.5 group cursor-default">
        {/* logo mark — minimalist & technical */}
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary/50 border border-border/50 group-hover:border-primary/50 transition-colors duration-300">
          <Terminal className="w-5 h-5 text-primary" strokeWidth={2.5} />
        </div>

        {/* wordmark — clean professional typography */}
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold tracking-tighter text-foreground uppercase">
            IP
          </span>
          <span className="text-lg font-light tracking-widest text-muted-foreground uppercase ml-0.5">
            WALA
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* command hint */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/30 text-muted-foreground/60">
          <Keyboard className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="bg-background px-1.5 py-0.5 rounded border border-border/50">/</span>
            <span className="ml-1 uppercase tracking-tighter">to focus</span>
          </div>
        </div>
      </div>
    </header>
  );
}
