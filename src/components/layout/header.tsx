"use client";

import { Keyboard } from "lucide-react";
import Image from "next/image";

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/20 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        {/* logo mark — using uploaded ip.png */}
        <div className="flex items-center w-28 h-8 relative opacity-90 hover:opacity-100 transition-opacity mix-blend-screen">
          <Image src="/ip.png" alt="IPWala Logo" fill className="object-contain object-left" priority />
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
