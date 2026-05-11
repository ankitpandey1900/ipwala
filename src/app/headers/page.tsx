import type { Metadata } from "next";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `HTTP Headers — Inspect Response Headers | ${APP_NAME}`,
  description:
    "Free HTTP header checker. Inspect response headers, status codes, redirects for any URL.",
  openGraph: {
    title: `HTTP Headers | ${APP_NAME}`,
    description: "Inspect HTTP response headers for any URL.",
  },
};

export default function HeadersPage() {
  return <ToolPageShell prefillCommand="headers " />;
}
