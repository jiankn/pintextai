"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Check, Download, FileSpreadsheet, Link2, LoaderCircle, Play, RotateCcw, Upload } from "lucide-react";
import type { SourceSnapshot } from "@/lib/source/schemas";

type RowStatus = "ready" | "reading" | "review" | "running" | "done" | "failed";
type Row = { id: string; source: string; kind: "url" | "topic"; status: RowStatus; result?: string; error?: string; snapshot?: SourceSnapshot; previewToken?: string };

function parseLines(value: string): Row[] {
  return value.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean).slice(0, 50).map((source, index) => {
    let kind: Row["kind"] = "topic";
    try { const url = new URL(source); if (url.protocol === "http:" || url.protocol === "https:") kind = "url"; } catch { /* topic row */ }
    return { id: `${index}-${source}`, source, kind, status: "ready" };
  });
}

function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/u, "").split(/\r?\n/u).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((value) => value.trim().replace(/^"|"$/gu, ""));
  const sourceIndex = headers.findIndex((value) => ["source_url", "topic"].includes(value));
  if (sourceIndex < 0) return [];
  return lines.slice(1, 51).map((line) => line.split(",")[sourceIndex]?.trim().replace(/^"|"$/gu, "")).filter((item): item is string => Boolean(item));
}

export function BatchWorkbench() {
  const [value, setValue] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const parsed = useMemo(() => parseLines(value), [value]);

  useEffect(() => {
    fetch("/api/usage")
      .then(async (response) => await response.json() as { plan?: string })
      .then((data) => setAllowed(data.plan === "pro" || data.plan === "business"))
      .catch(() => setAllowed(false));
  }, []);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) { setMessage("CSV files must be 2 MB or smaller."); return; }
    const sources = parseCsv(await file.text());
    if (sources.length === 0) { setMessage("Add a topic or source_url column to the CSV."); return; }
    setValue(sources.join("\n")); setMessage(null);
  }

  async function preview() {
    if (parsed.length === 0) { setMessage("Paste at least one URL or topic first."); return; }
    setRunning(true); setMessage(null);
    const next = parsed.map((row) => ({ ...row })); setRows(next);
    for (let index = 0; index < next.length; index += 1) {
      if (next[index].kind !== "url") continue;
      next[index] = { ...next[index], status: "reading" }; setRows([...next]);
      try {
        const response = await fetch("/api/source/preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: next[index].source }) });
        const data = await response.json() as { snapshot?: SourceSnapshot; previewToken?: string; error?: string };
        next[index] = response.ok && data.snapshot && data.previewToken ? { ...next[index], status: "review", snapshot: data.snapshot, previewToken: data.previewToken } : { ...next[index], status: "failed", error: data.error || "Source preview failed." };
      } catch { next[index] = { ...next[index], status: "failed", error: "Network request failed while reading the source." }; }
      setRows([...next]);
    }
    setRunning(false);
    if (next.some((row) => row.status === "review")) setMessage("Review the extracted title and summary below. Generation uses your edited snapshot.");
  }

  function updateSnapshot(index: number, field: "title" | "summary", value: string) {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index && row.snapshot ? { ...row, snapshot: { ...row.snapshot, [field]: value } } : row));
  }

  async function run() {
    if (!allowed) { setMessage("Batch generation is a Pro feature. Upgrade to process up to 50 reviewed rows."); return; }
    setRunning(true); setMessage(null);
    const next = [...rows];
    for (let index = 0; index < next.length; index += 1) {
      if (next[index].status === "failed") continue;
      next[index] = { ...next[index], status: "running", error: undefined }; setRows([...next]);
      try {
        let confirmedSourceToken: string | undefined;
        if (next[index].kind === "url") {
          if (!next[index].snapshot || !next[index].previewToken) throw new Error("Preview and review this URL before generation.");
          const confirmation = await fetch("/api/source/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ previewToken: next[index].previewToken, snapshot: next[index].snapshot }) });
          const confirmationData = await confirmation.json() as { confirmedSourceToken?: string; error?: string };
          if (!confirmation.ok || !confirmationData.confirmedSourceToken) throw new Error(confirmationData.error || "Source confirmation failed.");
          confirmedSourceToken = confirmationData.confirmedSourceToken;
        }
        const response = await fetch("/api/generate/title", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ requestId: crypto.randomUUID(), type: "title", topic: next[index].kind === "topic" ? next[index].source : undefined, confirmedSourceToken, goal: "Get clicks", vibe: "Natural", cta: "Auto" }) });
        const data = await response.json() as { items?: { text: string }[]; error?: string };
        next[index] = response.ok && data.items ? { ...next[index], status: "done", result: data.items[0].text } : { ...next[index], status: "failed", error: data.error || "Generation failed." };
      } catch (cause) { next[index] = { ...next[index], status: "failed", error: cause instanceof Error ? cause.message : "Network request failed." }; }
      setRows([...next]);
    }
    setRunning(false);
  }

  function exportCsv() {
    const escape = (item: string) => `"${item.replaceAll('"', '""')}"`;
    const csv = ["source,status,result,error", ...rows.map((row) => [row.source, row.status, row.result || "", row.error || ""].map(escape).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `pintextai-batch-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  const completed = rows.filter((row) => row.status === "done").length;
  const failed = rows.filter((row) => row.status === "failed").length;
  return <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><section className="surface-card h-fit p-5 sm:p-6 xl:sticky xl:top-24"><h2 className="font-extrabold">1. Add up to 50 rows</h2><p className="mt-1 text-sm text-[var(--muted-ink)]">One public URL or topic per line. Public URLs are extracted and shown for review before AI uses them.</p><textarea value={value} onChange={(event) => setValue(event.target.value)} rows={12} placeholder={'https://shop.example.com/product-one\nhttps://blog.example.com/article-two\nMinimal nursery wall art printable'} className="mt-4 w-full resize-y rounded-[20px] border border-[var(--border)] bg-white p-4 text-sm leading-6 outline-none focus:border-[var(--cherry)]" /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-xs tabular-nums text-[var(--muted-ink)]">{parsed.length}/50 rows · {parsed.length} estimated credits</span><label className="secondary-button"><Upload aria-hidden="true" size={17} /> Upload CSV<input type="file" accept=".csv,text/csv" className="sr-only" onChange={upload} /></label></div>{allowed === false && <p className="mt-3 rounded-2xl bg-[var(--blush)] p-3 text-sm text-[var(--muted-ink)]">Generation requires Pro. You can still build and preview the batch. <Link href="/pricing" className="font-extrabold text-[var(--cherry-hover)] underline underline-offset-4">Compare plans</Link></p>}{message && <p role="status" className="mt-3 flex gap-2 rounded-xl bg-[var(--lavender)] p-3 text-sm text-[#4c4063]"><AlertCircle aria-hidden="true" className="shrink-0" size={17} /> {message}</p>}<button type="button" className="primary-button mt-4 w-full" onClick={preview} disabled={running}><FileSpreadsheet aria-hidden="true" size={17} /> {running ? "Reading sources…" : "Preview and review rows"}</button></section>
  <section className="surface-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-5"><div><h2 className="font-extrabold">2. Review and generate</h2><p className="mt-1 text-xs text-[var(--muted-ink)]">{rows.length ? `${completed} complete · ${failed} need attention · ${rows.length - completed - failed} ready or in review` : "Previewed rows will appear here."}</p></div><div className="flex gap-2">{completed > 0 && <button type="button" className="secondary-button" onClick={exportCsv}><Download aria-hidden="true" size={17} /> Export CSV</button>}{rows.length > 0 && <button type="button" className="primary-button" onClick={run} disabled={running || !allowed}>{running ? <LoaderCircle aria-hidden="true" className="spinner" size={17} /> : <Play aria-hidden="true" size={17} />} {running ? "Processing…" : "Generate reviewed rows"}</button>}</div></div>
  {rows.length === 0 ? <div className="grid min-h-[420px] place-items-center p-10 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-[20px] bg-[var(--lavender)]"><FileSpreadsheet aria-hidden="true" size={24} /></span><h3 className="mt-4 font-extrabold">No rows to review</h3><p className="mt-2 text-sm text-[var(--muted-ink)]">Paste lines or upload a UTF-8 CSV, then preview the batch.</p></div></div> : <div className="max-h-[720px] divide-y divide-[var(--border)] overflow-y-auto">{rows.map((row, index) => <div key={row.id} className="grid gap-3 p-4 sm:grid-cols-[32px_minmax(0,1fr)_auto]"><span className="pt-2 text-xs tabular-nums text-[var(--muted-ink)]">{index + 1}</span><div className="min-w-0"><p className="truncate text-sm font-bold">{row.source}</p><span className="mt-1 inline-flex items-center gap-1 text-xs capitalize text-[var(--muted-ink)]">{row.kind === "url" ? <Link2 aria-hidden="true" size={13} /> : <FileSpreadsheet aria-hidden="true" size={13} />}{row.kind}</span>{row.snapshot && <div className="mt-3 grid gap-2 rounded-2xl bg-[var(--canvas)] p-3"><label className="grid gap-1 text-xs font-bold">Confirmed title<input value={row.snapshot.title} maxLength={300} onChange={(event) => updateSnapshot(index, "title", event.target.value)} className="min-h-10 rounded-xl border border-[var(--border)] bg-white px-3 font-normal" /></label><label className="grid gap-1 text-xs font-bold">Confirmed summary<textarea value={row.snapshot.summary} maxLength={1800} rows={3} onChange={(event) => updateSnapshot(index, "summary", event.target.value)} className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-normal" /></label></div>}<p className={`mt-2 rounded-xl px-3 py-2 text-xs leading-5 ${row.error ? "bg-[#fff0ed] text-[#7b271d]" : "bg-[var(--canvas)] text-[var(--muted-ink)]"}`}>{row.result || row.error || (row.status === "review" ? "Review complete? This edited snapshot will be confirmed when you generate." : "Ready to process")}</p></div><span className={`inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-bold ${row.status === "done" ? "bg-[var(--sage)] text-[#35502f]" : row.status === "failed" ? "bg-[#fff0ed] text-[#7b271d]" : "bg-[var(--lavender)] text-[#4c4063]"}`}>{row.status === "done" ? <Check aria-hidden="true" size={13} /> : row.status === "failed" ? <RotateCcw aria-hidden="true" size={13} /> : row.status === "reading" || row.status === "running" ? <LoaderCircle aria-hidden="true" className="spinner" size={13} /> : null}{row.status}</span></div>)}</div>}</section></div>;
}
