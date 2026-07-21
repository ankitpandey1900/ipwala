import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { domainSchema } from "@/lib/validations";

// Google DNS-over-HTTPS endpoint
// this is free, no API key needed, and handles all record types
const GOOGLE_DOH = "https://dns.google/resolve";

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const rawDomain = searchParams.get("domain");
  const type = searchParams.get("type") || "A";

  if (!rawDomain) {
    return NextResponse.json(
      { success: false, error: "Missing domain parameter" },
      { status: 400 }
    );
  }

  const validation = domainSchema.safeParse(rawDomain);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  const domain = validation.data;

  try {
    const res = await fetch(`${GOOGLE_DOH}?name=${encodeURIComponent(domain)}&type=${type}`, {
      headers: { Accept: "application/dns-json" },
      // don't cache DNS responses for too long
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      throw new Error(`DNS query failed: ${res.status}`);
    }

    const data = await res.json();

    // Google DoH returns Answer array with records
    const records = (data.Answer || []).map((r: Record<string, unknown>) => ({
      type: getRecordTypeName(r.type as number),
      name: (r.name as string)?.replace(/\.$/, ""),
      value: (r.data as string)?.replace(/\.$/, ""),
      ttl: r.TTL as number,
    }));

    return NextResponse.json({
      success: true,
      data: {
        domain,
        type,
        records,
        status: data.Status,
        // include authority section if no answers found
        authority: data.Authority || [],
      },
      timestamp: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "DNS lookup failed",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

// map DNS record type numbers to names
function getRecordTypeName(typeNum: number): string {
  const types: Record<number, string> = {
    1: "A",
    2: "NS",
    5: "CNAME",
    6: "SOA",
    12: "PTR",
    15: "MX",
    16: "TXT",
    28: "AAAA",
    33: "SRV",
    43: "DS",
    46: "RRSIG",
    47: "NSEC",
    48: "DNSKEY",
    257: "CAA",
  };
  return types[typeNum] || `TYPE${typeNum}`;
}
