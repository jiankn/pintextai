import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <main id="main-content" className="site-container grid min-h-[70dvh] place-items-center py-16 text-center"><div><p className="eyebrow">404 · Page not found</p><h1 className="display-font mt-5 text-5xl">This Pin went off-board.</h1><p className="mt-4 text-[var(--muted-ink)]">The page may have moved, or the address may be incomplete.</p><Link href="/" className="primary-button mt-7"><ArrowLeft aria-hidden="true" size={17} /> Back to PinTextAI</Link></div></main>;
}
