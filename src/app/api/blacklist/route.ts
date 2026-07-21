import { NextRequest, NextResponse } from "next/server";
import dns from "dns/promises";
import { checkRateLimit } from "@/lib/rate-limit";
import { ipSchema } from "@/lib/validations";

// Popular DNSBL providers
const BLACKLISTS = [
  "zen.spamhaus.org",
  "b.barracudacentral.org",
  "bl.spamcop.net",
  "cbl.abuseat.org",
  "dnsbl.sorbs.net",
  "dnsbl-1.uceprotect.net",
  "spam.dnsbl.sorbs.net"
];

// Reverses an IPv4 address (e.g. 192.168.1.1 -> 1.1.168.192)
function reverseIp(ip: string): string | null {
  const parts = ip.split(".");
  if (parts.length === 4) {
    return parts.reverse().join(".");
  }
  return null; // IPv6 not easily supported by all DNSBLs in this format
}

export async function GET(req: NextRequest) {
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const searchParams = req.nextUrl.searchParams;
  const rawIp = searchParams.get("ip");

  if (!rawIp) {
    return NextResponse.json({ error: "IP is required" }, { status: 400 });
  }

  const validation = ipSchema.safeParse(rawIp);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  const ip = validation.data;

  const reversed = reverseIp(ip);
  if (!reversed) {
    return NextResponse.json({ error: "Only IPv4 addresses are supported for blacklist checks" }, { status: 400 });
  }

  try {
    const checkPromises = BLACKLISTS.map(async (bl) => {
      const query = `${reversed}.${bl}`;
      try {
        const addresses = await dns.resolve4(query);
        // If it resolves (usually to 127.0.0.x), it is listed
        return { name: bl, listed: addresses.length > 0 };
      } catch (err: any) {
        // ENOTFOUND means not listed
        return { name: bl, listed: false };
      }
    });

    const results = await Promise.all(checkPromises);
    const isListed = results.some((r) => r.listed);

    return NextResponse.json({
      success: true,
      data: {
        ip,
        isListed,
        blacklists: results,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to check blacklists" }, { status: 500 });
  }
}
