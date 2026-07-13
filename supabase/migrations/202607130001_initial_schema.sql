create type public.user_role as enum ('traveler', 'operator', 'admin');
create type public.quote_request_status as enum ('draft', 'submitted', 'reviewing', 'quoted', 'accepted', 'confirmed', 'completed', 'rejected', 'cancelled');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  full_name text,
  role public.user_role not null default 'traveler',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  slug text not null,
  name text not null,
  category text not null check (category in ('hotel', 'hostal', 'villa', 'experience', 'transport')),
  published boolean not null default false,
  max_guests integer not null check (max_guests > 0),
  source_name text not null default 'manual',
  source_url text,
  license_status text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  traveler_id uuid not null references public.profiles(id) on delete restrict,
  reference text not null unique default ('VJ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  status public.quote_request_status not null default 'submitted',
  check_in date not null,
  check_out date not null,
  adults integer not null check (adults > 0),
  children integer not null default 0 check (children >= 0),
  rooms integer not null default 1 check (rooms > 0),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  notes text,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in),
  unique (traveler_id, idempotency_key)
);

create table public.quote_request_items (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (quote_request_id, listing_id)
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null unique references public.quote_requests(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null check (currency in ('USD', 'CUP', 'EUR')),
  expires_at timestamptz not null,
  conditions text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null unique references public.quote_requests(id) on delete restrict,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  status public.quote_request_status not null default 'confirmed',
  created_at timestamptz not null default now()
);

create table public.reservation_events (
  id bigint generated always as identity primary key,
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  from_status public.quote_request_status,
  to_status public.quote_request_status not null,
  note text,
  created_at timestamptz not null default now()
);

create index listings_public_search_idx on public.listings (published, category, max_guests);
create index quote_requests_tenant_status_idx on public.quote_requests (tenant_id, status, created_at desc);
create index reservation_events_request_idx on public.reservation_events (quote_request_id, created_at);

create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.current_tenant_id()
returns uuid
language sql stable security definer set search_path = public
as $$ select tenant_id from public.profiles where id = auth.uid() $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger listings_updated_at before update on public.listings for each row execute procedure public.set_updated_at();
create trigger quote_requests_updated_at before update on public.quote_requests for each row execute procedure public.set_updated_at();

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.listings enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_request_items enable row level security;
alter table public.quotes enable row level security;
alter table public.reservations enable row level security;
alter table public.reservation_events enable row level security;

create policy "published listings are public" on public.listings for select using (published or tenant_id = public.current_tenant_id() or public.current_role() = 'admin');
create policy "operators manage tenant listings" on public.listings for all using (tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin')) with check (tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin'));
create policy "users read own profile" on public.profiles for select using (id = auth.uid() or public.current_role() = 'admin');
create policy "users update own profile fields" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = public.current_role() and tenant_id is not distinct from public.current_tenant_id());
create policy "admins manage profiles" on public.profiles for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "tenant staff read tenants" on public.tenants for select using (id = public.current_tenant_id() or public.current_role() = 'admin');
create policy "admins manage tenants" on public.tenants for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "tenant staff manage providers" on public.providers for all using (tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin')) with check (tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin'));
create policy "travelers read their requests" on public.quote_requests for select using (traveler_id = auth.uid() or (tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin')));
create policy "operators update tenant requests" on public.quote_requests for update using (tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin')) with check (tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin'));
create policy "request items follow request access" on public.quote_request_items for select using (exists (select 1 from public.quote_requests r where r.id = quote_request_id and (r.traveler_id = auth.uid() or (r.tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin')))));
create policy "tenant staff manage quotes" on public.quotes for all using (exists (select 1 from public.quote_requests r where r.id = quote_request_id and r.tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin'))) with check (exists (select 1 from public.quote_requests r where r.id = quote_request_id and r.tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin')));
create policy "request parties read reservations" on public.reservations for select using (exists (select 1 from public.quote_requests r where r.id = quote_request_id and (r.traveler_id = auth.uid() or (r.tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin')))));
create policy "tenant staff manage reservations" on public.reservations for all using (tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin')) with check (tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin'));
create policy "request parties read events" on public.reservation_events for select using (exists (select 1 from public.quote_requests r where r.id = quote_request_id and (r.traveler_id = auth.uid() or (r.tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin')))));

create or replace function public.create_quote_request(
  p_check_in date,
  p_check_out date,
  p_adults integer,
  p_children integer,
  p_rooms integer,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_notes text,
  p_idempotency_key uuid,
  p_items jsonb
)
returns table (id uuid, reference text)
language plpgsql security definer set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_request_id uuid;
  v_reference text;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;
  if p_check_out <= p_check_in or p_adults <= 0 or p_children < 0 or p_rooms <= 0 then
    raise exception 'invalid_stay';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'request_requires_items';
  end if;

  select qr.id, qr.reference into v_request_id, v_reference
  from public.quote_requests qr
  where qr.traveler_id = auth.uid() and qr.idempotency_key = p_idempotency_key;
  if found then
    return query select v_request_id, v_reference;
    return;
  end if;

  select l.tenant_id into v_tenant_id
  from public.listings l
  join jsonb_to_recordset(p_items) as i(listing_id uuid, quantity integer) on i.listing_id = l.id
  where l.published and l.max_guests >= p_adults + p_children
  limit 1;

  if v_tenant_id is null or exists (
    select 1
    from jsonb_to_recordset(p_items) as i(listing_id uuid, quantity integer)
    left join public.listings l on l.id = i.listing_id
    where l.id is null or not l.published or l.tenant_id <> v_tenant_id
      or l.max_guests < p_adults + p_children or i.quantity <= 0
  ) then
    raise exception 'invalid_request_items';
  end if;

  insert into public.quote_requests (
    tenant_id, traveler_id, check_in, check_out, adults, children, rooms,
    contact_name, contact_email, contact_phone, notes, idempotency_key
  ) values (
    v_tenant_id, auth.uid(), p_check_in, p_check_out, p_adults, p_children, p_rooms,
    p_contact_name, p_contact_email, p_contact_phone, p_notes, p_idempotency_key
  ) returning quote_requests.id, quote_requests.reference into v_request_id, v_reference;

  insert into public.quote_request_items (quote_request_id, listing_id, quantity)
  select v_request_id, i.listing_id, i.quantity
  from jsonb_to_recordset(p_items) as i(listing_id uuid, quantity integer);

  insert into public.reservation_events (quote_request_id, actor_id, to_status, note)
  values (v_request_id, auth.uid(), 'submitted', 'Solicitud creada');

  return query select v_request_id, v_reference;
end;
$$;

create or replace function public.transition_quote_request(
  p_quote_request_id uuid,
  p_to_status public.quote_request_status,
  p_note text default null
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_request public.quote_requests;
  v_is_staff boolean;
begin
  select * into v_request from public.quote_requests where id = p_quote_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  v_is_staff := v_request.tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin');

  if (v_is_staff and (v_request.status, p_to_status) in (('submitted', 'reviewing'), ('reviewing', 'quoted'), ('quoted', 'confirmed'), ('reviewing', 'rejected'), ('quoted', 'cancelled'), ('accepted', 'confirmed'), ('confirmed', 'completed')))
     or (v_request.traveler_id = auth.uid() and (v_request.status, p_to_status) in (('quoted', 'accepted'), ('draft', 'cancelled'), ('submitted', 'cancelled'), ('quoted', 'cancelled'), ('accepted', 'cancelled'))) then
    update public.quote_requests set status = p_to_status where id = p_quote_request_id;
    insert into public.reservation_events (quote_request_id, actor_id, from_status, to_status, note)
    values (p_quote_request_id, auth.uid(), v_request.status, p_to_status, p_note);
  else
    raise exception 'invalid_status_transition';
  end if;
end;
$$;

revoke all on function public.create_quote_request(date, date, integer, integer, integer, text, text, text, text, uuid, jsonb) from public;
revoke all on function public.transition_quote_request(uuid, public.quote_request_status, text) from public;
grant execute on function public.create_quote_request(date, date, integer, integer, integer, text, text, text, text, uuid, jsonb) to authenticated;
grant execute on function public.transition_quote_request(uuid, public.quote_request_status, text) to authenticated;
