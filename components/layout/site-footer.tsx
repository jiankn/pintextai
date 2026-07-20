import Link from "next/link";
import { Brand } from "@/components/layout/brand";

const groups = [
  {
    title: "Create",
    links: [
      ["Pin titles", "/pin-title-generator"],
      ["Descriptions", "/pin-description-generator"],
      ["Captions", "/pin-caption-generator"],
      ["Hashtags", "/pinterest-hashtag-generator"],
    ],
  },
  { title: "Company", links: [["Pricing", "/pricing"], ["Blog", "/blog"], ["Contact", "/contact"]] },
  { title: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"]] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-white/60 py-12">
      <div className="site-container grid gap-10 md:grid-cols-[1.3fr_2fr]">
        <div>
          <Brand />
          <p className="mt-4 max-w-sm text-sm text-[var(--muted-ink)]">
            A source-first AI writing workspace for Pinterest creators, sellers, and content teams.
          </p>
          <p className="mt-5 max-w-md text-xs leading-5 text-[var(--muted-ink)]">
            PinTextAI is an independent product and is not affiliated with, endorsed by, or sponsored by Pinterest.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-extrabold">{group.title}</h2>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--muted-ink)]">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="rounded-sm hover:text-[var(--cherry)]">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="site-container mt-10 border-t border-[var(--border)] pt-5 text-xs text-[var(--muted-ink)]">
        © {new Date().getFullYear()} PinTextAI.com. Your content stays private by default.
      </div>
    </footer>
  );
}
