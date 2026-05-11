import type { Metadata } from "next";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `SSL Checker — Verify Certificates | ${APP_NAME}`,
  description:
    "Free SSL certificate checker. Verify HTTPS, check security headers, and test TLS connectivity for any domain.",
  openGraph: {
    title: `SSL Checker | ${APP_NAME}`,
    description: "Verify SSL certificates and security headers for any domain.",
  },
};

export default function SslCheckerPage() {
  return <ToolPageShell prefillCommand="ssl " />;
}
