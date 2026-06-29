# Elx Studio MVP

Elx Studio by Elx Holdings: a production-shaped, no-payment project delivery platform.

## Included

- Public marketing site and seven technical/professional service departments
- Structured intake, Elx order references and WhatsApp handoff
- Supabase registration, email confirmation, login, recovery and cookie sessions
- Secure cloud client workspace with orders, quotes, files, messages and revisions
- Role-protected operations portal with assignments, status control and manual quotes
- Full admin control plane covering overview, orders, clients, team, services, finance, support, content, Meta, settings and system health
- Private source uploads, approved deliverables and short-lived signed downloads
- Policies, locale detection, SEO metadata, robots and sitemap
- Meta development console for Facebook Pages, Instagram, Lead Ads, Marketing insights and WhatsApp Cloud API

## Intentionally deferred

- Integrated payments, refunds and invoicing
- Google login and admin 2FA
- Expert task/payout portal
- Malware scanning, advanced monitoring and automatic WhatsApp/SMS
- CAD/3D file previews

See `DEVELOPMENT_STATUS.md` and `SPEC_GAP_AUDIT.md` for the exact boundary.

## Meta development setup

The protected `/admin/meta` console includes OAuth asset discovery, encrypted token storage, signature-verified webhooks, Facebook/Instagram publishing, Lead Ads capture, insights, WhatsApp test messaging, action logs and a Meta data-deletion callback.

The protected `/admin` area also includes guarded role management, project tasks, service pricing/visibility, multi-currency finance reporting, ticket replies, editable CMS records, non-secret workflow settings and a secret-free health/audit view. Financial automation stays read-only until a payment provider is connected.

Required Vercel variables are documented in `.env.example`. Meta-issued App ID/App Secret and WhatsApp test credentials must be copied privately from the Meta Developer dashboard. Development mode works with app-role users and test assets; Advanced Access remains dependent on Meta App Review and Business Verification.

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Supabase

The normalized schema, seed data, Row Level Security and private Storage policies are in `supabase/`.

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push --include-seed
```

Add these to local/Vercel environment settings:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The publishable/anon key is intended for browser use because Row Level Security is enabled. The service-role secret must remain server-only.

Configure Supabase Authentication URL settings:

- Site URL: `https://elxholdings.com`
- Redirect URL: `https://elxholdings.com/auth/callback`
- Vercel fallback: `https://elxstudios.vercel.app/auth/callback`
- Local redirect URL: `http://localhost:3000/auth/callback`

See `supabase/README.md` for first-owner promotion.

## Optional services

WhatsApp redirect:

```text
NEXT_PUBLIC_WHATSAPP_NUMBER=254712345678
```

Google Cloud Translation for languages not bundled locally:

```text
GOOGLE_TRANSLATE_API_KEY=
```

Resend intake alerts:

```text
RESEND_API_KEY=
ELX_ADMIN_EMAIL=
RESEND_FROM_EMAIL=Elx Studio <onboarding@yourdomain.com>
```

## Operating flow

1. A client registers, confirms their email and submits a project.
2. The cloud order appears in the client workspace and protected staff portal.
3. Staff reviews scope, assigns a manager/expert and sends a manual quote.
4. Payment is coordinated manually until a gateway is added.
5. Messages, source files and revision decisions stay on the order.
6. Staff publishes an approved deliverable; the client downloads it through a signed link.
