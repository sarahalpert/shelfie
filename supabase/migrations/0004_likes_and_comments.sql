create table likes (
  log_id uuid not null references log(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (log_id, user_id)
);

alter table likes enable row level security;

create policy "likes are publicly readable"
  on likes for select
  using (true);

create policy "users manage their own likes"
  on likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table comments (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references log(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table comments enable row level security;

create policy "comments are publicly readable"
  on comments for select
  using (true);

create policy "users can add comments"
  on comments for insert
  with check (auth.uid() = user_id);

create policy "users can delete their own comments"
  on comments for delete
  using (auth.uid() = user_id);
