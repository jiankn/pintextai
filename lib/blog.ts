export type BlogPost = { slug: string; title: string; description: string; readTime: string; category: string; sections: { heading: string; paragraphs: string[] }[] };

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "product-page-to-pinterest-copy",
    title: "Turn a product page into Pinterest copy without retyping it",
    description: "A source-first workflow for Etsy and ecommerce sellers who need more angles with fewer factual mistakes.",
    readTime: "6 min read",
    category: "Seller workflow",
    sections: [
      { heading: "Start with the page you already maintain", paragraphs: ["A product listing already contains the language most Pinterest tools ask you to re-enter: the product name, audience, materials, use case, and distinguishing details. A better workflow reads that public page, shows the extracted details, and asks you to correct them before generation.", "The confirmation step matters. Product pages often contain navigation text, related products, outdated promotions, and customer language that should not become a brand claim."] },
      { heading: "Choose the goal before the wording", paragraphs: ["A Pin meant to earn a save needs a different promise from a Pin meant to drive a purchase. Set the goal first, then select one angle such as benefit, feature, gift, seasonal, or problem–solution.", "Generate several distinct openings from the same confirmed source. This creates a testing set without drifting away from the facts on the listing."] },
      { heading: "Review the risky details", paragraphs: ["Prices, stock, ratings, discounts, and urgency change quickly. Exclude them by default unless the current source explicitly supports them and you intentionally approve the claim. Keep the final human review in your publishing workflow."] },
    ],
  },
  {
    slug: "pinterest-copy-for-bloggers",
    title: "A repeatable Pinterest copy workflow for evergreen blog posts",
    description: "How bloggers can turn one article into multiple useful Pin angles while keeping titles and descriptions aligned with the post.",
    readTime: "5 min read",
    category: "Blog growth",
    sections: [
      { heading: "Treat the article as the source of truth", paragraphs: ["Paste the article URL and confirm its title, summary, and key takeaways. This is faster than rebuilding the brief and reduces the chance that the Pin promises something the article never delivers."] },
      { heading: "Build an angle matrix", paragraphs: ["For an evergreen guide, useful angles include a beginner version, a common mistake, a quick tip, a checklist, and a curiosity-driven question. Each should point to the same article but give readers a different reason to care.", "Match each Pin creative to its angle. The copy and image should make one coherent promise instead of competing for attention."] },
      { heading: "Keep keywords readable", paragraphs: ["Use the primary topic naturally in the title or first sentence, then support it with specific language from the article. Keyword stuffing makes copy harder to scan and is not a substitute for a useful destination page."] },
    ],
  },
  {
    slug: "batch-pinterest-content-quality-checklist",
    title: "The quality checklist to run before a 50-row Pinterest batch",
    description: "A practical review system for marketers and small teams using URL or CSV batch generation.",
    readTime: "7 min read",
    category: "Operations",
    sections: [
      { heading: "Validate inputs before spending credits", paragraphs: ["Check that each row contains one canonical public URL or a complete topic. Remove redirects, duplicates, staging domains, and pages that require login. Preview URLs and correct the structured details before generation."] },
      { heading: "Apply defaults deliberately", paragraphs: ["A brand profile can provide audience, voice, preferred calls to action, and banned terms. Batch defaults save time, but product-specific facts and article-specific angles should still be reviewed row by row."] },
      { heading: "Sample the output", paragraphs: ["Review every failed row and a meaningful sample of successful rows. Look for repeated openings, unsupported claims, awkward keywords, and mismatched calls to action. Export only after the review state is clear."] },
    ],
  },
];

export function getBlogPost(slug: string) { return BLOG_POSTS.find((post) => post.slug === slug); }
