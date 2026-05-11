import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "/", priority: 1.0 },
    { path: "/dns-lookup", priority: 0.9 },
    { path: "/mx-lookup", priority: 0.8 },
    { path: "/whois", priority: 0.8 },
    { path: "/ip-lookup", priority: 0.8 },
    { path: "/ssl-checker", priority: 0.7 },
    { path: "/ping", priority: 0.7 },
    { path: "/headers", priority: 0.7 },
    { path: "/propagation", priority: 0.7 },
  ];

  return pages.map(({ path, priority }) => ({
    url: `${APP_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }));
}
