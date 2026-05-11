"use client";

import { useRef, useEffect, useCallback } from "react";
import { useTerminalStore } from "@/store/terminal-store";
import { TerminalLine } from "./terminal-line";
import { TerminalInput } from "./terminal-input";
import { parseCommand, extractDomain, isValidDomain, isValidIP } from "@/lib/command-parser";
import { executeCommand } from "@/features/command-executor";
import { TOOLS } from "@/lib/constants";

export function Terminal() {
  const { lines, addLine, addLines, pushHistory } = useTerminalStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // always scroll to bottom — like a real terminal
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [lines]);

  const focusInput = useCallback(() => {
    document.getElementById("terminal-input")?.focus();
  }, []);

  // click anywhere in terminal = focus input, just like real terminals
  const handleTerminalClick = useCallback((e: React.MouseEvent) => {
    // don't steal focus if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    focusInput();
  }, [focusInput]);

  const handleCommand = useCallback(
    async (raw: string) => {
      const parsed = parseCommand(raw);
      addLine(raw, "input");
      pushHistory(raw);

      if (!parsed.command) {
        addLine(
          `Command not found: '${parsed.raw.split(" ")[0]}'. Type 'help' for available commands.`,
          "error"
        );
        return;
      }

      if (parsed.command === "clear") {
        useTerminalStore.getState().clearLines();
        return;
      }

      if (parsed.command === "help") {
        addLines([
          { content: "", type: "output" },
          { content: "  Available Commands:", type: "info" },
          { content: "  ─────────────────────────────────────────────────", type: "output" },
          ...TOOLS.map((t) => ({
            content: `  ${t.name.padEnd(14)} ${t.description}`,
            type: "output" as const,
          })),
          { content: "", type: "output" },
          { content: "  help           Show this help message", type: "output" },
          { content: "  clear          Clear the terminal", type: "output" },
          { content: "", type: "output" },
          { content: "  Usage: <command> <domain/ip>", type: "info" },
          { content: "  Example: lookup google.com A", type: "info" },
          { content: "", type: "output" },
        ]);
        return;
      }

      if (parsed.args.length === 0) {
        const tool = TOOLS.find((t) => t.name === parsed.command);
        if (tool) {
          addLine(`Usage: ${tool.usage}`, "warning");
          addLine(`Example: ${tool.example}`, "info");
        }
        return;
      }

      const target =
        parsed.command === "headers"
          ? parsed.args[0]
          : extractDomain(parsed.args[0]);

      if (parsed.command === "ip") {
        if (!isValidIP(target) && !isValidDomain(target)) {
          addLine(`Invalid IP address or hostname: '${target}'`, "error");
          return;
        }
      } else if (parsed.command !== "headers" && !isValidDomain(target)) {
        addLine(`Invalid domain: '${target}'`, "error");
        return;
      }

      await executeCommand(parsed.command, target, parsed.args.slice(1));
    },
    [addLine, addLines, pushHistory]
  );

  return (
    <div
      className="flex flex-col flex-1 bg-terminal-bg rounded-lg border border-terminal-border overflow-hidden noise-bg"
      role="log"
      aria-label="Terminal"
    >
      {/* window chrome — macOS style dots */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-terminal-surface/50 border-b border-terminal-border/50 select-none shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-terminal-error/60 hover:bg-terminal-error/80 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-terminal-warning/60 hover:bg-terminal-warning/80 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-terminal-success/60 hover:bg-terminal-success/80 transition-colors" />
        </div>
        <span className="flex-1 text-center text-xs font-mono text-terminal-muted/60">
          ipwala — terminal
        </span>
      </div>

      {/* single scrollable area — output + input are one continuous stream */}
      <div
        ref={scrollRef}
        onClick={handleTerminalClick}
        className="flex-1 overflow-y-auto px-4 py-3 font-mono text-sm terminal-scrollbar relative z-10 cursor-text"
      >
        {/* all previous output */}
        <div className="space-y-0.5">
          {lines.map((line) => (
            <TerminalLine key={line.id} line={line} />
          ))}
        </div>

        {/* input sits right after the last line — like a real terminal */}
        <div className="mt-0.5">
          <TerminalInput onSubmit={handleCommand} />
        </div>

        {/* invisible spacer so there's always room to click below the input */}
        <div className="h-16" />
      </div>
    </div>
  );
}
