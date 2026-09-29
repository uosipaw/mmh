-- Private journals; deliberately separate public snapshots from private notes.
create table public.tarot_profiles (
 id uuid primary key references auth.users on delete cascade,
 username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
 display_name text not null default '' check(length(display_name)<=80),
 bio text not null default '' check(length(bio)<=500),
 is_public boolean not null default false
);
create table public.tarot_readings (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users on delete cascade,
 local_id text not null check(length(local_id)<=100), payload jsonb not null check(octet_length(payload::text)<=40000),
 updated_at timestamptz not null default now(), unique(owner_id,local_id)
);
create table public.tarot_shares (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users on delete cascade,
 reading_id uuid not null references public.tarot_readings on delete cascade,
 recipient_id uuid references auth.users on delete cascade,
 payload jsonb not null, allow_ai boolean not null default false, created_at timestamptz not null default now()
);
create table public.tarot_orders (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users on delete cascade,
 kind text not null check(kind in ('interpretation','comparison')), input jsonb not null,
 stripe_session text unique, amount bigint not null, currency text not null,
 status text not null default 'unpaid' check(status in ('unpaid','ready','processing','complete','failed')),
 report text, attempts int not null default 0, created_at timestamptz not null default now()
);
alter table public.tarot_profiles enable row level security;
alter table public.tarot_readings enable row level security;
alter table public.tarot_shares enable row level security;
alter table public.tarot_orders enable row level security;
create policy profile_read on public.tarot_profiles for select using (is_public or id=auth.uid());
create policy profile_insert on public.tarot_profiles for insert to authenticated with check(id=auth.uid());
create policy profile_update on public.tarot_profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy journal_owner on public.tarot_readings for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy share_read on public.tarot_shares for select using (recipient_id is null or recipient_id=auth.uid() or owner_id=auth.uid());
create policy share_revoke on public.tarot_shares for delete to authenticated using(owner_id=auth.uid());
create policy order_read on public.tarot_orders for select to authenticated using(owner_id=auth.uid());
-- No browser can insert a share snapshot, create an entitlement, or change payment status.
revoke all on public.tarot_profiles,public.tarot_readings,public.tarot_shares,public.tarot_orders from anon,authenticated;
grant select on public.tarot_profiles,public.tarot_shares to anon,authenticated;
grant insert,update on public.tarot_profiles to authenticated;
grant select,insert,update,delete on public.tarot_readings to authenticated;
grant delete on public.tarot_shares to authenticated;
grant select on public.tarot_orders to authenticated;
grant all on public.tarot_profiles,public.tarot_readings,public.tarot_shares,public.tarot_orders to service_role;
create index tarot_shares_recipient on public.tarot_shares(recipient_id);
create index tarot_orders_owner on public.tarot_orders(owner_id,created_at);
