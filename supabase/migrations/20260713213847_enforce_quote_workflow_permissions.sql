revoke all on table public.tenants, public.profiles, public.providers, public.listings,
  public.quote_requests, public.quote_request_items, public.quotes, public.reservations,
  public.reservation_events from anon, authenticated;

grant select on table public.listings to anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant select on table public.tenants, public.quote_requests, public.quote_request_items,
  public.quotes, public.reservations, public.reservation_events to authenticated;
grant select, insert, update, delete on table public.providers, public.listings to authenticated;

drop policy if exists "operators update tenant requests" on public.quote_requests;
drop policy if exists "tenant staff manage quotes" on public.quotes;

create policy "request parties read quotes" on public.quotes for select to authenticated using (
  exists (
    select 1 from public.quote_requests request
    where request.id = quote_request_id
      and (
        request.traveler_id = (select auth.uid())
        or (request.tenant_id = public.current_tenant_id() and public.current_role() in ('operator', 'admin'))
      )
  )
);

create or replace function public.create_quote(
  p_quote_request_id uuid,
  p_amount numeric,
  p_currency text,
  p_expires_at timestamptz,
  p_conditions text default null
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_request public.quote_requests;
  v_quote_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  select * into v_request
  from public.quote_requests
  where id = p_quote_request_id
  for update;

  if not found then
    raise exception 'request_not_found';
  end if;
  if v_request.tenant_id <> public.current_tenant_id()
    or public.current_role() not in ('operator', 'admin') then
    raise exception 'not_authorized';
  end if;
  if v_request.status <> 'reviewing' then
    raise exception 'request_not_ready_for_quote';
  end if;
  if p_amount < 0 or p_currency not in ('USD', 'CUP', 'EUR') or p_expires_at <= now() then
    raise exception 'invalid_quote';
  end if;

  insert into public.quotes (quote_request_id, amount, currency, expires_at, conditions, created_by)
  values (p_quote_request_id, p_amount, p_currency, p_expires_at, nullif(trim(p_conditions), ''), auth.uid())
  returning id into v_quote_id;

  update public.quote_requests set status = 'quoted' where id = p_quote_request_id;
  insert into public.reservation_events (quote_request_id, actor_id, from_status, to_status, note)
  values (p_quote_request_id, auth.uid(), v_request.status, 'quoted', 'Cotizacion creada');

  return v_quote_id;
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

  if (v_is_staff and (v_request.status, p_to_status) in (('submitted', 'reviewing'), ('accepted', 'confirmed'), ('confirmed', 'completed'), ('reviewing', 'rejected')))
     or (v_request.traveler_id = auth.uid() and (v_request.status, p_to_status) in (('quoted', 'accepted'), ('draft', 'cancelled'), ('submitted', 'cancelled'), ('quoted', 'cancelled'), ('accepted', 'cancelled'))) then
    update public.quote_requests set status = p_to_status where id = p_quote_request_id;
    if p_to_status = 'confirmed' then
      insert into public.reservations (quote_request_id, tenant_id, status)
      values (p_quote_request_id, v_request.tenant_id, 'confirmed');
    end if;
    insert into public.reservation_events (quote_request_id, actor_id, from_status, to_status, note)
    values (p_quote_request_id, auth.uid(), v_request.status, p_to_status, p_note);
  else
    raise exception 'invalid_status_transition';
  end if;
end;
$$;

revoke all on function public.create_quote(uuid, numeric, text, timestamptz, text) from public;
grant execute on function public.create_quote(uuid, numeric, text, timestamptz, text) to authenticated;
