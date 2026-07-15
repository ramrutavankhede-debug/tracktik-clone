-- Demo seed for Sites list (idempotent-ish fixed UUIDs)
insert into public.organizations (id, name, timezone)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Avenue Security', 'Australia/Melbourne')
on conflict (id) do nothing;

insert into public.zones (id, org_id, name) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MS Property Services'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MS Protective Services')
on conflict (id) do nothing;

insert into public.site_templates (id, org_id, name) values
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Standard Site'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Campus Template')
on conflict (id) do nothing;

insert into public.clients (id, org_id, name, type, main_contact, phone) values
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'City Colleges', 'multi', 'Manny Singh', '03 9000 1000'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TEDI Group', 'client', 'Alex Nguyen', '03 9000 2000')
on conflict (id) do nothing;

insert into public.sites (
  id, org_id, client_id, account_uid, account_type, name, address, city, state, country, status,
  contact_first_name, contact_last_name, phone_main, site_template_id
) values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', '11', 'multi', 'City Colleges', '100 Education Rd', 'Melbourne', 'Victoria', 'Australia', 'active', 'Manny', 'Singh', '03 9000 1000', 'cccccccc-cccc-cccc-cccc-ccccccccccc2'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-ddddddddddd2', '24', 'client', 'TEDI Group', '55 Commercial St', 'Brunswick', 'Victoria', 'Australia', 'active', 'Alex', 'Nguyen', '03 9000 2000', 'cccccccc-cccc-cccc-cccc-ccccccccccc1')
on conflict (id) do nothing;

insert into public.sites (
  id, org_id, client_id, parent_client_id, account_uid, account_type, name, address, city, state, country, status,
  contact_first_name, contact_last_name, phone_main, site_template_id
) values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', '31', 'site', 'TEDI BRUNSWICK', '12 Sydney Rd', 'Brunswick', 'Victoria', 'Australia', 'active', 'Manny', 'Singh', '03 9000 1100', 'cccccccc-cccc-cccc-cccc-ccccccccccc1'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', '32', 'site', 'City Colleges - CBD', '200 Collins St', 'Melbourne', 'Victoria', 'Australia', 'active', 'Sam', 'Lee', '03 9000 1200', 'cccccccc-cccc-cccc-cccc-ccccccccccc2'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, null, '40', 'site', 'Warehouse North', '88 Logistics Ave', 'Campbellfield', 'Victoria', 'Australia', 'active', 'Jordan', 'Park', '03 9000 1300', 'cccccccc-cccc-cccc-cccc-ccccccccccc1')
on conflict (id) do nothing;

insert into public.site_zones (site_id, zone_id) values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2')
on conflict do nothing;
