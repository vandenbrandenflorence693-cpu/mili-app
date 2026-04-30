-- Run this script in your Supabase SQL Editor
create table public.app_data (
  id integer primary key default 1,
  data jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure only one row exists
insert into public.app_data (id, data) values (1, '{}') on conflict (id) do nothing;

-- Set up Row Level Security (RLS)
alter table public.app_data enable row level security;

-- For demo/private use, allow anonymous read/write 
-- WARNING: In a production app with unknown users, you should use Supabase Auth instead.
create policy "Enable all access for anonymous users" on public.app_data
  for all using (true) with check (true);
