// network service — centralized API client
// all calls use relative URLs which work everywhere:
// localhost, Vercel, custom domains, no config needed

interface ApiResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(path: string, params: Record<string, string>): Promise<ApiResult<T>> {
  const query = new URLSearchParams(params).toString();
  // relative URL — works on any host, any environment
  const url = `/api/${path}?${query}`;

  try {
    const res = await fetch(url);

    // handle non-200 responses properly
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.error || `Request failed (${res.status})`,
      };
    }

    return await res.json() as ApiResult<T>;
  } catch (err) {
    // network-level failures (offline, DNS resolution, etc.)
    const message = err instanceof Error ? err.message : "Network request failed";
    return { success: false, error: message };
  }
}

// --- public API ---

export async function dnsLookup(domain: string, type: string = "A") {
  return fetchApi<{
    domain: string;
    type: string;
    records: Array<{ type: string; name: string; value: string; ttl: number }>;
  }>("dns", { domain, type });
}

export async function ipLookup(ip: string) {
  return fetchApi<{
    ip: string;
    city: string;
    region: string;
    country: string;
    isp: string;
    org: string;
    timezone: string;
    lat: number;
    lon: number;
    as: string;
    zip: string;
  }>("ip", { ip });
}

export async function whoisLookup(domain: string) {
  return fetchApi<{
    domainName: string;
    registrar: string;
    registrant: string;
    abuseEmail: string;
    dnssec: string;
    createdDate: string;
    expiryDate: string;
    updatedDate: string;
    nameServers: string[];
    status: string[];
    handle: string;
  }>("whois", { domain });
}

export async function sslCheck(domain: string) {
  return fetchApi<{
    domain: string;
    isValid: boolean;
    statusCode: number;
    responseTime: number;
    protocol: string;
    securityHeaders: Record<string, string>;
  }>("ssl", { domain });
}

export async function pingHost(host: string) {
  return fetchApi<{
    host: string;
    results: Array<{ seq: number; time: number; status: string }>;
    stats: { min: number; max: number; avg: number; loss: number } | null;
    count: number;
  }>("ping", { host });
}

export async function httpHeaders(url: string) {
  return fetchApi<{
    url: string;
    statusCode: number;
    statusText: string;
    responseTime: number;
    headers: Array<{ name: string; value: string }>;
    redirected: boolean;
    finalUrl: string;
  }>("headers", { url });
}

export async function dnsPropagation(domain: string, type: string = "A") {
  return fetchApi<{
    domain: string;
    type: string;
    results: Array<{
      server: string;
      location: string;
      records: Array<{ type: string; value: string; ttl: number }>;
      responseTime: number;
      status: string;
    }>;
  }>("propagation", { domain, type });
}

export async function portScan(host: string) {
  return fetchApi<{
    host: string;
    ports: Array<{ port: number; status: string; service: string }>;
  }>("scan", { host });
}

export async function findSubdomains(domain: string) {
  return fetchApi<{
    domain: string;
    subdomains: string[];
  }>("subdomains", { domain });
}

export async function checkBlacklist(ip: string) {
  return fetchApi<{
    ip: string;
    blacklists: Array<{ name: string; listed: boolean }>;
    isListed: boolean;
  }>("blacklist", { ip });
}

export async function macLookup(mac: string) {
  return fetchApi<{
    mac: string;
    vendor: string;
  }>("mac", { mac });
}

export async function getWhoami() {
  return fetchApi<{
    ip: string;
    city: string;
    region: string;
    country: string;
    isp: string;
  }>("whoami", {});
}
