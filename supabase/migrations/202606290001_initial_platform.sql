-- Elx Holdings / Elx Studio initial platform schema.
-- Designed for Supabase Postgres, Auth, Storage and Row Level Security.

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

create type public.app_role as enum ('super_admin', 'admin', 'project_manager', 'expert', 'client');
create type public.account_status as enum ('pending', 'active', 'suspended', 'deactivated');
create type public.order_status as enum ('submitted', 'awaiting_quote', 'quote_sent', 'awaiting_payment', 'paid', 'assigned', 'in_progress', 'quality_review', 'ready_for_delivery', 'delivered', 'revision_requested', 'completed', 'cancelled', 'refunded');
create type public.payment_status as enum ('unpaid', 'awaiting_payment', 'partially_paid', 'paid', 'refund_requested', 'refunded', 'failed', 'cancelled');
create type public.quote_status as enum ('draft', 'sent', 'accepted', 'declined', 'expired', 'revised');
create type public.task_status as enum ('invited', 'accepted', 'rejected', 'in_progress', 'submitted', 'changes_requested', 'approved', 'completed', 'cancelled');
create type public.ticket_status as enum ('open', 'in_progress', 'waiting_on_client', 'resolved', 'closed', 'reopened');
create type public.file_visibility as enum ('client', 'expert', 'staff', 'shared');
create type public.message_scope as enum ('client', 'expert', 'internal');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  parent_company_id uuid references public.companies(id) on delete set null,
  slug text not null unique,
  name text not null,
  brand_name text,
  status public.account_status not null default 'active',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  full_name text,
  phone text,
  country text,
  timezone text,
  avatar_path text,
  status public.account_status not null default 'pending',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role public.app_role not null default 'client',
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, company_id, role)
);

create table public.expert_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  headline text,
  bio text,
  skills text[] not null default '{}',
  software text[] not null default '{}',
  education jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  portfolio_links text[] not null default '{}',
  rate_amount numeric(12,2),
  rate_type text check (rate_type in ('hourly', 'project')),
  currency text not null default 'USD',
  availability text not null default 'available',
  verification_status text not null default 'pending',
  rating numeric(3,2) check (rating between 0 and 5),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, slug)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  pricing_model text not null default 'custom_quote' check (pricing_model in ('custom_quote', 'fixed', 'from_price')),
  base_price numeric(12,2),
  currency text not null default 'USD',
  turnaround_hours integer,
  required_fields jsonb not null default '[]'::jsonb,
  supported_formats text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

create table public.intake_requests (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  client_id uuid references auth.users(id) on delete set null,
  name text not null,
  whatsapp text not null,
  email text,
  service text not null,
  deadline text not null,
  budget text,
  files_link text,
  brief text not null,
  status text not null default 'new',
  converted_order_id uuid,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  company_id uuid not null references public.companies(id) on delete restrict,
  client_id uuid references auth.users(id) on delete set null,
  intake_request_id uuid references public.intake_requests(id) on delete set null,
  category_id uuid references public.service_categories(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  project_title text not null,
  instructions text not null,
  purpose text,
  deadline timestamptz,
  output_formats text[] not null default '{}',
  add_ons jsonb not null default '[]'::jsonb,
  guest_contact jsonb not null default '{}'::jsonb,
  price numeric(12,2),
  currency text not null default 'USD',
  quote_status public.quote_status not null default 'draft',
  payment_status public.payment_status not null default 'unpaid',
  status public.order_status not null default 'submitted',
  assigned_manager_id uuid references auth.users(id) on delete set null,
  assigned_expert_id uuid references auth.users(id) on delete set null,
  submitted_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.intake_requests add constraint intake_converted_order_fk foreign key (converted_order_id) references public.orders(id) on delete set null;

create table public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  file_name text not null,
  file_type text,
  file_size bigint check (file_size is null or file_size >= 0),
  storage_bucket text not null default 'order-files',
  storage_path text not null unique,
  visibility public.file_visibility not null default 'shared',
  version integer not null default 1,
  virus_scan_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  version integer not null default 1,
  status public.quote_status not null default 'draft',
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'USD',
  notes text,
  valid_until timestamptz,
  sent_by uuid references auth.users(id) on delete set null,
  sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, version)
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  sort_order integer not null default 0
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  client_id uuid references auth.users(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  gateway text,
  transaction_reference text unique,
  status public.payment_status not null default 'awaiting_payment',
  paid_at timestamptz,
  refund_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  invoice_number text not null unique,
  status text not null default 'draft',
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  issued_at timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  order_id uuid references public.orders(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  transaction_type text not null,
  direction text not null check (direction in ('credit', 'debit')),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  title text not null,
  instructions text,
  status public.task_status not null default 'invited',
  deadline timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  expert_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  status public.task_status not null default 'invited',
  fee_amount numeric(12,2),
  currency text not null default 'USD',
  accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (task_id, expert_id)
);

create table public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete set null,
  body text not null,
  scope public.message_scope not null default 'client',
  attachment_path text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.revisions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  comments text not null,
  supporting_file_paths text[] not null default '{}',
  status text not null default 'requested',
  is_in_scope boolean,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  title text not null,
  storage_path text not null,
  version integer not null default 1,
  is_final boolean not null default false,
  quality_status text not null default 'pending',
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (order_id, storage_path)
);

create table public.quality_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  deliverable_id uuid references public.deliverables(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending',
  checklist jsonb not null default '{}'::jsonb,
  notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  overall_rating smallint not null check (overall_rating between 1 and 5),
  quality_rating smallint check (quality_rating between 1 and 5),
  delivery_rating smallint check (delivery_rating between 1 and 5),
  comments text,
  private_feedback text,
  allow_public boolean not null default false,
  approved_for_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  category text not null,
  subject text not null,
  description text not null,
  status public.ticket_status not null default 'open',
  assigned_to uuid references auth.users(id) on delete set null,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer,
  times_used integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, code)
);

create table public.expert_payouts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  expert_id uuid not null references auth.users(id) on delete restrict,
  order_id uuid references public.orders(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  status text not null default 'pending',
  method_reference text,
  requested_at timestamptz not null default now(),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  slug text not null,
  title text not null,
  body jsonb not null default '{}'::jsonb,
  seo_title text,
  meta_description text,
  status text not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, slug)
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  slug text not null,
  title text not null,
  excerpt text,
  body jsonb not null default '{}'::jsonb,
  category text,
  tags text[] not null default '{}',
  featured_image_path text,
  seo_title text,
  meta_description text,
  author_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, slug)
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  slug text not null,
  title text not null,
  summary text,
  asset_paths text[] not null default '{}',
  status text not null default 'draft',
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, slug)
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  is_secret boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (company_id, key)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  company_id uuid references public.companies(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index profiles_company_idx on public.profiles(company_id);
create index user_roles_user_idx on public.user_roles(user_id);
create index services_category_idx on public.services(category_id);
create index intake_created_idx on public.intake_requests(created_at desc);
create index orders_client_idx on public.orders(client_id, created_at desc);
create index orders_company_status_idx on public.orders(company_id, status, created_at desc);
create index orders_manager_idx on public.orders(assigned_manager_id, status);
create index orders_expert_idx on public.orders(assigned_expert_id, status);
create index order_files_order_idx on public.order_files(order_id, created_at desc);
create index quotes_order_idx on public.quotes(order_id, created_at desc);
create index payments_order_idx on public.payments(order_id, created_at desc);
create index tasks_order_idx on public.tasks(order_id, status);
create index assignments_expert_idx on public.task_assignments(expert_id, status);
create index messages_order_idx on public.order_messages(order_id, created_at);
create index revisions_order_idx on public.revisions(order_id, created_at desc);
create index deliverables_order_idx on public.deliverables(order_id, created_at desc);
create index notifications_user_idx on public.notifications(user_id, read_at, created_at desc);
create index tickets_creator_idx on public.support_tickets(created_by, status);
create index audit_company_idx on public.audit_logs(company_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'companies','profiles','expert_profiles','service_categories','services','orders','quotes','payments','invoices','tasks','task_assignments','revisions','support_tickets','expert_payouts','cms_pages','blog_posts','portfolio_items'
  ] loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare studio_id uuid;
begin
  select id into studio_id from public.companies where slug = 'elx-studio' limit 1;
  insert into public.profiles (id, company_id, full_name, status)
  values (new.id, studio_id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'active')
  on conflict (id) do nothing;
  if studio_id is not null then
    insert into public.user_roles (user_id, company_id, role)
    values (new.id, studio_id, 'client')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function private.has_role(required_roles public.app_role[], target_company uuid default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = (select auth.uid())
      and r.role = any(required_roles)
      and (target_company is null or r.company_id = target_company)
  );
$$;

create or replace function private.is_staff(target_company uuid default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role(array['super_admin','admin','project_manager']::public.app_role[], target_company);
$$;

create or replace function private.is_order_client(target_order uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.orders o where o.id = target_order and o.client_id = (select auth.uid()));
$$;

create or replace function private.is_order_staff(target_order uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.orders o
    where o.id = target_order
      and (o.assigned_manager_id = (select auth.uid()) or private.is_staff(o.company_id))
  );
$$;

create or replace function private.is_order_expert(target_order uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.orders o
    where o.id = target_order
      and (
        o.assigned_expert_id = (select auth.uid())
        or exists (
          select 1 from public.tasks t
          join public.task_assignments a on a.task_id = t.id
          where t.order_id = o.id and a.expert_id = (select auth.uid())
        )
      )
  );
$$;

create or replace function private.can_access_order(target_order uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select private.is_order_client(target_order) or private.is_order_staff(target_order) or private.is_order_expert(target_order); $$;

create or replace function private.can_access_order_file(target_order uuid, target_visibility public.file_visibility)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_order_staff(target_order)
    or (private.is_order_client(target_order) and target_visibility in ('client','shared'))
    or (private.is_order_expert(target_order) and target_visibility in ('expert','shared'));
$$;

create or replace function private.can_access_order_path(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare target_order uuid;
begin
  target_order := split_part(object_name, '/', 1)::uuid;
  return private.can_access_order(target_order);
exception when invalid_text_representation then
  return false;
end;
$$;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.has_role(public.app_role[], uuid) to anon, authenticated;
grant execute on function private.is_staff(uuid) to anon, authenticated;
grant execute on function private.is_order_client(uuid) to authenticated;
grant execute on function private.is_order_staff(uuid) to authenticated;
grant execute on function private.is_order_expert(uuid) to authenticated;
grant execute on function private.can_access_order(uuid) to authenticated;
grant execute on function private.can_access_order_file(uuid, public.file_visibility) to authenticated;
grant execute on function private.can_access_order_path(text) to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'companies','profiles','user_roles','expert_profiles','service_categories','services','intake_requests','orders','order_files','quotes','quote_items','payments','invoices','transactions','tasks','task_assignments','order_messages','revisions','deliverables','quality_reviews','reviews','notifications','support_tickets','ticket_messages','coupons','expert_payouts','cms_pages','blog_posts','portfolio_items','settings','audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

grant select on public.companies, public.service_categories, public.services, public.cms_pages, public.blog_posts, public.portfolio_items, public.reviews to anon, authenticated;
grant select on all tables in schema public to authenticated;
revoke select on public.companies from anon, authenticated;
grant select (id, parent_company_id, slug, name, brand_name, status, created_at, updated_at) on public.companies to anon, authenticated;
revoke select on public.reviews from anon, authenticated;
grant select (id, order_id, client_id, overall_rating, quality_rating, delivery_rating, comments, allow_public, approved_for_public, created_at) on public.reviews to anon, authenticated;
revoke select on public.expert_profiles from authenticated;
grant select (user_id, company_id, headline, bio, skills, software, education, experience, portfolio_links, rate_amount, rate_type, currency, availability, rating, created_at, updated_at) on public.expert_profiles to authenticated;
grant update (full_name, phone, country, timezone, avatar_path, last_seen_at) on public.profiles to authenticated;
grant update (headline, bio, skills, software, education, experience, portfolio_links, rate_amount, rate_type, currency, availability) on public.expert_profiles to authenticated;
grant insert (order_id, uploaded_by, file_name, file_type, file_size, storage_bucket, storage_path, visibility) on public.order_files to authenticated;
grant update (file_name, visibility) on public.order_files to authenticated;
grant delete on public.order_files to authenticated;
grant insert (order_id, sender_id, recipient_id, body, scope, attachment_path) on public.order_messages to authenticated;
grant update (read_at) on public.order_messages to authenticated;
grant insert (order_id, requested_by, reason, comments, supporting_file_paths) on public.revisions to authenticated;
grant insert (order_id, uploaded_by, title, storage_path, version, is_final) on public.deliverables to authenticated;
grant insert (order_id, client_id, overall_rating, quality_rating, delivery_rating, comments, private_feedback, allow_public) on public.reviews to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant insert (ticket_number, company_id, created_by, order_id, category, subject, description) on public.support_tickets to authenticated;
grant insert (ticket_id, sender_id, body, attachment_path) on public.ticket_messages to authenticated;
grant update (status, accepted_at, completed_at) on public.task_assignments to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

create policy "Public can view active companies" on public.companies for select to anon, authenticated using (status = 'active' or private.is_staff(id));
create policy "Staff manage companies" on public.companies for all to authenticated using (private.has_role(array['super_admin']::public.app_role[], null)) with check (private.has_role(array['super_admin']::public.app_role[], null));

create policy "Users view own profile" on public.profiles for select to authenticated using (id = (select auth.uid()) or private.is_staff(company_id));
create policy "Users update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Staff manage profiles" on public.profiles for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));
create policy "Users view own roles" on public.user_roles for select to authenticated using (user_id = (select auth.uid()) or private.is_staff(company_id));
create policy "Admins manage roles" on public.user_roles for all to authenticated using (private.has_role(array['super_admin','admin']::public.app_role[], company_id)) with check (private.has_role(array['super_admin','admin']::public.app_role[], company_id));
create policy "Experts view own profile" on public.expert_profiles for select to authenticated using (user_id = (select auth.uid()) or private.is_staff(company_id));
create policy "Experts update own profile" on public.expert_profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Staff manage expert profiles" on public.expert_profiles for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));

create policy "Public view active categories" on public.service_categories for select to anon, authenticated using (is_active or private.is_staff(company_id));
create policy "Staff manage categories" on public.service_categories for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));
create policy "Public view active services" on public.services for select to anon, authenticated using (is_active or exists (select 1 from public.service_categories c where c.id = category_id and private.is_staff(c.company_id)));
create policy "Staff manage services" on public.services for all to authenticated using (exists (select 1 from public.service_categories c where c.id = category_id and private.is_staff(c.company_id))) with check (exists (select 1 from public.service_categories c where c.id = category_id and private.is_staff(c.company_id)));

create policy "Staff view intake" on public.intake_requests for select to authenticated using (private.is_staff(null));
create policy "Staff manage intake" on public.intake_requests for all to authenticated using (private.is_staff(null)) with check (private.is_staff(null));

create policy "Clients view own orders" on public.orders for select to authenticated using (client_id = (select auth.uid()));
create policy "Experts view assigned orders" on public.orders for select to authenticated using (assigned_expert_id = (select auth.uid()) or assigned_manager_id = (select auth.uid()) or exists (select 1 from public.tasks t join public.task_assignments a on a.task_id = t.id where t.order_id = orders.id and a.expert_id = (select auth.uid())));
create policy "Staff manage orders" on public.orders for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));

create policy "Participants view order files" on public.order_files for select to authenticated using (private.can_access_order_file(order_id, visibility));
create policy "Participants create order files" on public.order_files for insert to authenticated with check (uploaded_by = (select auth.uid()) and private.can_access_order(order_id));
create policy "Owners update order files" on public.order_files for update to authenticated using (uploaded_by = (select auth.uid()) or exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id))) with check (private.can_access_order(order_id));
create policy "Owners delete order files" on public.order_files for delete to authenticated using (uploaded_by = (select auth.uid()) or private.is_order_staff(order_id));

create policy "Clients and staff view quotes" on public.quotes for select to authenticated using (private.is_order_client(order_id) or private.is_order_staff(order_id));
create policy "Staff manage quotes" on public.quotes for all to authenticated using (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id))) with check (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id)));
create policy "Clients and staff view quote items" on public.quote_items for select to authenticated using (exists (select 1 from public.quotes q where q.id = quote_id and (private.is_order_client(q.order_id) or private.is_order_staff(q.order_id))));
create policy "Staff manage quote items" on public.quote_items for all to authenticated using (exists (select 1 from public.quotes q join public.orders o on o.id = q.order_id where q.id = quote_id and private.is_staff(o.company_id))) with check (exists (select 1 from public.quotes q join public.orders o on o.id = q.order_id where q.id = quote_id and private.is_staff(o.company_id)));

create policy "Clients view own payments" on public.payments for select to authenticated using (client_id = (select auth.uid()) or exists (select 1 from public.orders o where o.id = order_id and private.has_role(array['super_admin','admin']::public.app_role[], o.company_id)));
create policy "Finance staff manage payments" on public.payments for all to authenticated using (exists (select 1 from public.orders o where o.id = order_id and private.has_role(array['super_admin','admin']::public.app_role[], o.company_id))) with check (exists (select 1 from public.orders o where o.id = order_id and private.has_role(array['super_admin','admin']::public.app_role[], o.company_id)));
create policy "Clients and finance staff view invoices" on public.invoices for select to authenticated using (private.is_order_client(order_id) or exists (select 1 from public.orders o where o.id = order_id and private.has_role(array['super_admin','admin']::public.app_role[], o.company_id)));
create policy "Finance staff manage invoices" on public.invoices for all to authenticated using (exists (select 1 from public.orders o where o.id = order_id and private.has_role(array['super_admin','admin']::public.app_role[], o.company_id))) with check (exists (select 1 from public.orders o where o.id = order_id and private.has_role(array['super_admin','admin']::public.app_role[], o.company_id)));
create policy "Finance staff view transactions" on public.transactions for select to authenticated using (private.has_role(array['super_admin','admin']::public.app_role[], company_id));
create policy "Finance staff manage transactions" on public.transactions for all to authenticated using (private.has_role(array['super_admin','admin']::public.app_role[], company_id)) with check (private.has_role(array['super_admin','admin']::public.app_role[], company_id));

create policy "Experts and staff view tasks" on public.tasks for select to authenticated using (private.is_order_expert(order_id) or private.is_order_staff(order_id));
create policy "Staff manage tasks" on public.tasks for all to authenticated using (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id))) with check (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id)));
create policy "Experts view assignments" on public.task_assignments for select to authenticated using (expert_id = (select auth.uid()) or exists (select 1 from public.tasks t join public.orders o on o.id = t.order_id where t.id = task_id and private.is_staff(o.company_id)));
create policy "Experts update assignments" on public.task_assignments for update to authenticated using (expert_id = (select auth.uid())) with check (expert_id = (select auth.uid()));
create policy "Staff manage assignments" on public.task_assignments for all to authenticated using (exists (select 1 from public.tasks t join public.orders o on o.id = t.order_id where t.id = task_id and private.is_staff(o.company_id))) with check (exists (select 1 from public.tasks t join public.orders o on o.id = t.order_id where t.id = task_id and private.is_staff(o.company_id)));

create policy "Participants view scoped messages" on public.order_messages for select to authenticated using (
  private.is_order_staff(order_id)
  or (scope = 'client' and private.is_order_client(order_id))
  or (scope = 'expert' and private.is_order_expert(order_id))
);
create policy "Participants send scoped messages" on public.order_messages for insert to authenticated with check (
  sender_id = (select auth.uid()) and (
    private.is_order_staff(order_id)
    or (scope = 'client' and private.is_order_client(order_id))
    or (scope = 'expert' and private.is_order_expert(order_id))
  )
);
create policy "Recipients update message receipts" on public.order_messages for update to authenticated using (
  recipient_id = (select auth.uid()) or private.is_order_staff(order_id)
) with check (
  private.is_order_staff(order_id)
  or (scope = 'client' and private.is_order_client(order_id))
  or (scope = 'expert' and private.is_order_expert(order_id))
);

create policy "Participants view revisions" on public.revisions for select to authenticated using (private.can_access_order(order_id));
create policy "Clients request revisions" on public.revisions for insert to authenticated with check (requested_by = (select auth.uid()) and exists (select 1 from public.orders o where o.id = order_id and o.client_id = (select auth.uid())));
create policy "Staff manage revisions" on public.revisions for all to authenticated using (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id))) with check (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id)));
create policy "Participants view deliverables" on public.deliverables for select to authenticated using (
  private.is_order_staff(order_id)
  or private.is_order_expert(order_id)
  or (private.is_order_client(order_id) and is_final and quality_status = 'approved')
);
create policy "Experts upload deliverables" on public.deliverables for insert to authenticated with check (uploaded_by = (select auth.uid()) and (private.is_order_expert(order_id) or private.is_order_staff(order_id)));
create policy "Staff manage deliverables" on public.deliverables for all to authenticated using (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id))) with check (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id)));
create policy "Assigned experts view quality reviews" on public.quality_reviews for select to authenticated using (private.is_order_expert(order_id) or private.is_order_staff(order_id));
create policy "Staff manage quality reviews" on public.quality_reviews for all to authenticated using (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id))) with check (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id)));

create policy "Public view approved reviews" on public.reviews for select to anon, authenticated using (approved_for_public or client_id = (select auth.uid()) or exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id)));
create policy "Clients create own reviews" on public.reviews for insert to authenticated with check (client_id = (select auth.uid()) and exists (select 1 from public.orders o where o.id = order_id and o.client_id = (select auth.uid()) and o.status in ('delivered','completed')));
create policy "Staff manage reviews" on public.reviews for all to authenticated using (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id))) with check (exists (select 1 from public.orders o where o.id = order_id and private.is_staff(o.company_id)));
create policy "Users view notifications" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "Users update notifications" on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Users view own tickets" on public.support_tickets for select to authenticated using (created_by = (select auth.uid()) or assigned_to = (select auth.uid()) or private.is_staff(company_id));
create policy "Users create tickets" on public.support_tickets for insert to authenticated with check (created_by = (select auth.uid()));
create policy "Staff manage tickets" on public.support_tickets for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));
create policy "Ticket participants view messages" on public.ticket_messages for select to authenticated using (exists (select 1 from public.support_tickets t where t.id = ticket_id and (t.created_by = (select auth.uid()) or t.assigned_to = (select auth.uid()) or private.is_staff(t.company_id))));
create policy "Ticket participants send messages" on public.ticket_messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists (select 1 from public.support_tickets t where t.id = ticket_id and (t.created_by = (select auth.uid()) or t.assigned_to = (select auth.uid()) or private.is_staff(t.company_id))));

create policy "Users view active coupons" on public.coupons for select to authenticated using (is_active and (starts_at is null or starts_at <= now()) and (expires_at is null or expires_at > now()) or private.is_staff(company_id));
create policy "Staff manage coupons" on public.coupons for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));
create policy "Experts view own payouts" on public.expert_payouts for select to authenticated using (expert_id = (select auth.uid()) or private.has_role(array['super_admin','admin']::public.app_role[], company_id));
create policy "Finance staff manage payouts" on public.expert_payouts for all to authenticated using (private.has_role(array['super_admin','admin']::public.app_role[], company_id)) with check (private.has_role(array['super_admin','admin']::public.app_role[], company_id));

create policy "Public view published pages" on public.cms_pages for select to anon, authenticated using (status = 'published' or private.is_staff(company_id));
create policy "Staff manage pages" on public.cms_pages for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));
create policy "Public view published posts" on public.blog_posts for select to anon, authenticated using (status = 'published' or private.is_staff(company_id));
create policy "Staff manage posts" on public.blog_posts for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));
create policy "Public view published portfolio" on public.portfolio_items for select to anon, authenticated using (status = 'published' or private.is_staff(company_id));
create policy "Staff manage portfolio" on public.portfolio_items for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));
create policy "Staff view settings" on public.settings for select to authenticated using (private.has_role(array['super_admin','admin']::public.app_role[], company_id));
create policy "Admins manage settings" on public.settings for all to authenticated using (private.has_role(array['super_admin','admin']::public.app_role[], company_id)) with check (private.has_role(array['super_admin','admin']::public.app_role[], company_id));
create policy "Staff view audit logs" on public.audit_logs for select to authenticated using (private.has_role(array['super_admin','admin']::public.app_role[], company_id));

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('order-files', 'order-files', false, 52428800),
  ('deliverables', 'deliverables', false, 52428800),
  ('avatars', 'avatars', false, 5242880),
  ('portfolio-assets', 'portfolio-assets', true, 20971520)
on conflict (id) do nothing;

create policy "Order participants read private files" on storage.objects for select to authenticated using (
  (bucket_id = 'order-files' and exists (select 1 from public.order_files f where f.storage_path = name and private.can_access_order_file(f.order_id, f.visibility)))
  or (bucket_id = 'deliverables' and exists (
    select 1 from public.deliverables d
    where d.storage_path = name
      and (private.is_order_staff(d.order_id) or private.is_order_expert(d.order_id) or (private.is_order_client(d.order_id) and d.is_final and d.quality_status = 'approved'))
  ))
);
create policy "Order participants upload private files" on storage.objects for insert to authenticated with check (bucket_id in ('order-files','deliverables') and owner_id = (select auth.uid())::text and private.can_access_order_path(name));
create policy "Owners update private files" on storage.objects for update to authenticated using (bucket_id in ('order-files','deliverables') and owner_id = (select auth.uid())::text) with check (bucket_id in ('order-files','deliverables') and owner_id = (select auth.uid())::text and private.can_access_order_path(name));
create policy "Owners delete private files" on storage.objects for delete to authenticated using (bucket_id in ('order-files','deliverables') and owner_id = (select auth.uid())::text);
create policy "Users read avatars" on storage.objects for select to authenticated using (bucket_id = 'avatars');
create policy "Users upload own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users update own avatar" on storage.objects for update to authenticated using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text) with check (bucket_id = 'avatars' and owner_id = (select auth.uid())::text);
create policy "Staff upload portfolio assets" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-assets' and private.is_staff(null));

comment on table public.intake_requests is 'Guest requests created by the server-side intake endpoint before account conversion.';
comment on table public.orders is 'Source of truth for client projects after intake review or authenticated submission.';
comment on column public.settings.value is 'Never store raw payment credentials here; use encrypted platform secrets instead.';
