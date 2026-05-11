import { NextRequest, NextResponse } from "next/server";

/**
 * IPWala Universal WHOIS Resolver
 * 
 * Uses IANA RDAP Bootstrap to find authoritative servers for any TLD.
 * Supports: .com, .net, .org, .online, .io, .ai, .in, .xyz, and 1000+ others.
 */

// Common RDAP servers for faster lookups without bootstrap
const COMMON_RDAP: Record<string, string> = {
  com: "https://rdap.verisign.com/com/v1/",
  net: "https://rdap.verisign.com/net/v1/",
  org: "https://rdap.publicinterestregistry.org/rdap/",
  online: "https://rdap.radix.host/rdap/",
  site: "https://rdap.radix.host/rdap/",
  tech: "https://rdap.radix.host/rdap/",
  store: "https://rdap.radix.host/rdap/",
  fun: "https://rdap.radix.host/rdap/",
  host: "https://rdap.radix.host/rdap/",
  press: "https://rdap.radix.host/rdap/",
  space: "https://rdap.radix.host/rdap/",
  website: "https://rdap.radix.host/rdap/",
  pw: "https://rdap.radix.host/rdap/",
  in: "https://rdap.nixiregistry.in/rdap/",
  io: "https://rdap.nic.io/",
  ai: "https://rdap.nic.ai/",
  uk: "https://rdap.nominet.uk/uk/",
  me: "https://rdap.nic.me/",
  xyz: "https://rdap.centralnic.com/rdap/",
  top: "https://rdap.zdnsgtld.com/top/",
  shop: "https://rdap.centralnic.com/rdap/",
  app: "https://rdap.google.com/",
  dev: "https://rdap.google.com/",
  co: "https://rdap.nic.co/",
};

const RDAP_REDIRECTOR = "https://rdap.org/domain";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain")?.toLowerCase();

  if (!domain) {
    return NextResponse.json(
      { success: false, error: "Missing domain parameter" },
      { status: 400 }
    );
  }

  const tld = domain.split(".").pop() || "";

  // 1. Try Authoritative RDAP Server
  const server = COMMON_RDAP[tld] || RDAP_REDIRECTOR;
  
  try {
    const result = await fetchWithRetry(`${server.endsWith("/") ? server : server + "/"}${"domain/"}${encodeURIComponent(domain)}`);
    if (result) {
      return NextResponse.json({
        success: true,
        data: parseRdapResponse(result, domain),
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.error(`Primary RDAP failed for ${domain}:`, err);
  }

  // 2. Fallback: Generic Redirector if we didn't use it already
  if (server !== RDAP_REDIRECTOR) {
    try {
      const result = await fetchWithRetry(`${RDAP_REDIRECTOR}/${encodeURIComponent(domain)}`);
      if (result) {
        return NextResponse.json({
          success: true,
          data: parseRdapResponse(result, domain),
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error(`Fallback RDAP failed for ${domain}:`, err);
    }
  }

  // 3. Last Resort: ICANN Link
  return NextResponse.json(
    {
      success: false,
      error: `WHOIS data not available via RDAP for .${tld}. Try: https://lookup.icann.org/en/lookup?name=${domain}`,
      timestamp: Date.now(),
    },
    { status: 502 }
  );
}

async function fetchWithRetry(url: string, retries = 1): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/rdap+json,application/json",
          "User-Agent": "IPWala/1.0 (Network Toolkit)",
        },
        next: { revalidate: 300 },
      });

      if (res.ok) {
        return await res.json();
      }

      if (res.status === 302 || res.status === 301) {
        const location = res.headers.get("location");
        if (location) return fetchWithRetry(location, 0);
      }

    } catch (err) {
      if (i === retries) throw err;
    }
  }
  return null;
}

function parseRdapResponse(data: any, fallbackDomain: string) {
  const nameServers = (data.nameservers || []).map(
    (ns: any) => ns.ldhName || ""
  ).filter(Boolean);

  const events = data.events || [];
  const findDate = (action: string) => 
    events.find((e: any) => e.eventAction === action)?.eventDate || "N/A";

  // Flatten entities to find roles anywhere in the tree
  const allEntities: any[] = [];
  const flatten = (entities: any[]) => {
    if (!entities) return;
    for (const e of entities) {
      allEntities.push(e);
      if (e.entities) flatten(e.entities);
    }
  };
  flatten(data.entities);
  
  // Find registrar
  const registrarEntity = allEntities.find((e: any) => e.roles?.includes("registrar"));
  let registrar = "Unknown";
  if (registrarEntity) {
    const vcard = registrarEntity.vcardArray;
    if (vcard && vcard[1]) {
      const fn = vcard[1].find((f: any) => f[0] === "fn");
      if (fn) registrar = fn[3];
    }
  }

  // Find abuse contact
  let abuseEmail = "N/A";
  const abuseEntity = allEntities.find((e: any) => 
    e.roles?.includes("abuse") || e.roles?.includes("technical")
  );
  if (abuseEntity) {
    const vcard = abuseEntity.vcardArray;
    if (vcard && vcard[1]) {
      const email = vcard[1].find((f: any) => f[0] === "email");
      if (email) abuseEmail = email[3];
    }
  }

  // Find registrant
  const registrantEntity = allEntities.find((e: any) => e.roles?.includes("registrant"));
  let registrant = "Redacted / Private";
  if (registrantEntity) {
    const vcard = registrantEntity.vcardArray;
    if (vcard && vcard[1]) {
      const org = vcard[1].find((f: any) => f[0] === "org");
      const country = vcard[1].find((f: any) => f[0] === "adr")?.[3]?.[6];
      if (org) registrant = org[3];
      if (country) registrant += ` (${country})`;
    }
  }

  return {
    domainName: data.ldhName || fallbackDomain,
    registrar,
    registrant,
    abuseEmail,
    dnssec: data.secureDNS?.delegationSigned ? "Signed" : "Unsigned",
    createdDate: findDate("registration"),
    expiryDate: findDate("expiration"),
    updatedDate: findDate("last changed"),
    nameServers,
    status: data.status || [],
    handle: data.handle || "N/A",
  };
}
