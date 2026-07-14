create type public.lead_type as enum ('traveler', 'provider');
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'spam');
create type public.preferred_contact_channel as enum ('email', 'whatsapp', 'phone');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  public_reference text not null unique default ('LD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  lead_type public.lead_type not null default 'traveler',
  status public.lead_status not null default 'new',
  full_name text not null,
  email text,
  phone text,
  preferred_channel public.preferred_contact_channel,
  destination text,
  check_in date,
  check_out date,
  adults integer check (adults is null or adults > 0),
  children integer check (children is null or children >= 0),
  rooms integer check (rooms is null or rooms > 0),
  budget_min numeric(12, 2) check (budget_min is null or budget_min >= 0),
  budget_max numeric(12, 2) check (budget_max is null or budget_max >= 0),
  currency text check (currency is null or currency in ('USD', 'CUP', 'EUR')),
  message text,
  source text not null default 'portal',
  landing_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  anonymous_session_id uuid,
  ip_hash text,
  assigned_to uuid references public.profiles(id) on delete set null,
  score integer not null default 0 check (score >= 0 and score <= 100),
  first_response_at timestamptz,
  converted_quote_request_id uuid references public.quote_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or phone is not null),
  check (check_out is null or check_in is not null and check_out > check_in),
  check (budget_max is null or budget_min is null or budget_max >= budget_min)
);

create table public.lead_events (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (event_type in ('created', 'assigned', 'status_changed', 'contacted', 'note_added', 'converted', 'lost')),
  from_status public.lead_status,
  to_status public.lead_status,
  note text,
  created_at timestamptz not null default now()
);

create table public.lead_consents (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  consent_type text not null check (consent_type in ('contact', 'marketing')),
  granted boolean not null,
  legal_version text not null,
  channel text not null default 'web_form',
  created_at timestamptz not null default now(),
  unique (lead_id, consent_type)
);

create index leads_tenant_status_created_idx on public.leads (tenant_id, status, created_at desc);
create index leads_tenant_contact_idx on public.leads (tenant_id, email, phone);
create index lead_events_lead_created_idx on public.lead_events (lead_id, created_at);

create trigger leads_updated_at before update on public.leads for each row execute procedure public.set_updated_at();

alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
alter table public.lead_consents enable row level security;

revoke all on table public.leads, public.lead_events, public.lead_consents from anon, authenticated;
grant select on table public.leads, public.lead_events, public.lead_consents to authenticated;

create policy "tenant staff read leads" on public.leads for select to authenticated using (
  tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin')
);
create policy "tenant staff read lead events" on public.lead_events for select to authenticated using (
  exists (select 1 from public.leads lead where lead.id = lead_id and lead.tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin'))
);
create policy "tenant staff read lead consents" on public.lead_consents for select to authenticated using (
  exists (select 1 from public.leads lead where lead.id = lead_id and lead.tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin'))
);
