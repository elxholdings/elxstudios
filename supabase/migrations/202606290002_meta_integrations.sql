-- Meta platform integration foundation: encrypted credentials, webhook intake,
-- lead capture and an immutable publish/action trail.

create table public.meta_integrations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product text not null check (product in ('facebook_user', 'facebook_page', 'instagram', 'marketing', 'whatsapp')),
  external_account_id text not null,
  external_business_id text,
  display_name text,
  status text not null default 'connected' check (status in ('connected', 'expired', 'revoked', 'error')),
  scopes text[] not null default '{}',
  token_ciphertext text,
  token_iv text,
  token_tag text,
  token_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, product, external_account_id)
);

create table public.meta_webhook_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  provider text not null check (provider in ('facebook', 'instagram', 'whatsapp')),
  event_key text,
  object_type text,
  payload jsonb not null,
  processing_status text not null default 'received' check (processing_status in ('received', 'processed', 'ignored', 'failed')),
  processing_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table public.meta_leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  leadgen_id text not null unique,
  page_id text,
  form_id text,
  ad_id text,
  adset_id text,
  campaign_id text,
  contact_name text,
  contact_email text,
  contact_phone text,
  fields jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'archived')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meta_action_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  integration_id uuid references public.meta_integrations(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  action text not null,
  target_id text,
  request_summary jsonb not null default '{}'::jsonb,
  external_result_id text,
  status text not null check (status in ('succeeded', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index meta_integrations_company_product_idx on public.meta_integrations (company_id, product);
create index meta_webhook_events_received_idx on public.meta_webhook_events (received_at desc);
create index meta_leads_company_status_idx on public.meta_leads (company_id, status, created_at desc);
create index meta_action_log_company_created_idx on public.meta_action_log (company_id, created_at desc);

create trigger set_meta_integrations_updated_at before update on public.meta_integrations for each row execute function public.set_updated_at();
create trigger set_meta_leads_updated_at before update on public.meta_leads for each row execute function public.set_updated_at();

alter table public.meta_integrations enable row level security;
alter table public.meta_webhook_events enable row level security;
alter table public.meta_leads enable row level security;
alter table public.meta_action_log enable row level security;

-- Token columns are intentionally omitted from browser-readable grants.
grant select (id, company_id, product, external_account_id, external_business_id, display_name, status, scopes, token_expires_at, metadata, created_by, created_at, updated_at) on public.meta_integrations to authenticated;
grant select on public.meta_webhook_events, public.meta_leads, public.meta_action_log to authenticated;
grant update (status, assigned_to) on public.meta_leads to authenticated;
grant all on public.meta_integrations, public.meta_webhook_events, public.meta_leads, public.meta_action_log to service_role;

create policy "Staff view Meta integrations" on public.meta_integrations for select to authenticated using (private.is_staff(company_id));
create policy "Staff view Meta webhook events" on public.meta_webhook_events for select to authenticated using (company_id is not null and private.is_staff(company_id));
create policy "Staff view Meta leads" on public.meta_leads for select to authenticated using (private.is_staff(company_id));
create policy "Staff update Meta leads" on public.meta_leads for update to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));
create policy "Staff view Meta action log" on public.meta_action_log for select to authenticated using (private.is_staff(company_id));

comment on column public.meta_integrations.token_ciphertext is 'AES-256-GCM ciphertext. Never expose through browser grants.';
comment on table public.meta_webhook_events is 'Raw Meta events retained for traceability after signature verification.';
