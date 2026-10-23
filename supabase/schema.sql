-- ============================================================
--  Makeup artist website: database setup for Supabase (free tier)
--  Paste this whole file into Supabase → SQL Editor → New query → Run.
--  Then change the email on the LAST line to the admin's email and run that line.
-- ============================================================

-- ---------- tables ----------
-- (Already ran an older version? Also run:  alter table public.bookings add column if not exists replied_at timestamptz;)
create table if not exists public.settings (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  constraint settings_single_row check (id = 1)
);

create table if not exists public.posts (
  id text primary key,
  kind text not null check (kind in ('portfolio', 'blog')),
  title text not null,
  slug text unique,
  excerpt text,
  body text,
  cover text,
  images jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  published boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.offers (
  id text primary key,
  title text not null,
  description text,
  badge text,
  price text,
  was_price text,
  valid_until text,
  active boolean default true,
  sort int default 0,
  created_at timestamptz default now()
);

create table if not exists public.services (
  id text primary key,
  title text not null,
  description text,
  price text,
  duration text,
  sort int default 0,
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id text primary key,
  name text not null,
  phone text,
  email text,
  occasion text,
  event_date text,
  ready_by text,
  faces int default 1,
  location text,
  message text,
  status text default 'new',
  replied_at timestamptz,
  created_at timestamptz default now()
);

-- Who is allowed to edit the website
create table if not exists public.admins (email text primary key);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- ---------- security (row level security) ----------
alter table public.settings enable row level security;
alter table public.posts    enable row level security;
alter table public.offers   enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.admins   enable row level security;   -- no policies: not readable from the website

-- everyone can read the public content
drop policy if exists "read settings" on public.settings;
create policy "read settings" on public.settings for select using (true);
drop policy if exists "read posts" on public.posts;
create policy "read posts" on public.posts for select using (published = true or public.is_admin());
drop policy if exists "read offers" on public.offers;
create policy "read offers" on public.offers for select using (active = true or public.is_admin());
drop policy if exists "read services" on public.services;
create policy "read services" on public.services for select using (true);

-- only the admin can change content
drop policy if exists "admin settings" on public.settings;
create policy "admin settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin posts" on public.posts;
create policy "admin posts" on public.posts for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin offers" on public.offers;
create policy "admin offers" on public.offers for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin services" on public.services;
create policy "admin services" on public.services for all using (public.is_admin()) with check (public.is_admin());

-- bookings: anyone can SEND a request; only the admin can read, update or delete
drop policy if exists "send booking" on public.bookings;
create policy "send booking" on public.bookings for insert to anon, authenticated with check (status = 'new');
drop policy if exists "admin bookings" on public.bookings;
create policy "admin bookings" on public.bookings for all using (public.is_admin()) with check (public.is_admin());

-- ---------- photo storage ----------
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "read media" on storage.objects;
create policy "read media" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "admin upload media" on storage.objects;
create policy "admin upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "admin change media" on storage.objects;
create policy "admin change media" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "admin delete media" on storage.objects;
create policy "admin delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ---------- make yourself admin ----------
-- Replace the email below with the email you will log in with, then run:
insert into public.admins (email) values ('mwah2magirlies@hotmail.co.uk') on conflict do nothing;
