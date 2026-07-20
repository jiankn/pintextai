import type { Metadata } from "next";
import { ToolPage } from "@/components/marketing/tool-page";
import { TOOLS } from "@/lib/product";

export const metadata: Metadata = {
  title: "Pinterest Description Generator",
  description: "Generate useful Pinterest descriptions grounded in your confirmed product or article details.",
  alternates: { canonical: "/pin-description-generator" },
};

export default function Page() {
  return <ToolPage tool={TOOLS.description} />;
}
