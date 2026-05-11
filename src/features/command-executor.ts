// command executor — handles all command logic and result formatting
// separated from terminal UI to keep things clean and testable

import { useTerminalStore } from "@/store/terminal-store";
import {
  dnsLookup, ipLookup, whoisLookup, sslCheck,
  pingHost, httpHeaders, dnsPropagation,
} from "@/services/network";
import { getTimestamp, formatDuration } from "@/lib/command-parser";
import { TOOLS } from "@/lib/constants";
import type { LineType } from "@/types";

type LineEntry = { content: string; type: LineType };

// each handler calls useTerminalStore.getState() directly to get fresh state

function out(content: string, type: LineType = "output"): LineEntry {
  return { content, type };
}

function header(title: string): LineEntry[] {
  return [
    out(""),
    out(`  ${title}`, "success"),
    out("  ─────────────────────────────────────────────────"),
  ];
}

export async function executeCommand(command: string, target: string, extraArgs: string[]) {
  const store = useTerminalStore.getState();
  store.setProcessing(true);
  store.addLine(`[${getTimestamp()}] Resolving ${target}...`, "loading");

  const startTime = Date.now();

  try {
    switch (command) {
      case "lookup":
        await handleDnsLookup(target, extraArgs);
        break;
      case "mx":
        await handleMxLookup(target);
        break;
      case "txt":
        await handleTxtLookup(target);
        break;
      case "whois":
        await handleWhois(target);
        break;
      case "ip":
        await handleIpLookup(target);
        break;
      case "ssl":
        await handleSslCheck(target);
        break;
      case "ping":
        await handlePing(target);
        break;
      case "headers":
        await handleHeaders(target);
        break;
      case "propagation":
        await handlePropagation(target, extraArgs);
        break;
      default: {
        const tool = TOOLS.find((t) => t.name === command);
        store.addLine(
          tool ? `Usage: ${tool.usage}` : `Unknown command: ${command}`,
          "warning"
        );
      }
    }
  } catch (err) {
    store.addLine(
      `Error: ${err instanceof Error ? err.message : "Something went wrong"}`,
      "error"
    );
  } finally {
    const elapsed = Date.now() - startTime;
    // clean up loading spinners before showing completion
    store.removeLoadingLines();
    store.addLine(`[${getTimestamp()}] Completed in ${formatDuration(elapsed)}`, "info");
    store.addLine("", "output");
    store.setProcessing(false);
  }
}

// --- individual command handlers ---

async function handleDnsLookup(domain: string, args: string[]) {
  const store = useTerminalStore.getState();
  const recordType = args[0]?.toUpperCase() || "A";
  store.addLine(`[${getTimestamp()}] Querying ${recordType} records for ${domain}...`, "info");

  const result = await dnsLookup(domain, recordType);

  if (!result.success || !result.data) {
    store.addLine(`  DNS lookup failed: ${result.error || "No data"}`, "error");
    return;
  }

  const { records } = result.data;
  const lines: LineEntry[] = [...header(`DNS Records for ${domain} (${recordType})`)];

  if (records.length === 0) {
    lines.push(out(`  No ${recordType} records found.`, "warning"));
  } else {
    lines.push(out(`  ${"Type".padEnd(8)} ${"Name".padEnd(28)} ${"Value".padEnd(32)} TTL`));
    lines.push(out("  " + "─".repeat(80)));
    for (const r of records) {
      const name = r.name.length > 26 ? r.name.slice(0, 24) + ".." : r.name;
      const val = r.value.length > 30 ? r.value.slice(0, 28) + ".." : r.value;
      lines.push(out(`  ${r.type.padEnd(8)} ${name.padEnd(28)} ${val.padEnd(32)} ${r.ttl}`));
    }
    lines.push(out(`  ${records.length} record(s) found`, "info"));
  }

  store.addLines(lines);
}

async function handleMxLookup(domain: string) {
  const store = useTerminalStore.getState();
  store.addLine(`[${getTimestamp()}] Checking MX records for ${domain}...`, "info");

  const result = await dnsLookup(domain, "MX");

  if (!result.success || !result.data) {
    store.addLine(`  MX lookup failed: ${result.error || "No data"}`, "error");
    return;
  }

  const { records } = result.data;
  const lines: LineEntry[] = [...header(`MX Records for ${domain}`)];

  if (records.length === 0) {
    lines.push(out(`  No MX records found.`, "warning"));
  } else {
    lines.push(out(`  ${"Priority".padEnd(12)} Exchange`));
    lines.push(out("  " + "─".repeat(50)));
    // MX records come as "priority exchange" in the value
    for (const r of records) {
      const parts = r.value.split(" ");
      const priority = parts[0] || "?";
      const exchange = parts.slice(1).join(" ") || r.value;
      lines.push(out(`  ${priority.padEnd(12)} ${exchange}`));
    }
  }

  store.addLines(lines);
}

async function handleTxtLookup(domain: string) {
  const store = useTerminalStore.getState();
  store.addLine(`[${getTimestamp()}] Checking TXT/SPF/DMARC records for ${domain}...`, "info");

  const result = await dnsLookup(domain, "TXT");

  if (!result.success || !result.data) {
    store.addLine(`  TXT lookup failed: ${result.error || "No data"}`, "error");
    return;
  }

  const { records } = result.data;
  const lines: LineEntry[] = [...header(`TXT Records for ${domain}`)];

  if (records.length === 0) {
    lines.push(out(`  No TXT records found.`, "warning"));
  } else {
    for (const r of records) {
      const value = r.value.replace(/^"|"$/g, "");
      // tag SPF and DMARC records
      let tag = "";
      if (value.startsWith("v=spf1")) tag = " [SPF]";
      else if (value.startsWith("v=DMARC1")) tag = " [DMARC]";
      else if (value.startsWith("v=DKIM1")) tag = " [DKIM]";

      const label = tag ? "success" : "output";
      lines.push(out(""));
      if (tag) lines.push(out(`  ● ${tag.trim()}`, "success"));
      // wrap long TXT records
      const wrapped = wrapText(value, 70);
      for (const line of wrapped) {
        lines.push(out(`  ${line}`, label as LineType));
      }
    }
    lines.push(out(""));
    lines.push(out(`  ${records.length} TXT record(s) found`, "info"));
  }

  store.addLines(lines);
}

async function handleWhois(domain: string) {
  const store = useTerminalStore.getState();
  store.addLine(`[${getTimestamp()}] Looking up WHOIS data for ${domain}...`, "info");

  const result = await whoisLookup(domain);

  if (!result.success || !result.data) {
    store.addLine(`  WHOIS lookup failed: ${result.error || "No data"}`, "error");
    return;
  }

  const d = result.data;
  const lines: LineEntry[] = [
    ...header(`WHOIS for ${d.domainName}`),
    out(`  Domain:       ${d.domainName}`),
    out(`  Registrar:    ${d.registrar}`),
    out(`  Registrant:   ${d.registrant}`),
    out(`  Abuse Email:  ${d.abuseEmail}`),
    out(`  DNSSEC:       ${d.dnssec}`),
    out(`  Created:      ${formatDate(d.createdDate)}`),
    out(`  Expires:      ${formatDate(d.expiryDate)}`),
    out(`  Updated:      ${formatDate(d.updatedDate)}`),
    out(""),
    out("  Name Servers:", "info"),
    ...d.nameServers.map((ns) => out(`    • ${ns}`)),
    out(""),
    out("  Status:", "info"),
    ...d.status.slice(0, 5).map((s) => out(`    • ${s}`)),
  ];

  store.addLines(lines);
}

async function handleIpLookup(target: string) {
  const store = useTerminalStore.getState();
  store.addLine(`[${getTimestamp()}] Looking up IP info for ${target}...`, "info");

  const result = await ipLookup(target);

  if (!result.success || !result.data) {
    store.addLine(`  IP lookup failed: ${result.error || "No data"}`, "error");
    return;
  }

  const d = result.data;
  const lines: LineEntry[] = [
    ...header(`IP Information for ${d.ip}`),
    out(`  IP:           ${d.ip}`),
    out(`  Location:     ${d.city}, ${d.region}, ${d.country}`),
    out(`  ZIP:          ${d.zip || "N/A"}`),
    out(`  Coordinates:  ${d.lat}, ${d.lon}`),
    out(`  Timezone:     ${d.timezone}`),
    out(`  ISP:          ${d.isp}`),
    out(`  Organization: ${d.org}`),
    out(`  AS:           ${d.as}`),
  ];

  store.addLines(lines);
}

async function handleSslCheck(domain: string) {
  const store = useTerminalStore.getState();
  store.addLine(`[${getTimestamp()}] Checking SSL for ${domain}...`, "info");

  const result = await sslCheck(domain);

  if (!result.success || !result.data) {
    store.addLine(`  SSL check failed: ${result.error || "No data"}`, "error");
    return;
  }

  const d = result.data;
  const statusIcon = d.isValid ? "✓" : "✗";
  const statusType: LineType = d.isValid ? "success" : "error";

  const lines: LineEntry[] = [
    ...header(`SSL Certificate for ${domain}`),
    out(`  ${statusIcon} Certificate: ${d.isValid ? "Valid" : "Invalid"}`, statusType),
    out(`  Status Code:  ${d.statusCode}`),
    out(`  Response:     ${formatDuration(d.responseTime)}`),
    out(`  Protocol:     ${d.protocol}`),
    out(""),
    out("  Security Headers:", "info"),
    ...Object.entries(d.securityHeaders).map(([key, val]) => {
      const isSet = val !== "Not set";
      return out(`    ${isSet ? "✓" : "✗"} ${key}: ${val}`, isSet ? "success" : "warning");
    }),
  ];

  store.addLines(lines);
}

async function handlePing(host: string) {
  const store = useTerminalStore.getState();
  store.addLine(`[${getTimestamp()}] Pinging ${host}...`, "info");

  const result = await pingHost(host);

  if (!result.success || !result.data) {
    store.addLine(`  Ping failed: ${result.error || "No data"}`, "error");
    return;
  }

  const d = result.data;
  const lines: LineEntry[] = [...header(`Ping ${d.host} (${d.count} packets)`)];

  for (const r of d.results) {
    if (r.time > 0) {
      lines.push(out(`  seq=${r.seq}  time=${r.time}ms  status=${r.status}`, "success"));
    } else {
      lines.push(out(`  seq=${r.seq}  status=${r.status}`, "error"));
    }
  }

  if (d.stats) {
    lines.push(out(""));
    lines.push(out("  Statistics:", "info"));
    lines.push(out(`    min=${d.stats.min}ms  avg=${d.stats.avg}ms  max=${d.stats.max}ms  loss=${d.stats.loss}%`));
  }

  store.addLines(lines);
}

async function handleHeaders(url: string) {
  const store = useTerminalStore.getState();
  store.addLine(`[${getTimestamp()}] Fetching headers for ${url}...`, "info");

  const result = await httpHeaders(url);

  if (!result.success || !result.data) {
    store.addLine(`  Headers check failed: ${result.error || "No data"}`, "error");
    return;
  }

  const d = result.data;
  const lines: LineEntry[] = [
    ...header(`HTTP Headers for ${d.url}`),
    out(`  Status:       ${d.statusCode} ${d.statusText}`),
    out(`  Response:     ${formatDuration(d.responseTime)}`),
    out(`  Redirected:   ${d.redirected ? `Yes → ${d.finalUrl}` : "No"}`),
    out(""),
    out("  Headers:", "info"),
    out("  " + "─".repeat(60)),
  ];

  for (const h of d.headers) {
    const val = h.value.length > 50 ? h.value.slice(0, 48) + ".." : h.value;
    lines.push(out(`  ${h.name.padEnd(30)} ${val}`));
  }

  store.addLines(lines);
}

async function handlePropagation(domain: string, args: string[]) {
  const store = useTerminalStore.getState();
  const recordType = args[0]?.toUpperCase() || "A";
  store.addLine(`[${getTimestamp()}] Checking propagation for ${domain} (${recordType})...`, "info");

  const result = await dnsPropagation(domain, recordType);

  if (!result.success || !result.data) {
    store.addLine(`  Propagation check failed: ${result.error || "No data"}`, "error");
    return;
  }

  const lines: LineEntry[] = [
    ...header(`DNS Propagation for ${domain} (${recordType})`),
  ];

  for (const r of result.data.results) {
    const statusIcon = r.status === "success" ? "✓" : "✗";
    const statusType: LineType = r.status === "success" ? "success" : "error";
    lines.push(out(""));
    lines.push(out(`  ${statusIcon} ${r.server} (${r.location}) — ${r.responseTime}ms`, statusType));

    if (r.records.length > 0) {
      for (const rec of r.records) {
        lines.push(out(`    → ${rec.value}  TTL: ${rec.ttl}`));
      }
    } else {
      lines.push(out(`    No records returned`, "warning"));
    }
  }

  store.addLines(lines);
}

// --- helpers ---

function formatDate(iso: string): string {
  if (!iso || iso === "N/A") return "N/A";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function wrapText(text: string, maxLen: number): string[] {
  const lines: string[] = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let breakPoint = remaining.lastIndexOf(" ", maxLen);
    if (breakPoint === -1) breakPoint = maxLen;
    lines.push(remaining.slice(0, breakPoint));
    remaining = remaining.slice(breakPoint).trimStart();
  }
  if (remaining) lines.push(remaining);
  return lines;
}
