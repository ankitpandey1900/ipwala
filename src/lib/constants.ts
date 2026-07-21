import type { ToolConfig } from "@/types";

export const APP_NAME = "IPWala";
export const APP_DESCRIPTION =
  "Modern DNS & Network Toolkit — built for developers who prefer the terminal.";
export const APP_URL = "https://ipwala.dev";
export const APP_VERSION = "0.1.0";

// tool definitions — used for command parsing, help text, sidebar
export const TOOLS: ToolConfig[] = [
  {
    name: "lookup",
    label: "DNS Lookup",
    description: "Query DNS records for any domain",
    usage: "lookup <domain> [record-type]",
    example: "lookup google.com A",
    icon: "Search",
  },
  {
    name: "propagation",
    label: "DNS Propagation",
    description: "Check DNS propagation across global resolvers",
    usage: "propagation <domain> [record-type]",
    example: "propagation example.com A",
    icon: "Globe",
  },
  {
    name: "whois",
    label: "WHOIS Lookup",
    description: "Get domain registration details",
    usage: "whois <domain>",
    example: "whois github.com",
    icon: "FileText",
  },
  {
    name: "ip",
    label: "IP Lookup",
    description: "Get geolocation and ISP info for an IP",
    usage: "ip <address>",
    example: "ip 8.8.8.8",
    icon: "MapPin",
  },
  {
    name: "mx",
    label: "MX Records",
    description: "Check mail exchange records",
    usage: "mx <domain>",
    example: "mx gmail.com",
    icon: "Mail",
  },
  {
    name: "txt",
    label: "TXT/SPF/DMARC",
    description: "Check TXT records including SPF and DMARC",
    usage: "txt <domain>",
    example: "txt google.com",
    icon: "Shield",
  },
  {
    name: "ssl",
    label: "SSL Checker",
    description: "Verify SSL certificate details",
    usage: "ssl <domain>",
    example: "ssl github.com",
    icon: "Lock",
  },
  {
    name: "ping",
    label: "Ping Test",
    description: "Test connectivity and response time",
    usage: "ping <host>",
    example: "ping cloudflare.com",
    icon: "Activity",
  },
  {
    name: "headers",
    label: "HTTP Headers",
    description: "Inspect HTTP response headers",
    usage: "headers <url>",
    example: "headers https://vercel.com",
    icon: "Code",
  },
  {
    name: "scan",
    label: "Port Scanner",
    description: "Scan common ports on a host",
    usage: "scan <host>",
    example: "scan google.com",
    icon: "Radio",
  },
  {
    name: "subdomains",
    label: "Subdomain Finder",
    description: "Find subdomains for a domain",
    usage: "subdomains <domain>",
    example: "subdomains example.com",
    icon: "Network",
  },
  {
    name: "blacklist",
    label: "Blacklist Checker",
    description: "Check if an IP is on spam blacklists",
    usage: "blacklist <ip>",
    example: "blacklist 8.8.8.8",
    icon: "ShieldAlert",
  },
  {
    name: "mac",
    label: "MAC Lookup",
    description: "Identify vendor from a MAC address",
    usage: "mac <address>",
    example: "mac 00:1A:2B:3C:4D:5E",
    icon: "Cpu",
  },
  {
    name: "whoami",
    label: "My IP & Location",
    description: "Show your current IP and location",
    usage: "whoami",
    example: "whoami",
    icon: "User",
  },
];

// DNS resolvers used for propagation checks
export const DNS_RESOLVERS = [
  { name: "Google", ip: "8.8.8.8", location: "United States" },
  { name: "Cloudflare", ip: "1.1.1.1", location: "Global CDN" },
  { name: "Quad9", ip: "9.9.9.9", location: "Global CDN" },
  { name: "OpenDNS", ip: "208.67.222.222", location: "United States" },
  { name: "Comodo", ip: "8.26.56.26", location: "United States" },
  { name: "CleanBrowsing", ip: "185.228.168.9", location: "Global CDN" },
] as const;

export const DNS_RECORD_TYPES = [
  "A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "SRV", "PTR", "CAA",
] as const;

export type DNSRecordType = (typeof DNS_RECORD_TYPES)[number];

// keyboard shortcuts
export const SHORTCUTS = {
  focusTerminal: { key: "/", label: "Focus Terminal" },
  clearTerminal: { key: "l", ctrl: true, label: "Clear" },
  commandPalette: { key: "k", ctrl: true, label: "Command Palette" },
} as const;

// welcome message
export const WELCOME_LINES = [
  `  _____ _______          __    _       `,
  ` |_   _|  __ \\ \\        / /   | |      `,
  `   | | | |__) \\ \\  /\\  / /__ _| | __ _ `,
  `   | | |  ___/ \\ \\/  \\/ / _\` | |/ _\` |`,
  `  _| |_| |      \\  /\\  / (_| | | (_| |`,
  ` |_____|_|       \\/  \\/ \\__,_|_|\\__,_|`,
  "",
  ` DNS & Network Toolkit — v${APP_VERSION}`,
  " Type 'help' to see available commands.",
  "",
];
