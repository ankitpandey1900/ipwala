"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useTerminalStore } from "@/store/terminal-store";
import { TOOLS } from "@/lib/constants";
import { playKeyClick, playSubmitSound } from "@/lib/sounds";

interface TerminalInputProps {
  onSubmit: (input: string) => void;
}

export function TerminalInput({ onSubmit }: TerminalInputProps) {
  const [value, setValue] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { isProcessing, navigateHistory, currentInput, setCurrentInput } = useTerminalStore();

  // sync from store when sidebar prefills a command
  useEffect(() => {
    if (currentInput) {
      setValue(currentInput);
      setSuggestion("");
      setCurrentInput("");
      // move cursor to end after React updates the input
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (el) {
          el.setSelectionRange(el.value.length, el.value.length);
        }
      });
    }
  }, [currentInput, setCurrentInput]);

  // auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && !isProcessing) {
      playSubmitSound();
      onSubmit(value.trim());
      setValue("");
      setSuggestion("");
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = navigateHistory("up");
      if (prev) {
        setValue(prev);
        setSuggestion("");
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = navigateHistory("down");
      setValue(next);
      setSuggestion("");
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      if (suggestion) {
        setValue(suggestion + " ");
        setSuggestion("");
      }
      return;
    }

    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      useTerminalStore.getState().clearLines();
      return;
    }
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    playKeyClick();

    const trimmed = newValue.trim().toLowerCase();
    if (trimmed.length > 0 && !trimmed.includes(" ")) {
      const match = TOOLS.find((t) => t.name.startsWith(trimmed));
      if (match && match.name !== trimmed) {
        setSuggestion(match.name);
      } else {
        const builtins = ["help", "clear"];
        const builtinMatch = builtins.find((b) => b.startsWith(trimmed) && b !== trimmed);
        setSuggestion(builtinMatch || "");
      }
    } else {
      setSuggestion("");
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center gap-2 py-0.5">
        <span className="inline-block w-3 h-3 border-2 border-terminal-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-terminal-muted text-sm">Processing...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 py-0.5">
      {/* prompt — looks like a real terminal */}
      <span className="text-terminal-success shrink-0 select-none text-sm font-bold mr-1">➜</span>
      <span className="text-terminal-accent shrink-0 select-none text-sm mr-2">~</span>

      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder=""
          className="w-full bg-transparent border-none outline-none text-sm font-mono text-terminal-text caret-transparent"
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal input"
          id="terminal-input"
        />

        {/* custom blinking cursor overlay — positioned right after the text */}
        <div className="absolute inset-0 pointer-events-none text-sm font-mono flex items-center">
          <span className="invisible whitespace-pre">{value}</span>
          <span className="w-[3px] h-[16px] bg-primary/90 rounded-full cursor-blink inline-block ml-[2px] shadow-[0_0_8px_var(--primary)]" />
        </div>

        {/* ghost suggestion */}
        {suggestion && value.trim().length > 0 && (
          <div className="absolute inset-0 pointer-events-none text-sm font-mono text-terminal-muted/25 flex items-center">
            <span className="invisible whitespace-pre">{value}</span>
            <span>{suggestion.slice(value.trim().length)}</span>
            <span className="text-terminal-muted/15 text-[10px] ml-2">tab</span>
          </div>
        )}
      </div>
    </div>
  );
}
