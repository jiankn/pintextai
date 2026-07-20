"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="site-container grid min-h-[70dvh] place-items-center py-16 text-center"><div><p className="eyebrow">Something went wrong</p><h1 className="display-font mt-5 text-5xl">The workspace hit a snag.</h1><p className="mt-4 text-[var(--muted-ink)]">Your input is still in this browser. Retry the page before starting over.</p><button type="button" className="primary-button mt-7" onClick={reset}><RotateCcw aria-hidden="true" size={17} /> Try again</button></div></main>;
}
