"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToolSidebar } from "@/components/layout/tool-sidebar";
import { Terminal } from "@/components/terminal/terminal";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard";
import { useTerminalStore } from "@/store/terminal-store";
import { TOOLS } from "@/lib/constants";
import { X, Search, Globe, FileText, MapPin, Mail, Shield, Lock, Activity, Code, Radio, Network, ShieldAlert, Cpu, User } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Search, Globe, FileText, MapPin, Mail,
  Shield, Lock, Activity, Code,
  Radio, Network, ShieldAlert, Cpu, User
};

interface ToolPageShellProps {
  prefillCommand?: string;
}

export function ToolPageShell({ prefillCommand }: ToolPageShellProps) {
  const hasPrefilledRef = useRef(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const focusTerminal = useCallback(() => {
    // directly target the input element — no ref chain needed
    document.getElementById("terminal-input")?.focus();
  }, []);

  const clearTerminal = useCallback(() => {
    useTerminalStore.getState().clearLines();
  }, []);

  useKeyboardShortcuts({
    onFocusTerminal: focusTerminal,
    onClearTerminal: clearTerminal,
  });

  // prefill via store instead of hacking native setters
  useEffect(() => {
    if (prefillCommand && !hasPrefilledRef.current) {
      hasPrefilledRef.current = true;
      setTimeout(() => {
        useTerminalStore.getState().setCurrentInput(prefillCommand);
        document.getElementById("terminal-input")?.focus();
      }, 200);
    }
  }, [prefillCommand]);

  const handleSelectTool = useCallback((command: string) => {
    useTerminalStore.getState().setCurrentInput(command);
    setIsMobileMenuOpen(false); // Close mobile menu if open
    // small delay so the store update propagates before focus
    requestAnimationFrame(() => {
      document.getElementById("terminal-input")?.focus();
    });
  }, []);

  return (
    <div className="flex flex-col h-screen relative">
      <Header onMenuToggle={() => setIsMobileMenuOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <ToolSidebar onSelectTool={handleSelectTool} />
        <main className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden">
          <Terminal />
        </main>
      </div>
      <Footer />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md lg:hidden flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border/20">
            <span className="text-sm font-semibold tracking-wide">Select a Tool</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {TOOLS.map((tool) => {
              const Icon = iconMap[tool.icon] || Search;
              return (
                <button
                  key={tool.name}
                  onClick={() => handleSelectTool(`${tool.name} `)}
                  className="flex items-center gap-3 px-3 py-3.5 w-full rounded-md text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left group"
                >
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-foreground/90">{tool.name}</span>
                    <span className="text-[10px] text-muted-foreground/70 truncate">{tool.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
