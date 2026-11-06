-- Saved clients for the Rula TCOC calculator.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- ------------------------------------------------------------
-- Only @rula.com accounts may sign up.
-- ------------------------------------------------------------
create or replace function public.enforce_rula_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null or lower(new.email) not like '%@rula.com' then
    raise exception 'Only @rula.com email addresses can sign in.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_rula_email on auth.users;
create trigger enforce_rula_email
  before insert or update of email on auth.users
  for each row execute function public.enforce_rula_email();

-- True when the signed-in user has a @rula.com email.
create or replace function public.is_rula_user()
returns boolean
language sql
stable
as $$
  select coalesce(lower(auth.jwt() ->> 'email') like '%@rula.com', false);
$$;

-- ------------------------------------------------------------
-- Clients table
-- ------------------------------------------------------------
create table if not exists public.clients (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (length(trim(name)) > 0),
  contact_name     text not null default '',
  contact_email    text not null default '',
  notes            text not null default '',
  -- Full calculator snapshot: inputs, scenarios, absenteeism, engagement plan.
  data             jsonb not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  created_by_email text not null default coalesce(auth.jwt() ->> 'email', ''),
  updated_by_email text not null default coalesce(auth.jwt() ->> 'email', '')
);

create index if not exists clients_updated_at_idx on public.clients (updated_at desc);

-- Stamp updated_at / updated_by on every change.
create or replace function public.touch_client()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.updated_by_email := coalesce(auth.jwt() ->> 'email', new.updated_by_email);
  new.created_at := old.created_at;
  new.created_by_email := old.created_by_email;
  return new;
end;
$$;

drop trigger if exists touch_client on public.clients;
create trigger touch_client
  before update on public.clients
  for each row execute function public.touch_client();

-- ------------------------------------------------------------
-- Row-level security: any signed-in @rula.com user shares the list.
-- ------------------------------------------------------------
alter table public.clients enable row level security;

drop policy if exists "rula users read clients" on public.clients;
create policy "rula users read clients" on public.clients
  for select to authenticated using (public.is_rula_user());

drop policy if exists "rula users add clients" on public.clients;
create policy "rula users add clients" on public.clients
  for insert to authenticated with check (public.is_rula_user());

drop policy if exists "rula users edit clients" on public.clients;
create policy "rula users edit clients" on public.clients
  for update to authenticated using (public.is_rula_user()) with check (public.is_rula_user());

drop policy if exists "rula users delete clients" on public.clients;
create policy "rula users delete clients" on public.clients
  for delete to authenticated using (public.is_rula_user());
