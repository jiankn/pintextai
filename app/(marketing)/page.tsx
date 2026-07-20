import { ToolPage } from "@/components/marketing/tool-page";
import { TOOLS } from "@/lib/product";

export default function HomePage() {
  return <ToolPage tool={TOOLS.title} home />;
}
