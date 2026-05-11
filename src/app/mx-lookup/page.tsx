import type { Metadata } from "next";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `MX Lookup — Check Mail Exchange Records | ${APP_NAME}`,
  description:
    "Free MX record lookup. Check mail exchange servers, priority, and email routing for any domain.",
  openGraph: {
    title: `MX Lookup | ${APP_NAME}`,
    description: "Check mail exchange records for any domain — instant results.",
  },
};

export default function MxLookupPage() {
  return <ToolPageShell prefillCommand="mx " />;
}
