import type { CommandName, CommandEntry } from "@/types";
import { TOOLS } from "@/lib/constants";

// parse raw terminal input into a structured command
export function parseCommand(input: string): CommandEntry {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  const rawCommand = parts[0]?.toLowerCase() || "";
  const args = parts.slice(1);

  const validCommands = [...TOOLS.map((t) => t.name), "help", "clear"];
  const command = validCommands.includes(rawCommand as CommandName)
    ? (rawCommand as CommandName)
    : null;

  return {
    raw: trimmed,
    command,
    args,
    timestamp: Date.now(),
  };
}

// basic domain validation — lenient enough for real-world use
export function isValidDomain(input: string): boolean {
  // allow subdomains, hyphens, and multi-part TLDs like .edu.in .co.uk
  const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]{2,})+$/;
  return pattern.test(input);
}

// basic IP validation
export function isValidIP(input: string): boolean {
  const v4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const v6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return v4.test(input) || v6.test(input);
}

// clean up user input into a usable domain
// handles: full URLs, commas instead of dots (mobile typo), trailing dots, ports
export function extractDomain(input: string): string {
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^https?:\/\//, "");
  cleaned = cleaned.replace(/\/.*$/, "");
  // common typo: comma instead of dot (especially on mobile keyboards)
  cleaned = cleaned.replace(/,/g, ".");
  // trailing dot (valid in DNS but annoying)
  cleaned = cleaned.replace(/\.$/, "");
  // only strip well-known ports
  cleaned = cleaned.replace(/:(80|443|8080|8443)$/, "");
  return cleaned;
}

// format milliseconds to human-readable duration
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// generate a timestamp string for terminal output
export function getTimestamp(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// delay helper for simulated processing
export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
