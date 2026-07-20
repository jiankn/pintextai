import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { SITE_URL, TOOLS } from "@/lib/product";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/pricing", "/blog", "/contact", "/privacy", "/terms", ...Object.values(TOOLS).map((tool) => tool.path)];
  return [
    ...routes.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : path.includes("generator") ? 0.9 : 0.6 })),
    ...BLOG_POSTS.map((post) => ({ url: `${SITE_URL}/blog/${post.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
