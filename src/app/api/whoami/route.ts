import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Extract IP from standard headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    
    // In local dev, it might be ::1. For testing, default to a known IP if local.
    let ip = forwardedFor?.split(",")[0].trim() || realIp || "127.0.0.1";
    
    if (ip === "::1" || ip === "127.0.0.1") {
      // Fetch public IP if running locally
      const pubRes = await fetch("https://api.ipify.org?format=json");
      const pubData = await pubRes.json();
      ip = pubData.ip;
    }

    // Now look up geolocation for this IP
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    const geoData = await geoRes.json();

    if (geoData.status !== "success") {
      throw new Error(geoData.message || "Failed to geolocate IP");
    }

    return NextResponse.json({
      success: true,
      data: {
        ip: geoData.query,
        city: geoData.city,
        region: geoData.regionName,
        country: geoData.country,
        isp: geoData.isp,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve whoami data" }, { status: 500 });
  }
}
