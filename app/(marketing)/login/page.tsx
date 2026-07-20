import type { Metadata } from "next";
import { LoginCard } from "@/components/auth/login-card";

export const metadata: Metadata = { title: "Log in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return <main id="main-content" className="site-container grid min-h-[calc(100dvh-180px)] place-items-center py-12"><LoginCard /></main>;
}
