insert into public.tenants (id, name, slug)
values ('0f4d6a13-1a28-4ed1-9f79-ef6f2dcd1001', 'Viajes Cuba Demo', 'viajes-cuba-demo')
on conflict (id) do nothing;

insert into public.providers (id, tenant_id, name)
values ('0f4d6a13-1a28-4ed1-9f79-ef6f2dcd1101', '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd1001', 'Viajes Cuba Demo')
on conflict (id) do nothing;

insert into public.listings (id, tenant_id, provider_id, slug, name, category, published, max_guests, source_name, license_status)
values
  ('0f4d6a13-1a28-4ed1-9f79-ef6f2dcd2001', '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd1001', '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd1101', 'hotel-prado-boutique', 'Hotel Prado Boutique', 'hotel', true, 2, 'demo', 'demo_only'),
  ('0f4d6a13-1a28-4ed1-9f79-ef6f2dcd2002', '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd1001', '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd1101', 'hostal-patio-colonial', 'Hostal Patio Colonial', 'hostal', true, 4, 'demo', 'demo_only'),
  ('0f4d6a13-1a28-4ed1-9f79-ef6f2dcd2003', '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd1001', '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd1101', 'villa-mogote-verde', 'Villa Mogote Verde', 'villa', true, 6, 'demo', 'demo_only'),
  ('0f4d6a13-1a28-4ed1-9f79-ef6f2dcd2004', '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd1001', '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd1101', 'costa-clara-resort', 'Costa Clara Resort', 'hotel', true, 3, 'demo', 'demo_only')
on conflict (id) do nothing;
