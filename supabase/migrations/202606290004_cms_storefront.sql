-- Visual CMS, public media library and digital-plan storefront.

create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  key text not null,
  label text not null,
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, key)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  file_name text not null,
  title text not null default '',
  alt_text text not null default '',
  mime_type text not null,
  file_size bigint not null check (file_size >= 0),
  storage_path text not null unique,
  public_url text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.digital_products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  slug text not null,
  title text not null,
  eyebrow text not null default 'Digital plan',
  summary text not null default '',
  description text not null default '',
  category text not null default 'Architecture',
  price numeric(12,2) not null default 0 check (price >= 0),
  currency text not null default 'USD',
  cover_url text,
  gallery jsonb not null default '[]'::jsonb,
  preview_video_url text,
  included_files text[] not null default '{}',
  specifications jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, slug)
);

create table public.product_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid not null references public.digital_products(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  whatsapp text not null,
  notes text,
  status text not null default 'new' check (status in ('new', 'contacted', 'awaiting_payment', 'paid', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index media_assets_company_created_idx on public.media_assets(company_id, created_at desc);
create index digital_products_public_idx on public.digital_products(company_id, status, featured, sort_order);
create index product_requests_company_status_idx on public.product_requests(company_id, status, created_at desc);

create trigger set_site_content_updated_at before update on public.site_content for each row execute function public.set_updated_at();
create trigger set_digital_products_updated_at before update on public.digital_products for each row execute function public.set_updated_at();
create trigger set_product_requests_updated_at before update on public.product_requests for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;
alter table public.media_assets enable row level security;
alter table public.digital_products enable row level security;
alter table public.product_requests enable row level security;

grant select on public.site_content, public.media_assets, public.digital_products to anon, authenticated;
grant all on public.site_content, public.media_assets, public.digital_products, public.product_requests to service_role;

create policy "Public view published site content" on public.site_content for select to anon, authenticated using (is_published);
create policy "Staff manage site content" on public.site_content for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));
create policy "Public view media library" on public.media_assets for select to anon, authenticated using (true);
create policy "Staff manage media library" on public.media_assets for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));
create policy "Public view products" on public.digital_products for select to anon, authenticated using (status = 'published' or private.is_staff(company_id));
create policy "Staff manage products" on public.digital_products for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));
create policy "Staff view product requests" on public.product_requests for select to authenticated using (private.is_staff(company_id));
create policy "Staff manage product requests" on public.product_requests for all to authenticated using (private.is_staff(company_id)) with check (private.is_staff(company_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 104857600, array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Staff upload site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and private.is_staff(null));
create policy "Staff update site media" on storage.objects for update to authenticated using (bucket_id = 'site-media' and private.is_staff(null)) with check (bucket_id = 'site-media' and private.is_staff(null));
create policy "Staff delete site media" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and private.is_staff(null));

insert into public.site_content (company_id, key, label, content, is_published)
values (
  '00000000-0000-4000-8000-000000000002',
  'homepage',
  'Homepage',
  $json${
    "heroEyebrow": "Technical & professional project support",
    "heroTitle": "Get it",
    "heroAccent": "right.",
    "heroDescription": "Bring us the difficult brief—the calculations, drawings, models, reports and details. We turn it into clear, polished work you can use with confidence.",
    "heroPrimaryLabel": "Send your brief",
    "heroSecondaryLabel": "Explore our expertise",
    "stats": [
      {"value":"7","label":"service areas"},
      {"value":"01","label":"reference for every brief"},
      {"value":"Direct","label":"WhatsApp communication"},
      {"value":"Flexible","label":"delivery formats"}
    ],
    "introEyebrow": "Built around your brief",
    "introTitle": "Your project can be complex. The process shouldn't be.",
    "introBody": "No endless searching for different specialists. Start with one clear brief and move forward with the right support around the work.",
    "introMediaUrl": "/images/architecture-drafting.jpg",
    "introMediaType": "image",
    "servicesEyebrow": "Everything you need",
    "servicesTitle": "From first calculation to final presentation.",
    "workflowEyebrow": "How it works",
    "workflowTitle": "A clear path from brief to done.",
    "ctaEyebrow": "Ready when you are",
    "ctaTitle": "Let's get to work.",
    "ctaBody": "Share the context, deadline and format you have in mind. We'll review the details and continue with you on WhatsApp.",
    "footerTagline": "Professional and technical project support.",
    "carousel": [
      {"id":"cad","eyebrow":"CAD + architecture","title":"Precision plans for real projects.","text":"Floor plans, technical drawings and carefully structured CAD deliverables.","mediaUrl":"/images/blueprint-tools.jpg","mediaType":"image","link":"/services/architecture-design"},
      {"id":"render","eyebrow":"3D visualization","title":"See the design before it is built.","text":"Architectural renderings, product models and presentation-ready visual outcomes.","mediaUrl":"/images/technical-render.jpg","mediaType":"image","link":"/services/3d-modeling-rendering"},
      {"id":"analysis","eyebrow":"Data + finance","title":"Turn dense numbers into decisions.","text":"Dashboards, models, forecasts and reports built for clarity.","mediaUrl":"/images/analytics-dashboard.jpg","mediaType":"image","link":"/services/finance-accounting"},
      {"id":"stem","eyebrow":"STEM + calculations","title":"Work through the difficult details.","text":"Structured engineering, mathematics and technical problem-solving support.","mediaUrl":"/images/math-formulas.jpg","mediaType":"image","link":"/services/stem-technical"}
    ]
  }$json$::jsonb,
  true
)
on conflict (company_id, key) do nothing;

insert into public.digital_products (company_id, slug, title, eyebrow, summary, description, category, price, currency, cover_url, included_files, specifications, status, featured, sort_order)
values
  ('00000000-0000-4000-8000-000000000002','compact-three-bedroom-plan','Compact Three-Bedroom House Plan','Ready-to-customize CAD set','A practical residential layout with clean circulation and an efficient footprint.','A professionally organized concept-plan package suitable for adaptation to a specific site and local approval requirements. Purchase requests are reviewed before payment so scope and file compatibility can be confirmed.','Residential',49,'USD','/images/architecture-drafting.jpg',array['PDF drawing set','DWG source drawing','Room schedule'], '[{"label":"Bedrooms","value":"3"},{"label":"Bathrooms","value":"2"},{"label":"Format","value":"PDF + DWG"}]'::jsonb,'published',true,1),
  ('00000000-0000-4000-8000-000000000002','modern-two-bedroom-starter','Modern Two-Bedroom Starter Plan','Efficient residential design','A flexible two-bedroom layout for a compact urban or suburban plot.','A clean starter layout with open living spaces, practical service zones and editable CAD source files available after scope confirmation.','Residential',35,'USD','/images/blueprint-tools.jpg',array['PDF floor plan','DWG floor plan','Area schedule'], '[{"label":"Bedrooms","value":"2"},{"label":"Bathrooms","value":"1"},{"label":"Format","value":"PDF + DWG"}]'::jsonb,'published',true,2),
  ('00000000-0000-4000-8000-000000000002','small-office-concept-pack','Small Office Concept Pack','Commercial layout toolkit','A presentation-ready small-office concept with flexible work and meeting zones.','A commercial concept package for early planning, leasing discussions and design development. Final construction documents require project-specific adaptation.','Commercial',79,'USD','/images/technical-render.jpg',array['PDF concept set','DWG base plan','Presentation images'], '[{"label":"Use","value":"Small office"},{"label":"Stage","value":"Concept"},{"label":"Format","value":"PDF + DWG"}]'::jsonb,'published',true,3)
on conflict (company_id, slug) do nothing;
