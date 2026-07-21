import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { hostSchema } from "@/lib/validations";
import { resolveAndCheckSSRF } from "@/lib/security";

// simulate ping by measuring HTTPS response time
// real ICMP ping isn't possible from browser/serverless, this is the next best thing
export async function GET(request: NextRequest) {
  // 1. Rate Limit Check
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const rawHost = searchParams.get("host");
  const count = Math.min(parseInt(searchParams.get("count") || "4"), 6);

  if (!rawHost) {
    return NextResponse.json(
      { success: false, error: "Missing host parameter" },
      { status: 400 }
    );
  }

  // 2. Input Validation
  const validation = hostSchema.safeParse(rawHost);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  
  const host = validation.data;

  try {
    // 3. SSRF Protection - resolve the host to an IP and verify it is not private
    // We rewrite the host to its IP address to ensure we don't fetch an internal service
    const safeIp = await resolveAndCheckSSRF(host);
    
    // We use the safe IP to build the URL but must pass the original Host header 
    // for SNI and virtual hosting to work properly.
    const url = `https://${safeIp}`;

    const results: Array<{ seq: number; time: number; status: string }> = [];

    for (let i = 0; i < count; i++) {
      try {
        const start = Date.now();
        const res = await fetch(url, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(5000),
          // bust cache to get real times and set correct Host header
          headers: { 
            "Cache-Control": "no-cache",
            "Host": host
          },
        });
        const time = Date.now() - start;

        results.push({
          seq: i + 1,
          time,
          status: res.ok ? "ok" : `http ${res.status}`,
        });
      } catch {
        results.push({
          seq: i + 1,
          time: -1,
          status: "timeout",
        });
      }

      // small delay between pings
      if (i < count - 1) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    const validTimes = results.filter((r) => r.time > 0).map((r) => r.time);
    const stats = validTimes.length > 0 ? {
      min: Math.min(...validTimes),
      max: Math.max(...validTimes),
      avg: Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length),
      loss: Math.round(((count - validTimes.length) / count) * 100),
    } : null;

    return NextResponse.json({
      success: true,
      data: { host, results, stats, count },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
