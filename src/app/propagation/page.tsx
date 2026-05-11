import type { Metadata } from "next";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `DNS Propagation Checker | ${APP_NAME}`,
  description:
    "Check DNS propagation across global resolvers. Verify your DNS changes have propagated worldwide.",
  openGraph: {
    title: `DNS Propagation Checker | ${APP_NAME}`,
    description: "Check DNS propagation across Google, Cloudflare, Quad9, and more.",
  },
};

export default function PropagationPage() {
  return <ToolPageShell prefillCommand="propagation " />;
}
