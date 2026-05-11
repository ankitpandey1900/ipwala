import type { Metadata } from "next";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `DNS Lookup — Check DNS Records | ${APP_NAME}`,
  description:
    "Free DNS lookup tool. Query A, AAAA, CNAME, MX, NS, TXT, SOA records for any domain. Real-time results from Google DNS.",
  openGraph: {
    title: `DNS Lookup | ${APP_NAME}`,
    description: "Query DNS records for any domain — fast, free, developer-friendly.",
  },
};

export default function DnsLookupPage() {
  return <ToolPageShell prefillCommand="lookup " />;
}
