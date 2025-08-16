
-- Run inside Supabase SQL Editor
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default now()
);

create table if not exists progress (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  lesson_id text,
  status text default 'done',
  xp integer default 0,
  updated_at timestamp with time zone default now()
);
create index if not exists progress_user_id_idx on progress(user_id);

create or replace function increment_xp(p_user_id uuid, p_amount int)
returns void language plpgsql security definer as $$
begin
  insert into progress(user_id, lesson_id, status, xp)
  values (p_user_id, gen_random_uuid()::text, 'xp', p_amount);
end; $$;

-- leaderboard view via RPC
create or replace function leaderboard_top(p_limit int default 10)
returns table (user_id uuid, display_name text, total_xp int) language sql stable as $$
  select p.user_id, pr.display_name, sum(p.xp)::int as total_xp
  from progress p
  left join profiles pr on pr.user_id = p.user_id
  group by p.user_id, pr.display_name
  order by sum(p.xp) desc
  limit p_limit
$$;

-- Chat
create table if not exists messages (
  id bigserial primary key,
  user_id uuid default auth.uid(),
  body text not null check (length(body) <= 500),
  created_at timestamp with time zone default now()
);
create index if not exists messages_created_at_idx on messages(created_at desc);

-- Recommended RLS policies
alter table profiles enable row level security;
create policy "profiles select own" on profiles for select using ( auth.uid() = user_id );
create policy "profiles upsert own" on profiles for insert with check ( auth.uid() = user_id );
create policy "profiles update own" on profiles for update using ( auth.uid() = user_id );

alter table progress enable row level security;
create policy "progress read own" on progress for select using ( auth.uid() = user_id );
create policy "progress insert own" on progress for insert with check ( auth.uid() = user_id );

alter table messages enable row level security;
create policy "messages read all" on messages for select using ( true );
create policy "messages insert auth" on messages for insert with check ( auth.uid() is not null );
