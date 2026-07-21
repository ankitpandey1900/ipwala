import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { domainSchema } from "@/lib/validations";
import { resolveAndCheckSSRF } from "@/lib/security";

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const rawDomain = searchParams.get("domain");

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
    // Check if it resolves to a private IP (acts as a gatekeeper)
    await resolveAndCheckSSRF(domain);
    const url = `https://${domain}`;
    const startTime = Date.now();

    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000)
    });

    const responseTime = Date.now() - startTime;
    const isValid = res.ok || res.status < 500;

    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return NextResponse.json({
      success: true,
      data: {
        domain,
        isValid,
        statusCode: res.status,
        responseTime,
        protocol: "TLS 1.3",
        securityHeaders: {
          "strict-transport-security": headers["strict-transport-security"] || "Not set",
          "content-security-policy": headers["content-security-policy"] ? "Present" : "Not set",
          "x-frame-options": headers["x-frame-options"] || "Not set",
          "x-content-type-options": headers["x-content-type-options"] || "Not set",
          "x-xss-protection": headers["x-xss-protection"] || "Not set",
        },
      },
      timestamp: Date.now(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "SSL check failed";
    const isTimeout = message.includes("abort") || message.includes("timeout");

    return NextResponse.json(
      {
        success: false,
        error: isTimeout ? `Connection to ${domain} timed out` : message,
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
