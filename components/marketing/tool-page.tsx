import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Check,
  FileSearch,
  PackageOpen,
  PenLine,
  RefreshCcw,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { GeneratorExperience } from "@/components/generator/generator-experience";
import { TOOLS, type ToolConfig } from "@/lib/product";

const audienceCards = [
  {
    icon: Store,
    title: "Etsy sellers",
    body: "Reuse listing details across new seasonal, benefit-led, gift, and lifestyle angles.",
    color: "var(--blush)",
  },
  {
    icon: BookOpenText,
    title: "Bloggers",
    body: "Turn one article into distinct Pin hooks without summarizing it by hand every time.",
    color: "var(--lavender)",
  },
  {
    icon: ShoppingBag,
    title: "Small shops",
    body: "Keep product language grounded in your real page while adapting the goal and vibe.",
    color: "var(--peach)",
  },
  {
    icon: RefreshCcw,
    title: "Pinterest marketers",
    body: "Create, review, reuse, and batch copy for more than one client or content calendar.",
    color: "var(--sage)",
  },
];

const faqs = [
  ["Do I need a Pinterest account?", "No. PinTextAI creates copy you can edit and use in your own workflow. It does not connect to, post to, or scrape Pinterest accounts in the first release."],
  ["What happens when I paste a URL?", "PinTextAI reads public JSON-LD and page metadata, then shows an editable source preview. AI generation starts only after you confirm that preview."],
  ["Will it invent product claims?", "The prompt and quality rules restrict output to your confirmed source and settings. Prices, stock, ratings, discounts, and popularity claims are excluded unless clearly provided and confirmed."],
  ["Is my content public?", "No. Inputs, source previews, and generated results are private by default and are never published as examples without separate, explicit consent and review."],
  ["How does the free plan work?", "Your first generation works without an account. Google sign-in then gives you 5 credits per day, resetting at 00:00 UTC. Each set of 10 results uses one credit."],
];

export function ToolPage({ tool, home = false }: { tool: ToolConfig; home?: boolean }) {
  const ToolIcon = tool.icon;
  const related = Object.values(TOOLS).filter((item) => item.type !== tool.type);
  const accentMap = { blush: "var(--blush)", peach: "var(--peach)", sage: "var(--sage)", lavender: "var(--lavender)" };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: tool.description,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema).replaceAll("<", "\\u003c") }} />
      <section className="relative overflow-hidden pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-70">
          <div className="absolute -left-16 top-24 h-60 w-44 rotate-[-8deg] rounded-[48px] bg-[var(--peach)]" />
          <div className="absolute -right-16 top-10 h-72 w-48 rotate-[7deg] rounded-[52px] bg-[var(--blush)]" />
          <div className="absolute bottom-32 left-[8%] h-36 w-28 rotate-[4deg] rounded-[36px] bg-[var(--sage)]" />
          <div className="absolute right-[7%] top-[42%] h-40 w-28 rotate-[-5deg] rounded-[36px] bg-[var(--lavender)]" />
        </div>
        <div className="site-container">
          <div className="mx-auto max-w-[880px] text-center">
            <span className="eyebrow"><ToolIcon aria-hidden="true" size={15} /> Source-first Pinterest copy</span>
            <h1 className="display-font mt-5 text-[clamp(2.55rem,6vw,4.5rem)] leading-[0.98] text-[var(--ink)]">
              {home ? (
                <>Your existing content,<br /><span className="text-[var(--cherry)]">ready for more Pins.</span></>
              ) : tool.headline}
            </h1>
            <p className="mx-auto mt-5 max-w-[730px] text-[18px] leading-8 text-[var(--muted-ink)] sm:text-xl">
              {home ? "Paste a product page, article, landing page, or a simple idea. Confirm the details, choose an angle, and get 10 editable titles in one flow." : tool.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold text-[var(--muted-ink)]">
              {["No sign-up first time", "10 editable options", "Private by default"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5"><Check aria-hidden="true" size={15} className="text-[var(--cherry)]" /> {item}</span>
              ))}
            </div>
          </div>
          <div className="mt-9 sm:mt-12">
            <GeneratorExperience tool={{ type: tool.type, cta: tool.cta }} />
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-white/70 py-16 sm:py-24">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow"><FileSearch aria-hidden="true" size={15} /> One source, many useful angles</span>
            <h2 className="display-font mt-4 text-4xl sm:text-5xl">A faster path from page to Pin copy</h2>
            <p className="mt-4 text-[var(--muted-ink)]">The workflow is designed around how sellers and publishers already keep their information.</p>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: PackageOpen, title: "Paste or describe", body: "Use a public product, article, or offer URL—or type a quick brief if the page does not exist yet.", color: "var(--peach)" },
              { icon: BadgeCheck, title: "Confirm the source", body: "Check the extracted title, summary, details, and suggested keywords before any AI call begins.", color: "var(--sage)" },
              { icon: PenLine, title: "Edit and reuse", body: "Generate 10 distinct options, edit in place, copy what works, and save the source for another angle.", color: "var(--lavender)" },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="surface-card p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-[18px]" style={{ background: step.color }}><Icon aria-hidden="true" size={22} /></span>
                    <span className="text-sm font-extrabold tabular-nums text-[var(--muted-ink)]">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-ink)]">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="site-container">
          <div className="grid items-end gap-6 md:grid-cols-2">
            <div>
              <span className="eyebrow"><Sparkles aria-hidden="true" size={15} /> Built for repeated promotion</span>
              <h2 className="display-font mt-4 text-4xl leading-tight sm:text-5xl">Less retyping. More usable versions.</h2>
            </div>
            <p className="max-w-xl text-[var(--muted-ink)] md:justify-self-end">PinTextAI is for people who promote the same products and content more than once—not one-off novelty prompts.</p>
          </div>
          <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-4">
            {audienceCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className={`surface-card mb-4 break-inside-avoid p-6 ${index % 2 ? "lg:pt-9 lg:pb-9" : ""}`}>
                  <span className="grid size-11 place-items-center rounded-[17px]" style={{ background: card.color }}><Icon aria-hidden="true" size={20} /></span>
                  <h3 className="mt-5 text-lg font-extrabold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-ink)]">{card.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--blush)]/45 py-16 sm:py-24">
        <div className="site-container grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <span className="eyebrow">Straight answers</span>
            <h2 className="display-font mt-4 text-4xl sm:text-5xl">Before you create</h2>
            <p className="mt-4 max-w-md text-[var(--muted-ink)]">No inflated user counts, hidden platform access, or invented “trending” data.</p>
          </div>
          <div className="grid gap-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="surface-card group p-5 open:shadow-[var(--shadow-md)]">
                <summary className="flex min-h-11 list-none items-center justify-between gap-4 font-extrabold marker:hidden">
                  {question}<span aria-hidden="true" className="text-[var(--cherry)] transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 max-w-[70ch] text-sm leading-7 text-[var(--muted-ink)]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="site-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Related tools</span>
              <h2 className="display-font mt-3 text-4xl">Build the rest of your Pin</h2>
            </div>
            <Link href="/pricing" className="ghost-button">Compare plans <ArrowRight aria-hidden="true" size={17} /></Link>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {related.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.type} href={item.path} className="surface-card group p-6 transition-[border-color,box-shadow] duration-200 hover:border-[color:var(--cherry)]/25 hover:shadow-[var(--shadow-md)]">
                  <span className="grid size-11 place-items-center rounded-[17px]" style={{ background: accentMap[item.accent] }}><Icon aria-hidden="true" size={20} /></span>
                  <h3 className="mt-5 text-lg font-extrabold">{item.shortName}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-ink)]">{item.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-[var(--cherry)]">Open generator <ArrowRight aria-hidden="true" size={16} /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
