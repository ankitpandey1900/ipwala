// core types for the terminal and command system

export type CommandName =
  | "lookup"
  | "mx"
  | "whois"
  | "ip"
  | "txt"
  | "ssl"
  | "ping"
  | "headers"
  | "propagation"
  | "help"
  | "clear";

export type LineType =
  | "input"
  | "output"
  | "error"
  | "info"
  | "success"
  | "warning"
  | "system"
  | "loading";

export interface TerminalLine {
  id: string;
  type: LineType;
  content: string;
  timestamp: number;
  meta?: Record<string, unknown>;
}

export interface CommandEntry {
  raw: string;
  command: CommandName | null;
  args: string[];
  timestamp: number;
}

// tool config for the sidebar and command palette
export interface ToolConfig {
  name: CommandName;
  label: string;
  description: string;
  usage: string;
  example: string;
  icon: string;
}
