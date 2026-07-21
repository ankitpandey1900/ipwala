import { Resolver } from "dns/promises";

// Use a custom resolver with reliable public DNS servers
// This prevents ECONNREFUSED or ENOTFOUND errors caused by restrictive local/ISP DNS settings
const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

// Check if an IP is a private, loopback, or reserved IP
export function isPrivateIP(ip: string): boolean {
  // IPv4 Private/Reserved ranges
  // 10.0.0.0/8
  // 172.16.0.0/12
  // 192.168.0.0/16
  // 127.0.0.0/8 (Loopback)
  // 169.254.0.0/16 (Link-local / AWS metadata)
  // 0.0.0.0/8 (Current network)
  // 100.64.0.0/10 (Shared address space)
  
  const parts = ip.split(".");
  if (parts.length === 4) {
    const numParts = parts.map((p) => parseInt(p, 10));
    
    if (numParts[0] === 10) return true;
    if (numParts[0] === 172 && numParts[1] >= 16 && numParts[1] <= 31) return true;
    if (numParts[0] === 192 && numParts[1] === 168) return true;
    if (numParts[0] === 127) return true;
    if (numParts[0] === 169 && numParts[1] === 254) return true;
    if (numParts[0] === 0) return true;
    if (numParts[0] === 100 && numParts[1] >= 64 && numParts[1] <= 127) return true;
  }

  // Basic IPv6 loopback and unique local address blocks
  if (ip === "::1" || ip === "::") return true;
  if (ip.toLowerCase().startsWith("fc") || ip.toLowerCase().startsWith("fd")) return true;
  if (ip.toLowerCase().startsWith("fe8") || ip.toLowerCase().startsWith("fe9") || ip.toLowerCase().startsWith("fea") || ip.toLowerCase().startsWith("feb")) return true;

  return false;
}

// Resolves a host to an IP and throws if it maps to a private/internal network
export async function resolveAndCheckSSRF(host: string): Promise<string> {
  // If the host is already an IP address
  const v4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (v4Regex.test(host)) {
    if (isPrivateIP(host)) {
      throw new Error(`SSRF blocked: Direct access to private IP ${host} is prohibited.`);
    }
    return host; // It's a safe IP
  }

  try {
    const records = await resolver.resolve4(host);
    if (!records || records.length === 0) {
      throw new Error(`Could not resolve host ${host}`);
    }

    // Check all resolved IPs to ensure none of them are private
    for (const ip of records) {
      if (isPrivateIP(ip)) {
        throw new Error(`SSRF blocked: Domain ${host} resolves to private IP ${ip}.`);
      }
    }

    return records[0]; // Return the first safe resolved IP
  } catch (error: any) {
    if (error.message.includes("SSRF blocked")) throw error;
    throw new Error(`DNS resolution failed for ${host}: ${error.message}`);
  }
}
