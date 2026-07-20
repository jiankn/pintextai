import { Rows3 } from "lucide-react";
import { BatchWorkbench } from "@/components/dashboard/batch-workbench";

export default function BatchPage() {
  return <div className="mx-auto max-w-[1400px]"><div className="mb-7"><p className="eyebrow"><Rows3 aria-hidden="true" size={14} /> Pro workflow</p><h1 className="display-font mt-3 text-3xl sm:text-4xl">Batch workbench</h1><p className="mt-2 max-w-2xl text-sm text-[var(--muted-ink)]">Paste multiple sources or upload a CSV, review every row, and spend credits only on confirmed work.</p></div><BatchWorkbench /></div>;
}
