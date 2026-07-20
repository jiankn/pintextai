import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog";

export const metadata: Metadata = { title: "Pinterest Copy Workflow Guides", description: "Practical source-first Pinterest writing guides for sellers, bloggers, and content teams.", alternates: { canonical: "/blog" } };

export default function BlogPage() {
  return <main id="main-content" className="site-container py-14 sm:py-20"><div className="max-w-3xl"><p className="eyebrow"><BookOpen aria-hidden="true" size={14} /> Practical guides</p><h1 className="display-font mt-5 text-4xl sm:text-6xl">Build a calmer Pinterest content system</h1><p className="mt-5 text-lg text-[var(--muted-ink)]">Source-first workflows for creating useful Pin copy without retyping your catalog or inventing claims.</p></div>
    <div className="mt-12 grid gap-5 lg:grid-cols-3">{BLOG_POSTS.map((post, index) => <article key={post.slug} className="surface-card flex min-h-[310px] flex-col p-6" style={{ background: index === 0 ? "var(--blush)" : index === 1 ? "var(--sage)" : "var(--lavender)" }}><div><span className="rounded-full bg-white/70 px-3 py-1 text-xs font-extrabold">{post.category}</span><h2 className="mt-5 text-2xl font-extrabold leading-tight"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2><p className="mt-3 text-sm text-[var(--muted-ink)]">{post.description}</p></div><Link href={`/blog/${post.slug}`} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-6 text-sm font-extrabold text-[var(--cherry-hover)]">Read guide · {post.readTime} <ArrowRight aria-hidden="true" size={16} /></Link></article>)}</div></main>;
}
