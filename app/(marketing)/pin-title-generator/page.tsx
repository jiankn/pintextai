import type { Metadata } from "next";
import { ToolPage } from "@/components/marketing/tool-page";
import { TOOLS } from "@/lib/product";

export const metadata: Metadata = {
  title: "Pinterest Pin Title Generator",
  description: "Generate 10 editable Pinterest Pin titles from a product URL, article URL, landing page, or simple idea.",
  alternates: { canonical: "/pin-title-generator" },
};

export default function Page() {
  return <ToolPage tool={TOOLS.title} />;
}
