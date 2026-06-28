# Elx Studio MVP

A same-day launch MVP for Elx Studio by Elx Holdings.

## What this MVP does

- Public landing page for Elx Studio
- Service overview
- Project intake form
- Generates an Elx order ID
- Redirects the client to WhatsApp with a prefilled onboarding message
- Optional Supabase database storage
- Optional Resend email alert to admin
- Basic Terms, Privacy and Academic Integrity pages

## What is intentionally not included yet

- Full client dashboard
- Expert dashboard
- Complex file uploads
- Integrated payment checkout
- Revision dashboard
- Advanced admin panel

Those should be added after launch. The goal of this version is to start taking real client briefs today.

## Quick local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Required environment variable

Replace this with your business WhatsApp number:

```bash
NEXT_PUBLIC_WHATSAPP_NUMBER=254712345678
```

Do not include +, spaces, or dashes.

## Deploy to Vercel today

1. Push this folder to a GitHub repository.
2. Go to Vercel and import the repository.
3. Add the environment variable `NEXT_PUBLIC_WHATSAPP_NUMBER`.
4. Deploy.
5. Connect your domain.

## Optional Supabase setup

Create a Supabase project and run this SQL:

```sql
create table intake_requests (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  name text not null,
  whatsapp text not null,
  email text,
  service text not null,
  deadline text not null,
  budget text,
  files_link text,
  brief text not null,
  status text default 'new',
  created_at timestamptz default now()
);
```

Then add these variables in Vercel:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Optional email alerts using Resend

Add:

```bash
RESEND_API_KEY=your_resend_key
ELX_ADMIN_EMAIL=you@yourdomain.com
RESEND_FROM_EMAIL=Elx Studio <onboarding@yourdomain.com>
```

## Recommended same-day business process

1. Client submits the form.
2. Client is pushed to WhatsApp with the order ID.
3. You review the brief.
4. You quote manually.
5. You collect payment by Stripe Payment Link, PayPal, bank transfer or mobile money.
6. You deliver through WhatsApp, email or secure Drive link.
7. Later, you upgrade to full dashboards and automated payments.
