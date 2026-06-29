-- Restrict every staff capability to one Google-authenticated administrator.

create or replace function private.is_google_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    lower(coalesce((select auth.jwt()) ->> 'email', '')) = 'hello@elxholdings.com'
    and (
      (select auth.jwt()) -> 'app_metadata' ->> 'provider' = 'google'
      or coalesce((select auth.jwt()) -> 'app_metadata' -> 'providers', '[]'::jsonb) ? 'google'
    )
    and exists (
      select 1
      from jsonb_array_elements(coalesce((select auth.jwt()) -> 'amr', '[]'::jsonb)) as method
      where method ->> 'method' = 'oauth'
    );
$$;

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
      and (
        r.role <> all(array['super_admin','admin','project_manager']::public.app_role[])
        or private.is_google_admin()
      )
  );
$$;

revoke all on function private.is_google_admin() from public;

-- Remove any legacy staff grants held by a different email address.
delete from public.user_roles as role_grant
using auth.users as account
where role_grant.user_id = account.id
  and role_grant.role = any(array['super_admin','admin','project_manager']::public.app_role[])
  and lower(coalesce(account.email, '')) <> 'hello@elxholdings.com';

-- Existing Google account: promote it now. New accounts are handled by the trigger below.
insert into public.user_roles (user_id, company_id, role)
select account.id, company.id, 'super_admin'::public.app_role
from auth.users as account
join public.companies as company on company.slug = 'elx-studio'
where lower(coalesce(account.email, '')) = 'hello@elxholdings.com'
  and (
    account.raw_app_meta_data ->> 'provider' = 'google'
    or coalesce(account.raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google'
  )
on conflict do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare studio_id uuid;
declare google_admin boolean;
begin
  select id into studio_id from public.companies where slug = 'elx-studio' limit 1;
  google_admin := lower(coalesce(new.email, '')) = 'hello@elxholdings.com'
    and (
      new.raw_app_meta_data ->> 'provider' = 'google'
      or coalesce(new.raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google'
    );

  insert into public.profiles (id, company_id, full_name, status)
  values (new.id, studio_id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'active')
  on conflict (id) do nothing;

  if studio_id is not null then
    insert into public.user_roles (user_id, company_id, role)
    values (new.id, studio_id, 'client')
    on conflict do nothing;

    if google_admin then
      insert into public.user_roles (user_id, company_id, role)
      values (new.id, studio_id, 'super_admin')
      on conflict do nothing;
    end if;
  end if;
  return new;
end;
$$;
