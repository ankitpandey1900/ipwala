import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { macSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const searchParams = req.nextUrl.searchParams;
  const rawMac = searchParams.get("mac");

  if (!rawMac) {
    return NextResponse.json({ error: "MAC address is required" }, { status: 400 });
  }

  const validation = macSchema.safeParse(rawMac);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  const mac = validation.data;

  try {
    const response = await fetch(`https://api.macvendors.com/${encodeURIComponent(mac)}`);
    
    if (response.status === 404) {
      return NextResponse.json({
        success: true,
        data: { mac, vendor: "Unknown Vendor / Not Found" }
      });
    }

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const vendor = await response.text();

    return NextResponse.json({
      success: true,
      data: { mac, vendor },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to lookup MAC address" }, { status: 500 });
  }
}
