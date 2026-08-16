create table follow (
  follower_id uuid not null references profiles(id) on delete cascade,
  followee_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

alter table follow enable row level security;

create policy "follows are publicly readable"
  on follow for select
  using (true);

create policy "users manage their own follows"
  on follow for all
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);
