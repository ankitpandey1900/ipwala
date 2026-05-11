"use client";

import { useRef, useCallback, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToolSidebar } from "@/components/layout/tool-sidebar";
import { Terminal } from "@/components/terminal/terminal";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard";
import { useTerminalStore } from "@/store/terminal-store";

interface ToolPageShellProps {
  prefillCommand?: string;
}

export function ToolPageShell({ prefillCommand }: ToolPageShellProps) {
  const hasPrefilledRef = useRef(false);

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
    // small delay so the store update propagates before focus
    requestAnimationFrame(() => {
      document.getElementById("terminal-input")?.focus();
    });
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ToolSidebar onSelectTool={handleSelectTool} />
        <main className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden">
          <Terminal />
        </main>
      </div>
      <Footer />
    </div>
  );
}
