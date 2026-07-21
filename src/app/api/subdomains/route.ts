import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { domainSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const searchParams = req.nextUrl.searchParams;
  const rawDomain = searchParams.get("domain");

  if (!rawDomain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  const validation = domainSchema.safeParse(rawDomain);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  const domain = validation.data;

  try {
    // use HackerTarget API for much faster and reliable subdomain enumeration
    const response = await fetch(`https://api.hackertarget.com/hostsearch/?q=${domain}`, {
      signal: AbortSignal.timeout(20000), 
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from HackerTarget");
    }

    const textData = await response.text();
    const subdomains = new Set<string>();
    
    // HackerTarget returns CSV format: "subdomain.example.com,1.2.3.4"
    const lines = textData.split("\n");
    for (const line of lines) {
      const sub = line.split(",")[0]?.trim().toLowerCase();
      // Ensure it's a valid subdomain of the target
      if (sub && sub !== domain && sub.endsWith(domain) && !sub.includes("*")) {
        subdomains.add(sub);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        domain,
        subdomains: Array.from(subdomains).sort(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch subdomains" }, { status: 500 });
  }
}
