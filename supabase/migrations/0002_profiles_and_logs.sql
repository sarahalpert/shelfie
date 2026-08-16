create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are publicly readable"
  on profiles for select
  using (true);

create policy "users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create type log_status as enum ('want', 'in_progress', 'done');

create table log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  media_item_id uuid not null references media_item(id) on delete cascade,
  rating numeric(2,1) check (rating >= 0.5 and rating <= 5 and rating * 2 = round(rating * 2)),
  status log_status not null default 'done',
  created_at timestamptz not null default now(),

  unique (user_id, media_item_id)
);

alter table log enable row level security;

create policy "logs are publicly readable"
  on log for select
  using (true);

create policy "users manage their own logs"
  on log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table review (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null unique references log(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table review enable row level security;

create policy "reviews are publicly readable"
  on review for select
  using (true);

create policy "users manage reviews on their own logs"
  on review for all
  using (exists (select 1 from log where log.id = review.log_id and log.user_id = auth.uid()))
  with check (exists (select 1 from log where log.id = review.log_id and log.user_id = auth.uid()));
