import type { Metadata } from "next";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Ping Test — Check Connectivity | ${APP_NAME}`,
  description:
    "Free ping test. Measure response time and check connectivity for any host. Get min, avg, max latency stats.",
  openGraph: {
    title: `Ping Test | ${APP_NAME}`,
    description: "Test connectivity and measure response times for any host.",
  },
};

export default function PingPage() {
  return <ToolPageShell prefillCommand="ping " />;
}
