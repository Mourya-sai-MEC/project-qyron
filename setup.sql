-- QYRON STUDIO: run once in Supabase > SQL Editor > New query > Run

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null,
  tags text[] not null default '{}',
  date text not null default '',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order bigint not null default 0,
  cover jsonb,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 120),
  email text not null check (char_length(email) <= 200),
  type text not null default '' check (char_length(type) <= 60),
  message text not null check (char_length(message) <= 4000),
  created_at timestamptz not null default now()
);

-- Lock both tables: no public access at all. Only the server (service role key) can read/write.
alter table public.projects enable row level security;
alter table public.messages enable row level security;

-- Public image bucket (images only, 10 MB max). Uploads happen only through signed URLs the server issues to the admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('projects','projects',true,10485760,array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/avif'];
