"use client";

import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function HomeContent() {
  const searchParams = useSearchParams();
  const cmd = searchParams.get("cmd") || undefined;
  return <ToolPageShell prefillCommand={cmd} />;
}

// home page is just the shell with an optional prefilled command from URL
export default function HomePage() {
  return (
    <Suspense fallback={<ToolPageShell />}>
      <HomeContent />
    </Suspense>
  );
}
