-- Create storage bucket (in Supabase dashboard, Storage -> New bucket named 'books' public)
-- Create table for books
create table if not exists public.books (
  id bigserial primary key,
  title text not null,
  stage text not null,
  grade int not null,
  category text not null,
  level text not null,
  sizeMB int not null default 0,
  url text not null,
  storage_path text
);
-- (Optional) RLS can remain off for simplicity since API uses service role.


-- === Dynamic settings tables ===
create table if not exists public.stages (
  id text primary key,
  name text not null,
  range text not null,
  grades integer[] not null
);

create table if not exists public.categories (
  id text primary key,
  name text not null
);

create table if not exists public.levels (
  id text primary key,
  name text not null
);
