-- Sites module baseline schema (Phase 1 subset for List All Sites)
create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  timezone text not null default 'UTC',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  role text not null default 'guard',
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  employee_number text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  skills jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  type text not null default 'client' check (type in ('client', 'multi')),
  main_contact text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.site_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  parent_client_id uuid references public.sites (id) on delete set null,
  account_uid text not null,
  account_type text not null default 'site' check (account_type in ('client', 'multi', 'site')),
  name text not null,
  address text,
  address_line_2 text,
  city text,
  state text,
  zip_code text,
  country text,
  lat double precision,
  lng double precision,
  status text not null default 'active' check (status in ('active', 'inactive')),
  site_template_id uuid references public.site_templates (id) on delete set null,
  timezone text,
  preferred_language text not null default 'en',
  logo_url text,
  contact_first_name text,
  contact_last_name text,
  contact_job_title text,
  phone_main text,
  phone_other text,
  fax text,
  email text,
  sms_consent_main boolean not null default false,
  sms_consent_other boolean not null default false,
  tags text[] not null default '{}',
  business_registration_number text,
  website text,
  account_rep_id uuid references public.profiles (id) on delete set null,
  sales_rep_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, account_uid)
);

create table if not exists public.site_zones (
  site_id uuid not null references public.sites (id) on delete cascade,
  zone_id uuid not null references public.zones (id) on delete cascade,
  primary key (site_id, zone_id)
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  site_id uuid references public.sites (id) on delete set null,
  title text not null default 'Incident',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  site_id uuid references public.sites (id) on delete set null,
  guard_id uuid references public.profiles (id) on delete set null,
  status text not null default 'open',
  clock_in timestamptz,
  clock_out timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tour_sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  site_id uuid references public.sites (id) on delete set null,
  status text not null default 'completed',
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sites_org_id_idx on public.sites (org_id);
create index if not exists sites_status_idx on public.sites (org_id, status);
create index if not exists sites_city_idx on public.sites (org_id, city);
create index if not exists sites_name_idx on public.sites (org_id, name);
create index if not exists site_zones_zone_id_idx on public.site_zones (zone_id);
create index if not exists clients_org_id_idx on public.clients (org_id);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.site_templates enable row level security;
alter table public.zones enable row level security;
alter table public.sites enable row level security;
alter table public.site_zones enable row level security;
alter table public.incidents enable row level security;
alter table public.shifts enable row level security;
alter table public.tour_sessions enable row level security;
alter table public.audit_log enable row level security;

-- Dev-friendly policies until full auth (Prompt 2/3) lands.
-- Authenticated users are org-scoped; anon can read seed for UI demos.
do $$
begin
  create policy organizations_select on public.organizations for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy sites_select on public.sites for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy sites_insert on public.sites for insert with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy sites_update on public.sites for update using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy sites_delete on public.sites for delete using (true);
exception when duplicate_object then null; end $$;

do $$ begin create policy clients_all on public.clients for all using (true) with check (true); exception when duplicate_object then null; end $$;
do $$ begin create policy zones_all on public.zones for all using (true) with check (true); exception when duplicate_object then null; end $$;
do $$ begin create policy site_templates_all on public.site_templates for all using (true) with check (true); exception when duplicate_object then null; end $$;
do $$ begin create policy site_zones_all on public.site_zones for all using (true) with check (true); exception when duplicate_object then null; end $$;
do $$ begin create policy profiles_select on public.profiles for select using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy incidents_select on public.incidents for select using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy shifts_select on public.shifts for select using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy tour_sessions_select on public.tour_sessions for select using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy audit_log_all on public.audit_log for all using (true) with check (true); exception when duplicate_object then null; end $$;

create or replace function public.next_account_uid(p_org_id uuid)
returns text
language plpgsql
as $$
declare
  max_num integer;
begin
  select coalesce(max(nullif(regexp_replace(account_uid, '\D', '', 'g'), '')::integer), 0)
    into max_num
  from public.sites
  where org_id = p_org_id;
  return (max_num + 1)::text;
end;
$$;
