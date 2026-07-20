# PinTextAI

PinTextAI is a source-first AI writing workspace for Etsy sellers, bloggers, small ecommerce operators, and Pinterest marketers. A user can paste one public product/article/landing-page URL or a manual brief, review the extracted source, and create 10 editable titles, descriptions, captions, or hashtag sets.

The interface uses an original warm cherry, cream, charcoal, and editorial-card system inspired by the visual confidence of Pinterest. It does not copy Pinterest's logo or official interface and does not imply affiliation.

## Included product surface

- Four public generator/SEO pages with anonymous first generation
- Deterministic public URL preview, editable confirmation, SSRF protections, redirect/body/time limits, and signed tokens
- Goal, angle, keyword, audience, CTA, vibe, brand profile, regenerate, copy, feedback, and soft upgrade flows
- Google sign-in with Better Auth
- D1-backed daily/monthly credits, idempotent reservations, history, saved sources, brand profiles, and abuse counters
- Three-column operator workspace plus a 50-row Pro URL/topic/CSV batch flow with source review and CSV export
- Stripe Checkout, webhook-controlled entitlements, and Customer Portal
- Turnstile, same-origin checks, security headers, sitemap, robots, manifest, legal pages, and original social preview
- OpenAI Responses API structured output with deterministic no-key demo fallback

## Local development

Requirements: Node.js 20 or newer. Node.js 24 is used in the verified local environment.

```bash
npm install
npm run db:migrate:local
npm run dev
```

The checked-in `.env.example` documents every variable. Local-only `.env.local` and `.dev.vars` use Cloudflare's published Turnstile test keys and placeholder signing secrets; both files are gitignored. Do not reuse them in production.

Run the complete quality gate:

```bash
npm run check
```

`npm run build` intentionally uses Webpack. Next.js 16 defaults to Turbopack, but the current OpenNext Cloudflare Windows preview can produce missing runtime-chunk paths with a Turbopack bundle. The Webpack build has been verified in local `workerd`.

## Cloudflare production setup

1. Create the production D1 database and replace the placeholder `database_id` in `wrangler.jsonc`:

   ```bash
   npx wrangler d1 create pintextai-db
   npm run db:migrate:remote
   ```

2. Configure these server secrets with `npx wrangler secret put NAME`:

   - `BETTER_AUTH_SECRET`
   - `SOURCE_PREVIEW_SECRET`
   - `ABUSE_HASH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `OPENAI_API_KEY`
   - `AI_GATEWAY_BASE_URL` when Cloudflare AI Gateway is enabled
   - `TURNSTILE_SECRET_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRO_MONTHLY_PRICE_ID`
   - `STRIPE_PRO_YEARLY_PRICE_ID`

3. Set the production Turnstile site key as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in the build environment.

4. In Google Cloud, add this authorized redirect URI:

   `https://pintextai.com/api/auth/callback/google`

5. In Stripe, create the $19/month and $180/year Pro prices. Point a webhook endpoint at:

   `https://pintextai.com/api/billing/webhook`

   Subscribe it to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.

6. Run a Worker preview and then deploy:

   ```bash
   npm run preview
   npm run deploy
   ```

7. Attach `pintextai.com` as the custom domain and verify the canonical URL, OAuth callback, Stripe webhook, Turnstile hostname, D1 migrations, and `/api/usage` response in production.

## Operational notes

- A credit is reserved atomically before a signed-in AI call and released when generation fails.
- Source preview never uses AI or spends a credit. Raw HTML is not persisted.
- Prices, stock, ratings, discounts, sales volume, and popularity claims are excluded from source details by default.
- Paid access changes only after a verified, idempotently processed Stripe webhook.
- Set `AI_BUDGET_MODE=closed` to stop live AI calls without disabling the rest of the site.
- `OPENAI_MODEL` defaults to `gpt-5.6-luna`; it can be changed without code changes.

The product and architecture specification is in [PinTextAI-产品需求文档-PRD-Cloudflare版.md](./PinTextAI-产品需求文档-PRD-Cloudflare版.md).
