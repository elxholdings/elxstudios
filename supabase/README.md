# Supabase setup

The initial migration creates the Elx multi-company schema, role model, RLS policies and private Storage buckets. The seed creates Elx Holdings, Elx Studio and the initial service catalog.

## Remote project

1. Create a Supabase project on the Free plan.
2. Keep the database password in a password manager; do not paste it into chat or commit it.
3. Authenticate the CLI with `npx supabase login`.
4. Link this repository with `npx supabase link --project-ref YOUR_PROJECT_REF`.
5. Review with `npx supabase db push --dry-run`.
6. Apply with `npx supabase db push --include-seed`.

## Application variables

Copy these from Supabase Project Settings → API:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The service-role key must remain server-only. Never prefix it with `NEXT_PUBLIC_`.

## First super administrator

After the first owner account exists in Supabase Auth, promote it in the SQL editor by replacing the email below:

```sql
insert into public.user_roles (user_id, company_id, role)
select u.id, c.id, 'super_admin'::public.app_role
from auth.users u
join public.companies c on c.slug = 'elx-studio'
where lower(u.email) = lower('OWNER_EMAIL_HERE')
on conflict do nothing;
```

## Storage path convention

Private order files and deliverables must use an order UUID as the first path segment:

```text
ORDER_UUID/source/client-file.pdf
ORDER_UUID/delivery/final-file.pdf
```

RLS checks the order relationship before permitting access.
