import type { Metadata } from "next";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `WHOIS Lookup — Domain Registration Details | ${APP_NAME}`,
  description:
    "Free WHOIS lookup. Check domain registration, expiry dates, registrar info, and nameservers using RDAP.",
  openGraph: {
    title: `WHOIS Lookup | ${APP_NAME}`,
    description: "Get domain registration details — registrar, expiry, nameservers.",
  },
};

export default function WhoisPage() {
  return <ToolPageShell prefillCommand="whois " />;
}
