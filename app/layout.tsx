import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/product";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PinTextAI — Pinterest copy from content you already have", template: "%s | PinTextAI" },
  description:
    "Create Pinterest titles, descriptions, captions, and hashtag sets from a product page, article, landing page, or simple idea.",
  applicationName: "PinTextAI",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "PinTextAI",
    title: "PinTextAI — Pinterest copy from content you already have",
    description: "Paste a URL or idea. Confirm the source. Get 10 editable Pin copy options.",
    url: SITE_URL,
    images: [{ url: "/pintextai-social-preview.png", width: 1680, height: 941, alt: "One source becoming multiple editable content cards in the PinTextAI visual system" }],
  },
  twitter: { card: "summary_large_image", title: "PinTextAI", description: "A source-first AI writing workspace for Pinterest creators.", images: ["/pintextai-social-preview.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF8F4",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
