"use client";

import { TOOLS } from "@/lib/constants";
import {
  Search, Globe, FileText, MapPin, Mail,
  Shield, Lock, Activity, Code,
  Radio, Network, ShieldAlert, Cpu, User
} from "lucide-react";

// map icon names to components — avoids dynamic imports
const iconMap: Record<string, React.ElementType> = {
  Search, Globe, FileText, MapPin, Mail,
  Shield, Lock, Activity, Code,
  Radio, Network, ShieldAlert, Cpu, User
};

interface ToolSidebarProps {
  onSelectTool: (command: string) => void;
}

export function ToolSidebar({ onSelectTool }: ToolSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-border/50 bg-card/30 p-3 gap-1 h-full">
      <h2 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2 shrink-0">
        Tools
      </h2>
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
        {TOOLS.map((tool) => {
          const Icon = iconMap[tool.icon] || Search;
          return (
            <button
              key={tool.name}
              onClick={() => onSelectTool(`${tool.name} `)}
              className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded-md text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left group"
            >
              <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <div className="min-w-0">
                <div className="text-xs truncate">{tool.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-border/50">
        <div className="px-2 text-[10px] font-mono text-muted-foreground/60 space-y-1">
          <div className="flex items-center justify-between">
            <span>↑↓</span>
            <span>History</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Ctrl+L</span>
            <span>Clear</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tab</span>
            <span>Autocomplete</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
