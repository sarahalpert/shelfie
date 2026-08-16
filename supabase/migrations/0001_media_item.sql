create type media_type as enum ('book', 'movie', 'tv');
create type external_source as enum ('tmdb', 'openlibrary');

create table media_item (
  id uuid primary key default gen_random_uuid(),
  type media_type not null,
  title text not null,
  year integer,
  image_url text,
  external_source external_source not null,
  external_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  unique (external_source, external_id)
);

alter table media_item enable row level security;

create policy "media_item is publicly readable"
  on media_item for select
  using (true);
