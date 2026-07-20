import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";

export function generateStaticParams() { return BLOG_POSTS.map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.description, alternates: { canonical: `/blog/${post.slug}` }, openGraph: { type: "article", title: post.title, description: post.description } };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  return <main id="main-content" className="site-container py-14 sm:py-20"><article className="mx-auto max-w-3xl"><Link href="/blog" className="ghost-button -ml-3"><ArrowLeft aria-hidden="true" size={17} /> All guides</Link><div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-extrabold text-[var(--muted-ink)]"><span className="rounded-full bg-[var(--blush)] px-3 py-1 text-[var(--cherry-hover)]">{post.category}</span><span>{post.readTime}</span></div><h1 className="display-font mt-5 text-4xl leading-tight sm:text-6xl">{post.title}</h1><p className="mt-5 text-lg leading-8 text-[var(--muted-ink)]">{post.description}</p><div className="prose-content mt-10">{post.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</div><aside className="mt-12 rounded-[20px] bg-[var(--blush)] p-6 sm:p-8"><Sparkles aria-hidden="true" size={22} className="text-[var(--cherry)]" /><h2 className="mt-4 text-2xl font-extrabold">Try the workflow with your own source</h2><p className="mt-2 text-sm text-[var(--muted-ink)]">Paste one public URL, confirm the useful details, and create 10 editable options.</p><Link href="/pin-title-generator" className="primary-button mt-5">Open the free generator</Link></aside></article></main>;
}
