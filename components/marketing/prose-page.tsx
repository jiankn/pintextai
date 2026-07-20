import type { ReactNode } from "react";

export function ProsePage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <main id="main-content" className="site-container py-14 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-font mt-5 text-4xl leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-[var(--muted-ink)]">{intro}</p>
        <div className="prose-content mt-10">{children}</div>
      </article>
    </main>
  );
}
