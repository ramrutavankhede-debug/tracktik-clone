-- Employee management fields & assignments
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists middle_name text,
  add column if not exists job_title text,
  add column if not exists phone_other text,
  add column if not exists sms_consent_main boolean not null default false,
  add column if not exists sms_consent_other boolean not null default false,
  add column if not exists gender text,
  add column if not exists email text,
  add column if not exists government_badge_id text,
  add column if not exists username text,
  add column if not exists zone_id uuid references public.zones (id) on delete set null,
  add column if not exists department_id uuid references public.departments (id) on delete set null,
  add column if not exists address text,
  add column if not exists address_line_2 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip_code text,
  add column if not exists country text,
  add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table public.profiles alter column id set default gen_random_uuid();
exception when others then null;
end $$;

create table if not exists public.employee_site_assignments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  employee_id uuid not null references public.profiles (id) on delete cascade,
  site_id uuid not null references public.sites (id) on delete cascade,
  start_date date,
  effective_rate_date date,
  rate numeric(12,2),
  end_date date,
  is_primary boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (employee_id, site_id)
);

create index if not exists profiles_org_status_idx on public.profiles (org_id, status);
create index if not exists profiles_org_name_idx on public.profiles (org_id, last_name, first_name);
create index if not exists employee_site_assignments_employee_idx on public.employee_site_assignments (employee_id);

alter table public.departments enable row level security;
alter table public.employee_site_assignments enable row level security;
do $$ begin create policy departments_all on public.departments for all using (true) with check (true); exception when duplicate_object then null; end $$;
do $$ begin create policy employee_site_assignments_all on public.employee_site_assignments for all using (true) with check (true); exception when duplicate_object then null; end $$;
do $$ begin create policy profiles_all on public.profiles for all using (true) with check (true); exception when duplicate_object then null; end $$;
