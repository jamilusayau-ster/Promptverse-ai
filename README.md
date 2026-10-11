# PromptVerse AI

**Better prompts. Better creations.**

This is Phase 1 of the PromptVerse AI build: project scaffold, database schema,
and the homepage. It is safe to push to GitHub and deploy to Netlify right now
— later phases add Explore/Search, Auth, Payments, Rewarded Ads, and Admin on
top of this same project without you needing to restart anything.

---

## 1. Put this project on GitHub (from your phone)

1. Open the **GitHub app** (or github.com in your browser) → **New repository**
   → name it `promptverse-ai` → Create.
2. In this chat, download the project as a zip (I'll give you the file).
3. Easiest mobile path: use the **GitHub app's "Upload files"** on the repo,
   or unzip and upload via github.com's drag-and-drop **Add file → Upload files**.
   Upload the whole folder contents (keep the same folder structure).
4. Commit directly to the `main` branch.

## 2. Set up Supabase (you said this is already done ✅)

In your Supabase project:

1. Go to **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this project, copy all of it, paste it in,
   and click **Run**. This creates every table, security rule, the storage
   bucket, and starter categories in one step.
3. Go to **Authentication → Providers** and make sure **Email** is enabled.
4. Go to **Project Settings → API** and copy:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep secret,
     server-only, never share this one)

## 3. Set up Paystack (you said this is already done ✅)

From your Paystack dashboard → **Settings → API Keys & Webhooks**:
- `Public Key` → `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `Secret Key` → `PAYSTACK_SECRET_KEY` (⚠️ server-only)

(Payment routes are built in Phase 4 — for now just have these keys ready.)

## 4. Deploy to Netlify

1. Netlify → **Add new site → Import an existing project → GitHub** →
   select `promptverse-ai`.
2. Build settings are already configured via `netlify.toml` — you don't need
   to change anything.
3. Before deploying, go to **Site configuration → Environment variables** and
   add every variable from `.env.example`, using your real Supabase/Paystack
   values. Leave the Google Ads ones blank for now (added in a later phase).
4. Click **Deploy site**.
5. Also install the **Next.js Runtime** plugin if Netlify prompts you — it's
   already declared in `netlify.toml` and installs automatically.

## 5. Local preview (optional — not required to deploy)

If you ever use a laptop:

```bash
npm install
cp .env.example .env.local   # then fill in your real keys
npm run dev
```

---

## What's in Phase 1

```
promptverse-ai/
├─ app/
│  ├─ layout.tsx        Root layout, fonts, SEO defaults
│  ├─ globals.css        Tailwind + design tokens
│  └─ page.tsx           Homepage (hero, featured prompts)
├─ components/
│  ├─ Header.tsx         Responsive nav + mobile menu
│  ├─ Footer.tsx
│  └─ PromptCard.tsx     Reusable prompt card
├─ lib/
│  ├─ types.ts           Shared TypeScript types
│  └─ supabase/
│     ├─ client.ts       Browser client (anon key only)
│     ├─ server.ts       Server Components client (anon key, respects RLS)
│     └─ admin.ts        Service-role client — server routes ONLY, never client-side
├─ supabase/
│  └─ schema.sql         Full database schema + Row Level Security + seed categories
├─ netlify.toml
└─ .env.example
```

### Security notes already built in
- The `prompts` table's `master_prompt` column is never exposed for premium
  rows through the public `prompts_public` view — public pages must query
  that view, not the table directly.
- `SUPABASE_SERVICE_ROLE_KEY` and `PAYSTACK_SECRET_KEY` are never prefixed
  with `NEXT_PUBLIC_`, so Next.js never ships them to the browser.
- Row Level Security is on for every table; only admins (role = `admin` in
  `profiles`, auto-granted to `jamilusayau@gmail.com` on signup) can write
  prompts/categories or read payments and unlocks across all users.

## Phase 2 — Explore, Categories, Prompt Detail (new in this update)

New pages, all reading live data from Supabase's `prompts_public` view:

- `/explore` — search + filters (Free/Premium, category, sort) + prompt grid
- `/categories` — all categories
- `/categories/[slug]` — prompts within one category
- `/prompts/[slug]` — full prompt detail page. Free prompts show the real
  master prompt with a working **Copy Prompt** button (Android Chrome + iOS
  Safari safe, with a fallback for restricted clipboard permissions).
  Premium prompts show a locked box instead — the actual unlock flow
  (rewarded ads + Paystack) is built in Phase 4/5.
- Homepage now pulls real **featured** prompts from Supabase automatically;
  it only falls back to the sample cards if your database has none yet.

### Two things to run in Supabase before you redeploy

1. SQL Editor → run `supabase/migrations/002_phase2_view_count.sql`
   (lets the site safely increment a prompt's view count).
2. *(Optional, recommended for testing)* SQL Editor → run
   `supabase/migrations/003_sample_prompts.sql` — adds one real free prompt
   and one real premium prompt so Explore/Category/Detail pages have
   something to show before you build the Admin Dashboard in Phase 6.

Then push this update to GitHub the same way as before (`git add .` →
`git commit -m "Phase 2"` → `git push`) — Netlify redeploys automatically.

## Phase 3 - Login, Register, Dashboard

New pages: `/login`, `/register`, `/forgot-password`, `/reset-password`,
`/dashboard` (profile, unlocked prompts, purchase history, favorites).
`/dashboard` and `/admin` require login (enforced in `middleware.ts`).
The header switches to "My Dashboard" when you are logged in.
Browsing the site never requires an account.

### Supabase settings to change (one time)

In Supabase: **Authentication > URL Configuration**
- Site URL: your Netlify address, for example `https://promtverse.netlify.app`
- Redirect URLs: add `https://promtverse.netlify.app/**`

Without this, confirmation and password-reset emails will link to the wrong place.

Optional while testing: **Authentication > Providers > Email** and turn off
"Confirm email" so new accounts can log in immediately.

### Becoming admin
Register on the site using `jamilusayau@gmail.com`. The database trigger
gives that email the `admin` role automatically. You will see an Admin
button on your dashboard.

## Phase 4 - Paystack payments (premium unlock)

Flow: buyer taps Unlock > server creates a pending payment (price comes from
the database, default 1000 NGN) > Paystack popup > server asks Paystack to
verify (reference, amount, currency, email) > only then an unlock is saved.
The frontend "success" callback alone never unlocks anything.

- `POST /api/payments/initialize` creates the transaction
- `POST /api/payments/verify` confirms with Paystack and unlocks
- `POST /api/payments/webhook` lets Paystack confirm even if the buyer closes the page
- `GET /api/prompts/[slug]/unlocked` is the ONLY route that returns a premium prompt, and only after a verified unlock
- Guests are remembered with a signed, httpOnly cookie; logged-in users by their account/email

### Do these once
1. Supabase SQL Editor: run `supabase/migrations/004_phase4_payments.sql`.
2. Netlify > Environment variables: add `UNLOCK_COOKIE_SECRET` (long random text) and `PROMPT_UNLOCK_PRICE_NGN` = 1000, then redeploy.
3. Paystack > Settings > API Keys & Webhooks > Webhook URL:
   `https://YOUR-SITE.netlify.app/api/payments/webhook`
4. Test first with your Paystack TEST keys (pk_test / sk_test) before going live.

Ad unlock (Watch 3 Ads) shows as "Coming soon" until Phase 5.

## What's next (Phase 5)

Rewarded ads unlock with Google Ad Manager, server-side sessions, rate limits.
