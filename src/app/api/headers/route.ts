import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolveAndCheckSSRF } from "@/lib/security";

export async function GET(request: NextRequest) {
  // 1. Rate Limit
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  let rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json(
      { success: false, error: "Missing url parameter" },
      { status: 400 }
    );
  }

  // add protocol if missing
  if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    rawUrl = `https://${rawUrl}`;
  }

  try {
    // 2. Validation & SSRF Check
    const parsedUrl = new URL(rawUrl);
    const host = parsedUrl.hostname;
    
    // Check if it resolves to a private IP (acts as a gatekeeper)
    await resolveAndCheckSSRF(host);

    const startTime = Date.now();
    const res = await fetch(rawUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000)
    });
    const responseTime = Date.now() - startTime;

    const headers: Array<{ name: string; value: string }> = [];
    res.headers.forEach((value, name) => {
      headers.push({ name, value });
    });

    // sort headers alphabetically for readability
    headers.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      data: {
        url: rawUrl,
        statusCode: res.status,
        statusText: res.statusText,
        responseTime,
        headers,
        redirected: res.redirected,
        finalUrl: res.url,
      },
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Headers check failed",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
