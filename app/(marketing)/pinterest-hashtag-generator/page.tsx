import type { Metadata } from "next";
import { ToolPage } from "@/components/marketing/tool-page";
import { TOOLS } from "@/lib/product";

export const metadata: Metadata = {
  title: "Pinterest Hashtag Generator",
  description: "Build relevant Pinterest hashtag sets from your real content, without fake trend claims.",
  alternates: { canonical: "/pinterest-hashtag-generator" },
};

export default function Page() {
  return <ToolPage tool={TOOLS.hashtag} />;
}
