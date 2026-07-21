import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { domainSchema } from "@/lib/validations";

// check DNS propagation across multiple resolvers using Cloudflare's DoH gateway
// each resolver is queried via Cloudflare's proxy which supports specifying upstream
const CLOUDFLARE_DOH = "https://cloudflare-dns.com/dns-query";
const GOOGLE_DOH = "https://dns.google/resolve";

interface Resolver {
  name: string;
  location: string;
  endpoint: string;
  type: "cloudflare" | "google";
}

const RESOLVERS: Resolver[] = [
  { name: "Google", location: "US", endpoint: GOOGLE_DOH, type: "google" },
  { name: "Cloudflare", location: "Global", endpoint: CLOUDFLARE_DOH, type: "cloudflare" },
  { name: "Quad9", location: "Global", endpoint: "https://dns.quad9.net:5053/dns-query", type: "cloudflare" },
];

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

  const results = await Promise.allSettled(
    RESOLVERS.map(async (resolver) => {
      const start = Date.now();
      try {
        let url: string;
        if (resolver.type === "google") {
          url = `${resolver.endpoint}?name=${encodeURIComponent(domain)}&type=${type}`;
        } else {
          url = `${resolver.endpoint}?name=${encodeURIComponent(domain)}&type=${type}`;
        }

        const res = await fetch(url, {
          headers: { Accept: "application/dns-json" },
          signal: AbortSignal.timeout(5000),
        });

        const data = await res.json();
        const responseTime = Date.now() - start;

        const records = (data.Answer || []).map((r: Record<string, unknown>) => ({
          type: type,
          value: (r.data as string)?.replace(/\.$/, ""),
          ttl: r.TTL,
        }));

        return {
          server: resolver.name,
          location: resolver.location,
          records,
          responseTime,
          status: "success" as const,
        };
      } catch {
        return {
          server: resolver.name,
          location: resolver.location,
          records: [],
          responseTime: Date.now() - start,
          status: "error" as const,
        };
      }
    })
  );

  const propagationResults = results.map((r) =>
    r.status === "fulfilled" ? r.value : {
      server: "Unknown",
      location: "Unknown",
      records: [],
      responseTime: -1,
      status: "error" as const,
    }
  );

  return NextResponse.json({
    success: true,
    data: { domain, type, results: propagationResults },
    timestamp: Date.now(),
  });
}
