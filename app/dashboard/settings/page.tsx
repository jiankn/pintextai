import { headers } from "next/headers";
import { Settings2 } from "lucide-react";
import { BrandProfileForm, type BrandProfileValue } from "@/components/dashboard/brand-profile-form";
import { getSessionFromHeaders } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";

type ProfileRow = { id: string; name: string; audience: string | null; voice: string | null; default_cta: string | null; banned_terms_json: string; keywords_json: string };
function joinJson(value: string) { try { return (JSON.parse(value) as string[]).join(", "); } catch { return ""; } }
async function loadProfiles(): Promise<{ profiles: BrandProfileValue[]; email?: string }> {
  const session = await getSessionFromHeaders(await headers());
  if (!session?.user) return { profiles: [] };
  const env = await getAppEnv();
  if (!env.DB) return { profiles: [], email: session.user.email };
  const result = await env.DB.prepare("SELECT id, name, audience, voice, default_cta, banned_terms_json, keywords_json FROM brand_profiles WHERE user_id = ? ORDER BY updated_at DESC").bind(session.user.id).all<ProfileRow>();
  return { email: session.user.email, profiles: result.results.map((item) => ({ id: item.id, name: item.name, audience: item.audience || "", voice: item.voice || "", defaultCta: item.default_cta || "", bannedTerms: joinJson(item.banned_terms_json), keywords: joinJson(item.keywords_json) })) };
}
export default async function SettingsPage() {
  const { profiles, email } = await loadProfiles();
  return <div className="mx-auto max-w-5xl"><div><p className="eyebrow"><Settings2 aria-hidden="true" size={14} /> Workspace defaults</p><h1 className="display-font mt-3 text-3xl sm:text-4xl">Settings</h1><p className="mt-2 text-sm text-[var(--muted-ink)]">Store reusable voice and audience guidance without locking individual generations.</p></div>{email && <p className="mt-5 rounded-2xl bg-[var(--canvas)] text-sm text-[var(--muted-ink)]">Signed in as <strong className="text-[var(--ink)]">{email}</strong></p>}<div className="mt-7 grid gap-5">{profiles.map((profile) => <BrandProfileForm key={profile.id} initial={profile} />)}<BrandProfileForm /></div><p className="mt-4 text-xs text-[var(--muted-ink)]">Free accounts can save one profile. Pro accounts can save up to ten.</p></div>;
}
