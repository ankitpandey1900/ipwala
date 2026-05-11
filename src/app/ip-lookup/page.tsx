import type { Metadata } from "next";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `IP Lookup — Geolocation & ISP Info | ${APP_NAME}`,
  description:
    "Free IP lookup. Get geolocation, ISP, organization, timezone, and AS info for any IP address.",
  openGraph: {
    title: `IP Lookup | ${APP_NAME}`,
    description: "Get geolocation and ISP details for any IP address.",
  },
};

export default function IpLookupPage() {
  return <ToolPageShell prefillCommand="ip " />;
}
