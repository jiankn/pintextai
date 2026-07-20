"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  FileSpreadsheet,
  Library,
  Link2,
  LoaderCircle,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ResultList } from "@/components/generator/result-list";
import { SourcePreview } from "@/components/generator/source-preview";
import { TurnstileWidget } from "@/components/generator/turnstile-widget";
import { VibeSelector } from "@/components/generator/vibe-selector";
import type { GeneratedItem } from "@/lib/ai/schemas";
import {
  ARTICLE_ANGLES,
  GOALS,
  LANDING_ANGLES,
  PRODUCT_ANGLES,
  type Goal,
  type GeneratorType,
  type Vibe,
} from "@/lib/product";
import type { SourceSnapshot } from "@/lib/source/schemas";

type PreviewPayload = { snapshot: SourceSnapshot; previewToken: string };
type GeneratePayload = { items: GeneratedItem[]; mode?: "live" | "demo"; remaining?: number; generationId?: string };
type BrandOption = { id: string; name: string };
type SavedSource = { id: string; title: string; summary: string; type: string };

function looksLikeUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function readError(response: Response) {
  const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string; code?: string };
  return { message: data.message || data.error || "The request could not be completed. Please try again.", code: data.code };
}

export function GeneratorExperience({ tool }: { tool: { type: GeneratorType; cta: string } }) {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [sourceId, setSourceId] = useState("");
  const [goal, setGoal] = useState<Goal>("Get clicks");
  const [vibe, setVibe] = useState<Vibe>("Natural");
  const [angle, setAngle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("");
  const [brandProfileId, setBrandProfileId] = useState("");
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  const [cta, setCta] = useState("Auto");
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState<"preview" | "generate" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [items, setItems] = useState<GeneratedItem[]>([]);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const [generationId, setGenerationId] = useState<string | undefined>();
  const confirmedToken = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/brand-profiles")
      .then(async (response) => response.ok ? response.json() as Promise<{ items?: BrandOption[] }> : { items: [] })
      .then((data) => { if (active) setBrandOptions((data.items || []).map((item) => ({ id: item.id, name: item.name }))); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("source");
    if (!selected) return;
    fetch("/api/sources")
      .then(async (response) => response.ok ? response.json() as Promise<{ items?: SavedSource[] }> : { items: [] })
      .then((data) => {
        const source = (data.items || []).find((item) => item.id === selected);
        if (!source) return;
        setSourceId(source.id);
        setInput(`${source.title}\n${source.summary}`);
        setGoal(source.type === "article" ? "Get clicks" : "Drive sales");
      })
      .catch(() => undefined);
  }, []);

  const urlMode = looksLikeUrl(input);
  const angles = useMemo(() => {
    if (preview?.snapshot.type === "article") return ARTICLE_ANGLES;
    if (preview?.snapshot.type === "landing") return LANDING_ANGLES;
    return PRODUCT_ANGLES;
  }, [preview?.snapshot.type]);

  const submitLabel = urlMode && !preview ? "Preview this source" : tool.cta;

  async function createPreview() {
    setLoading("preview");
    setError(null);
    setAuthRequired(false);
    try {
      const response = await fetch("/api/source/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: input.trim(), turnstileToken }),
      });
      if (!response.ok) throw await readError(response);
      const data = (await response.json()) as PreviewPayload;
      setPreview(data);
      setGoal(data.snapshot.type === "product" || data.snapshot.type === "landing" ? "Drive sales" : "Get clicks");
      setKeyword(data.snapshot.keywords[0] || "");
      setAngle(data.snapshot.type === "article" ? "How-to" : data.snapshot.type === "landing" ? "Outcome" : "Benefit");
    } catch (cause) {
      const message = typeof cause === "object" && cause && "message" in cause ? String(cause.message) : "We could not read this page.";
      setError(`${message} You can keep the URL for reference and describe it manually instead.`);
    } finally {
      setLoading(null);
    }
  }

  async function confirmSource() {
    if (!preview) return null;
    const response = await fetch("/api/source/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ previewToken: preview.previewToken, snapshot: preview.snapshot }),
    });
    if (!response.ok) throw await readError(response);
    const data = (await response.json()) as { confirmedSourceToken: string };
    confirmedToken.current = data.confirmedSourceToken;
    return data.confirmedSourceToken;
  }

  async function requestGeneration() {
    const topic = input.trim();
    if (topic.length < 2) {
      setError("Add at least two characters so PinTextAI has something useful to work with.");
      return null;
    }

    setLoading("generate");
    setError(null);
    setAuthRequired(false);
    try {
      const sourceToken = preview ? await confirmSource() : undefined;
      const response = await fetch(`/api/generate/${tool.type}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          type: tool.type,
          topic: preview ? undefined : topic,
          sourceId: sourceId || undefined,
          confirmedSourceToken: sourceToken,
          goal,
          vibe,
          angle: angle || undefined,
          keyword: keyword || undefined,
          audience: audience || undefined,
          brandProfileId: brandProfileId || undefined,
          cta,
          turnstileToken,
        }),
      });
      if (!response.ok) {
        const detail = await readError(response);
        if (detail.code === "AUTH_REQUIRED" || response.status === 401) setAuthRequired(true);
        throw detail;
      }
      const data = (await response.json()) as GeneratePayload;
      setItems(data.items);
      setGenerationId(data.generationId);
      setMode(data.mode || "live");
      setTurnstileReset((value) => value + 1);
      setTurnstileToken("");
      window.setTimeout(() => document.querySelector("#results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      return data.items;
    } catch (cause) {
      const message = typeof cause === "object" && cause && "message" in cause ? String(cause.message) : "Generation failed.";
      setError(message);
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function submit() {
    if (urlMode && !preview) {
      await createPreview();
      return;
    }
    await requestGeneration();
  }

  async function regenerate(index: number) {
    const next = await requestGeneration();
    if (!next) return;
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? next[0] : item)));
  }

  return (
    <>
      <div className="surface-card mx-auto w-full max-w-[920px] p-4 shadow-[var(--shadow-lg)] sm:p-6 lg:p-8">
        <label htmlFor={`source-${tool.type}`} className="text-base font-extrabold">
          What are you creating Pins for?
        </label>
        <p id={`source-help-${tool.type}`} className="mt-1 text-sm text-[var(--muted-ink)]">
          Paste a single public product, article, or landing page URL—or describe your idea in plain language.
        </p>
        <div className="relative mt-3">
          <textarea
            id={`source-${tool.type}`}
            aria-describedby={`source-help-${tool.type}`}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              if (sourceId) setSourceId("");
              if (preview && event.target.value.trim() !== preview.snapshot.url) {
                setPreview(null);
                confirmedToken.current = null;
              }
            }}
            rows={5}
            maxLength={2000}
            placeholder="Paste an Etsy/Shopify product URL, blog post URL, or describe your idea..."
            className="block min-h-36 w-full resize-y rounded-[20px] border border-[var(--border)] bg-white px-4 py-4 pr-14 text-base leading-7 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#928489] focus:border-[var(--cherry)] focus:ring-4 focus:ring-[color:var(--blush)] sm:px-5"
          />
          <span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-[var(--canvas)] text-[var(--muted-ink)]">
            {urlMode ? <Link2 aria-label="URL detected" size={17} /> : <Sparkles aria-label="Text idea" size={17} />}
          </span>
          <span className="absolute bottom-3 right-4 text-xs tabular-nums text-[var(--muted-ink)]">{input.length}/2,000</span>
        </div>

        {sourceId && <p className="mt-3 rounded-2xl bg-[var(--sage)] px-4 py-3 text-sm font-bold text-[#35502f]">Using a saved, user-confirmed source from your content library. Edit the text to switch back to a manual brief.</p>}

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm">
          <Link href="/dashboard/batch" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 font-bold text-[var(--muted-ink)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]">
            <Link2 aria-hidden="true" size={16} /> Paste multiple URLs
          </Link>
          <Link href="/dashboard/batch" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 font-bold text-[var(--muted-ink)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]">
            <FileSpreadsheet aria-hidden="true" size={16} /> Upload CSV <span className="rounded-full bg-[var(--blush)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--cherry-hover)]">Pro</span>
          </Link>
          <Link href="/dashboard/content" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 font-bold text-[var(--muted-ink)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]">
            <Library aria-hidden="true" size={16} /> Choose saved content
          </Link>
        </div>

        {loading === "preview" && (
          <div aria-label="Reading source" className="mt-5 rounded-[20px] border border-[var(--border)] bg-[var(--canvas)] p-5">
            <div className="skeleton h-5 w-40 rounded-full" />
            <div className="skeleton mt-4 h-12 rounded-2xl" />
            <div className="skeleton mt-3 h-24 rounded-2xl" />
            <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[var(--muted-ink)]">
              <LoaderCircle aria-hidden="true" className="spinner" size={17} /> Reading public page metadata…
            </p>
          </div>
        )}

        {preview && loading !== "preview" && (
          <SourcePreview snapshot={preview.snapshot} onChange={(snapshot) => setPreview({ ...preview, snapshot })} onClear={() => setPreview(null)} />
        )}

        <div className="mt-6 grid gap-6">
          <fieldset>
            <legend className="text-sm font-extrabold">What should this Pin achieve?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {GOALS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={goal === item}
                  onClick={() => setGoal(item)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-bold transition-colors duration-200 ${goal === item ? "border-[var(--cherry)] bg-[var(--blush)] text-[var(--cherry-hover)]" : "border-[var(--border)] bg-white text-[var(--muted-ink)] hover:bg-[var(--canvas)]"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <VibeSelector value={vibe} onChange={setVibe} />

          <div>
            <button type="button" className="ghost-button w-full justify-between border border-[var(--border)] px-4" aria-expanded={advanced} onClick={() => setAdvanced((value) => !value)}>
              <span className="inline-flex items-center gap-2"><SlidersHorizontal aria-hidden="true" size={17} /> Add keyword, angle, audience or CTA</span>
              <ChevronDown aria-hidden="true" size={17} className={`transition-transform duration-200 ${advanced ? "rotate-180" : ""}`} />
            </button>
            {advanced && (
              <div className="mt-3 grid gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--canvas)] p-4 sm:grid-cols-2">
                {brandOptions.length > 0 && <label className="grid gap-1.5 text-sm font-bold sm:col-span-2">Brand profile <span className="font-normal text-[var(--muted-ink)]">Optional</span><select value={brandProfileId} onChange={(event) => setBrandProfileId(event.target.value)} className="min-h-12 rounded-2xl border border-[var(--border)] bg-white px-4 font-normal outline-none focus:border-[var(--cherry)]"><option value="">No brand defaults</option>{brandOptions.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></label>}
                <label className="grid gap-1.5 text-sm font-bold">
                  Target keyword <span className="font-normal text-[var(--muted-ink)]">Optional</span>
                  <input value={keyword} onChange={(event) => setKeyword(event.target.value)} maxLength={120} className="min-h-12 rounded-2xl border border-[var(--border)] bg-white px-4 font-normal outline-none focus:border-[var(--cherry)]" placeholder="e.g. printable meal planner" />
                </label>
                <label className="grid gap-1.5 text-sm font-bold">
                  Content angle <span className="font-normal text-[var(--muted-ink)]">Optional</span>
                  <select value={angle} onChange={(event) => setAngle(event.target.value)} className="min-h-12 rounded-2xl border border-[var(--border)] bg-white px-4 font-normal outline-none focus:border-[var(--cherry)]">
                    <option value="">Auto-select</option>
                    {angles.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm font-bold">
                  Audience <span className="font-normal text-[var(--muted-ink)]">Optional</span>
                  <input value={audience} onChange={(event) => setAudience(event.target.value)} maxLength={200} className="min-h-12 rounded-2xl border border-[var(--border)] bg-white px-4 font-normal outline-none focus:border-[var(--cherry)]" placeholder="e.g. busy first-time parents" />
                </label>
                <label className="grid gap-1.5 text-sm font-bold">
                  CTA <span className="font-normal text-[var(--muted-ink)]">Optional</span>
                  <select value={cta} onChange={(event) => setCta(event.target.value)} className="min-h-12 rounded-2xl border border-[var(--border)] bg-white px-4 font-normal outline-none focus:border-[var(--cherry)]">
                    {['Auto', 'Save', 'Shop', 'Read', 'Learn'].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>
            )}
          </div>
        </div>

        <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border border-[#efc4bd] bg-[#fff0ed] p-4 text-sm text-[#7b271d]">
            <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-extrabold">We couldn’t complete that step</p>
              <p className="mt-0.5">{error}</p>
              {urlMode && !preview && <button type="button" className="mt-2 font-extrabold underline underline-offset-4" onClick={() => { setInput(`Describe this page manually: ${input}`); setError(null); }}>Describe it manually</button>}
            </div>
          </div>
        )}

        {authRequired && (
          <div className="mt-4 flex flex-col justify-between gap-3 rounded-2xl border border-[color:var(--cherry)]/20 bg-[var(--blush)] p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-extrabold">Your free preview is complete.</p>
              <p className="text-sm text-[var(--muted-ink)]">Log in with Google to get 5 credits every day and save your history.</p>
            </div>
            <Link href="/login" className="secondary-button shrink-0">Continue with Google <ArrowRight aria-hidden="true" size={17} /></Link>
          </div>
        )}

        <button type="button" onClick={submit} disabled={loading !== null || input.trim().length < 2} className="primary-button mt-5 min-h-14 w-full text-base sm:text-lg">
          {loading ? <LoaderCircle aria-hidden="true" className="spinner" size={20} /> : <Sparkles aria-hidden="true" size={20} />}
          {loading === "preview" ? "Reading your source…" : loading === "generate" ? "Creating 10 options…" : submitLabel}
        </button>
        <p className="mt-3 text-center text-xs text-[var(--muted-ink)]">
          No sign-up for your first generation. Source previews do not use AI or cost a credit.
        </p>
        {mode === "demo" && (
          <p className="mt-3 rounded-xl bg-[var(--sage)] px-3 py-2 text-center text-xs font-bold text-[#35502f]">
            Demo mode is active. Add an OpenAI key to switch the same workflow to live generation.
          </p>
        )}
      </div>

      {items.length === 10 && <ResultList items={items} generationId={generationId} onChange={setItems} onRegenerate={regenerate} />}
    </>
  );
}
