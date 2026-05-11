import { NextRequest, NextResponse } from "next/server";

// simulate ping by measuring HTTPS response time
// real ICMP ping isn't possible from browser/serverless, this is the next best thing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const host = searchParams.get("host");
  const count = Math.min(parseInt(searchParams.get("count") || "4"), 6);

  if (!host) {
    return NextResponse.json(
      { success: false, error: "Missing host parameter" },
      { status: 400 }
    );
  }

  const url = host.startsWith("http") ? host : `https://${host}`;
  const results: Array<{ seq: number; time: number; status: string }> = [];

  for (let i = 0; i < count; i++) {
    try {
      const start = Date.now();
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
        // bust cache to get real times
        headers: { "Cache-Control": "no-cache" },
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
}
