-- Extend zones for Site Zones (Groups) / Customer Zones
create table if not exists public.zone_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.zones
  add column if not exists zone_uid text,
  add column if not exists details text,
  add column if not exists status text not null default 'active',
  add column if not exists preferred_language text not null default 'en',
  add column if not exists zone_template_id uuid references public.zone_templates (id) on delete set null,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip_code text,
  add column if not exists country text,
  add column if not exists calendar_group text,
  add column if not exists parent_zone_id uuid references public.zones (id) on delete set null,
  add column if not exists devices_count integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table public.zones
    add constraint zones_status_check check (status in ('active', 'inactive'));
exception when duplicate_object then null;
end $$;

create unique index if not exists zones_org_zone_uid_uidx
  on public.zones (org_id, zone_uid)
  where zone_uid is not null;

create index if not exists zones_org_status_idx on public.zones (org_id, status);
create index if not exists zones_parent_idx on public.zones (parent_zone_id);

alter table public.zone_templates enable row level security;
do $$ begin
  create policy zone_templates_all on public.zone_templates for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

insert into public.zone_templates (id, org_id, name) values
  ('ffffffff-ffff-ffff-ffff-fffffffffff1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Standard Zone'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Patrol Zone')
on conflict (id) do nothing;

update public.zones
set status = coalesce(status, 'active'),
    preferred_language = coalesce(preferred_language, 'en'),
    devices_count = coalesce(devices_count, 0)
where true;
