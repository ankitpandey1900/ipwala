import { NextRequest, NextResponse } from "next/server";

// ip-api.com — free, no key, 45 req/min limit
// good enough for a dev tool, and we're proxying through our API route
const IP_API = "http://ip-api.com/json";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get("ip");

  if (!ip) {
    return NextResponse.json(
      { success: false, error: "Missing ip parameter" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${IP_API}/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`,
      { next: { revalidate: 60 } }
    );

    const data = await res.json();

    if (data.status === "fail") {
      throw new Error(data.message || "IP lookup failed");
    }

    return NextResponse.json({
      success: true,
      data: {
        ip: data.query,
        city: data.city,
        region: data.regionName,
        country: data.country,
        isp: data.isp,
        org: data.org,
        timezone: data.timezone,
        lat: data.lat,
        lon: data.lon,
        as: data.as,
        zip: data.zip,
      },
      timestamp: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "IP lookup failed",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
