"use client";

import { useCallback, useEffect } from "react";

// global keyboard shortcut handler
// keeping this minimal — just the shortcuts we actually need
export function useKeyboardShortcuts(handlers: {
  onFocusTerminal?: () => void;
  onClearTerminal?: () => void;
  onCommandPalette?: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl+L — clear terminal
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        handlers.onClearTerminal?.();
        return;
      }

      // Ctrl+K — command palette (future)
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        handlers.onCommandPalette?.();
        return;
      }

      // "/" to focus terminal — only when not already in an input
      if (e.key === "/" && !isInputFocused()) {
        e.preventDefault();
        handlers.onFocusTerminal?.();
        return;
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || (el as HTMLElement).isContentEditable;
}
