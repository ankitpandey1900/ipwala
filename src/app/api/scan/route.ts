import { NextRequest, NextResponse } from "next/server";
import net from "net";
import { checkRateLimit } from "@/lib/rate-limit";
import { hostSchema } from "@/lib/validations";
import { resolveAndCheckSSRF } from "@/lib/security";

const COMMON_PORTS = [
  { port: 21, service: "FTP" },
  { port: 22, service: "SSH" },
  { port: 23, service: "Telnet" },
  { port: 25, service: "SMTP" },
  { port: 53, service: "DNS" },
  { port: 80, service: "HTTP" },
  { port: 110, service: "POP3" },
  { port: 143, service: "IMAP" },
  { port: 443, service: "HTTPS" },
  { port: 3306, service: "MySQL" },
  { port: 5432, service: "PostgreSQL" },
  { port: 8080, service: "HTTP Alt" },
];

async function checkPort(host: string, port: number, timeout = 2000): Promise<string> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = "closed";

    socket.setTimeout(timeout);
    
    socket.on("connect", () => {
      status = "open";
      socket.destroy();
    });

    socket.on("timeout", () => {
      status = "timeout";
      socket.destroy();
    });

    socket.on("error", () => {
      status = "closed";
    });

    socket.on("close", () => {
      resolve(status);
    });

    socket.connect(port, host);
  });
}

export async function GET(req: NextRequest) {
  // 1. Rate Limit
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const searchParams = req.nextUrl.searchParams;
  const rawHost = searchParams.get("host");

  if (!rawHost) {
    return NextResponse.json({ error: "Host is required" }, { status: 400 });
  }

  // 2. Validation
  const validation = hostSchema.safeParse(rawHost);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const host = validation.data;

  try {
    // 3. SSRF Protection
    const safeIp = await resolveAndCheckSSRF(host);

    const results = await Promise.all(
      COMMON_PORTS.map(async (p) => {
        // Connect directly to the safe IP, not the hostname, to prevent DNS rebinding or internal resolving
        const status = await checkPort(safeIp, p.port);
        return { port: p.port, service: p.service, status };
      })
    );

    return NextResponse.json({
      success: true,
      data: { host, ports: results },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
