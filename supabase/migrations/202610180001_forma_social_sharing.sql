-- Private connections and explicit menu/routine sharing for Forma.
create table if not exists public.forma_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  constraint forma_connections_no_self check (requester_id <> recipient_id),
  constraint forma_connections_pair unique (requester_id, recipient_id)
);

create index if not exists forma_connections_recipient_status on public.forma_connections(recipient_id, status);
alter table public.forma_connections enable row level security;
revoke all on public.forma_connections from anon, authenticated;
grant select on public.forma_connections to authenticated;
grant update (status, accepted_at) on public.forma_connections to authenticated;
drop policy if exists "Participants can view connection requests" on public.forma_connections;
create policy "Participants can view connection requests" on public.forma_connections
  for select to authenticated using (auth.uid() = requester_id or auth.uid() = recipient_id);
drop policy if exists "Recipients can respond to connection requests" on public.forma_connections;
create policy "Recipients can respond to connection requests" on public.forma_connections
  for update to authenticated using (auth.uid() = recipient_id and status = 'pending')
  with check (auth.uid() = recipient_id and status in ('accepted', 'rejected'));

create table if not exists public.forma_shared_items (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('menu', 'routine')),
  title text not null check (char_length(title) between 1 and 100),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  saved_at timestamptz,
  constraint forma_shared_items_no_self check (sender_id <> recipient_id)
);
create index if not exists forma_shared_items_recipient on public.forma_shared_items(recipient_id, created_at desc) where revoked_at is null;
alter table public.forma_shared_items enable row level security;
revoke all on public.forma_shared_items from anon, authenticated;
grant select on public.forma_shared_items to authenticated;
grant update (revoked_at, saved_at) on public.forma_shared_items to authenticated;
drop policy if exists "Share participants can view active shares" on public.forma_shared_items;
create policy "Share participants can view active shares" on public.forma_shared_items
  for select to authenticated using ((auth.uid() = sender_id or auth.uid() = recipient_id) and revoked_at is null);
drop policy if exists "Senders can revoke shares" on public.forma_shared_items;
create policy "Senders can revoke shares" on public.forma_shared_items
  for update to authenticated using (auth.uid() = sender_id and revoked_at is null)
  with check (auth.uid() = sender_id);
drop policy if exists "Recipients can mark shared items saved" on public.forma_shared_items;
create policy "Recipients can mark shared items saved" on public.forma_shared_items
  for update to authenticated using (auth.uid() = recipient_id and revoked_at is null)
  with check (auth.uid() = recipient_id);

create or replace function public.forma_request_connection_by_email(p_email text)
returns void language plpgsql security definer set search_path = '' as $$
declare target_id uuid; existing_request public.forma_connections;
begin
  if auth.uid() is null or p_email is null or length(trim(p_email)) > 320 then return; end if;
  select id into target_id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if target_id is null or target_id = auth.uid() then return; end if;
  select * into existing_request from public.forma_connections c where
    (c.requester_id = auth.uid() and c.recipient_id = target_id) or
    (c.requester_id = target_id and c.recipient_id = auth.uid()) limit 1;
  if found then
    if existing_request.status = 'rejected' then
      update public.forma_connections set requester_id = auth.uid(), recipient_id = target_id,
        status = 'pending', created_at = now(), accepted_at = null where id = existing_request.id;
    end if;
    return;
  end if;
  insert into public.forma_connections(requester_id, recipient_id) values (auth.uid(), target_id)
    on conflict (requester_id, recipient_id) do nothing;
end;
$$;
revoke all on function public.forma_request_connection_by_email(text) from public, anon;
grant execute on function public.forma_request_connection_by_email(text) to authenticated;

create or replace function public.forma_list_connections()
returns table(id uuid, requester_id uuid, recipient_id uuid, status text, created_at timestamptz, other_email text)
language sql stable security definer set search_path = '' as $$
  select c.id, c.requester_id, c.recipient_id, c.status, c.created_at, u.email::text
  from public.forma_connections c
  join auth.users u on u.id = case when c.requester_id = auth.uid() then c.recipient_id else c.requester_id end
  where auth.uid() = c.requester_id or auth.uid() = c.recipient_id
  order by c.created_at desc;
$$;
revoke all on function public.forma_list_connections() from public, anon;
grant execute on function public.forma_list_connections() to authenticated;

create or replace function public.forma_send_share(p_connection_id uuid, p_kind text, p_title text, p_payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare connection_row public.forma_connections; new_id uuid; target_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into connection_row from public.forma_connections c where c.id = p_connection_id
    and c.status = 'accepted' and (c.requester_id = auth.uid() or c.recipient_id = auth.uid());
  if not found then raise exception 'Connection unavailable'; end if;
  if p_kind not in ('menu', 'routine') or jsonb_typeof(p_payload) <> 'object' or length(trim(p_title)) not between 1 and 100 then
    raise exception 'Invalid share';
  end if;
  target_id := case when connection_row.requester_id = auth.uid() then connection_row.recipient_id else connection_row.requester_id end;
  insert into public.forma_shared_items(sender_id, recipient_id, kind, title, payload)
    values (auth.uid(), target_id, p_kind, trim(p_title), p_payload) returning id into new_id;
  return new_id;
end;
$$;
revoke all on function public.forma_send_share(uuid, text, text, jsonb) from public, anon;
grant execute on function public.forma_send_share(uuid, text, text, jsonb) to authenticated;
