import type { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // Everything behind a session; nothing there for a crawler.
      disallow: [
        "/dashboard/",
        "/onboarding/",
        "/marketplace",
        "/driver/dashboard/",
        "/driver/onboarding/",
        "/admin/",
        "/shortlist-reply/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
