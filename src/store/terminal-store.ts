import { create } from "zustand";
import type { TerminalLine, LineType } from "@/types";
import { WELCOME_LINES } from "@/lib/constants";

interface TerminalState {
  lines: TerminalLine[];
  history: string[];
  historyIndex: number;
  isProcessing: boolean;
  currentInput: string;
}

interface TerminalActions {
  addLine: (content: string, type: LineType, meta?: Record<string, unknown>) => void;
  addLines: (entries: Array<{ content: string; type: LineType }>) => void;
  setProcessing: (processing: boolean) => void;
  setCurrentInput: (input: string) => void;
  pushHistory: (command: string) => void;
  navigateHistory: (direction: "up" | "down") => string;
  clearLines: () => void;
  removeLoadingLines: () => void;
  reset: () => void;
}

type TerminalStore = TerminalState & TerminalActions;

let lineCounter = 0;
const createLineId = () => `line-${++lineCounter}-${Date.now()}`;

const createWelcomeLines = (): TerminalLine[] =>
  WELCOME_LINES.map((content) => ({
    id: createLineId(),
    type: "system" as LineType,
    content,
    timestamp: Date.now(),
  }));

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  lines: createWelcomeLines(),
  history: [],
  historyIndex: -1,
  isProcessing: false,
  currentInput: "",

  addLine: (content, type, meta) => {
    const newLine: TerminalLine = {
      id: createLineId(),
      type,
      content,
      timestamp: Date.now(),
      meta,
    };
    set((state) => ({ lines: [...state.lines, newLine] }));
  },

  addLines: (entries) => {
    const newLines: TerminalLine[] = entries.map(({ content, type }) => ({
      id: createLineId(),
      type,
      content,
      timestamp: Date.now(),
    }));
    set((state) => ({ lines: [...state.lines, ...newLines] }));
  },

  setProcessing: (processing) => set({ isProcessing: processing }),
  setCurrentInput: (input) => set({ currentInput: input }),

  pushHistory: (command) => {
    const { history } = get();
    if (history[0] === command) return;
    set((state) => ({
      history: [command, ...state.history].slice(0, 50),
      historyIndex: -1,
    }));
  },

  navigateHistory: (direction) => {
    const { history, historyIndex } = get();
    if (history.length === 0) return "";
    let newIndex: number;
    if (direction === "up") {
      newIndex = Math.min(historyIndex + 1, history.length - 1);
    } else {
      newIndex = Math.max(historyIndex - 1, -1);
    }
    set({ historyIndex: newIndex });
    return newIndex >= 0 ? history[newIndex] : "";
  },

  clearLines: () => set({ lines: [] }),
  removeLoadingLines: () =>
    set((state) => ({
      lines: state.lines.filter((l) => l.type !== "loading"),
    })),
  reset: () =>
    set({
      lines: createWelcomeLines(),
      history: [],
      historyIndex: -1,
      isProcessing: false,
      currentInput: "",
    }),
}));
