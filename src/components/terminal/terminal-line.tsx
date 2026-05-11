"use client";

import { memo } from "react";
import type { TerminalLine as TLine } from "@/types";

export const TerminalLine = memo(function TerminalLine({ line }: { line: TLine }) {
  const colorClass = getColorClass(line.type);

  // input lines show the prompt, matching the live input style
  if (line.type === "input") {
    return (
      <div className="flex items-start gap-0 py-0.5">
        <span className="text-terminal-success shrink-0 select-none text-sm font-bold mr-1">➜</span>
        <span className="text-terminal-accent shrink-0 select-none text-sm mr-2">~</span>
        <span className="text-terminal-text">{line.content}</span>
      </div>
    );
  }

  // loading state with spinner
  if (line.type === "loading") {
    return (
      <div className="flex items-center gap-2 py-0.5">
        <span className="inline-block w-3 h-3 border-2 border-terminal-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-terminal-muted">{line.content}</span>
      </div>
    );
  }

  // system messages (welcome banner, ASCII art)
  if (line.type === "system") {
    return (
      <div className="text-terminal-muted font-mono select-none py-0">
        <pre className="whitespace-pre font-mono text-xs leading-relaxed">{line.content}</pre>
      </div>
    );
  }

  // empty lines
  if (!line.content) {
    return <div className="h-2" />;
  }

  // everything else
  return (
    <div className={`py-0.5 ${colorClass}`}>
      <span className="whitespace-pre-wrap break-words">{line.content}</span>
    </div>
  );
});

function getColorClass(type: TLine["type"]): string {
  switch (type) {
    case "error":
      return "text-terminal-error";
    case "success":
      return "text-terminal-success";
    case "warning":
      return "text-terminal-warning";
    case "info":
      return "text-terminal-info";
    default:
      return "text-terminal-text";
  }
}
