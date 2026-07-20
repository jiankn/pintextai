import type { Metadata } from "next";
import { ToolPage } from "@/components/marketing/tool-page";
import { TOOLS } from "@/lib/product";

export const metadata: Metadata = {
  title: "Pinterest Caption Generator",
  description: "Create 10 editable Pinterest captions for products, articles, offers, and evergreen ideas.",
  alternates: { canonical: "/pin-caption-generator" },
};

export default function Page() {
  return <ToolPage tool={TOOLS.caption} />;
}
