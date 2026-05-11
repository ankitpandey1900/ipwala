import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { success: false, error: "Missing url parameter" },
      { status: 400 }
    );
  }

  // add protocol if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  try {
    const startTime = Date.now();
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
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
        url,
        statusCode: res.status,
        statusText: res.statusText,
        responseTime,
        headers,
        redirected: res.redirected,
        finalUrl: res.url,
      },
      timestamp: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Headers check failed",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
