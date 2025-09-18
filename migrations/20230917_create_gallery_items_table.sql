-- Create gallery_items table
create table if not exists public.gallery_items (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null,
  type text not null check (type in ('image', 'video')),
  image_path text not null,
  thumbnail_path text,
  views bigint default 0,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.gallery_items enable row level security;

-- Create policies for public access
create policy "Public gallery items are viewable by everyone." 
on public.gallery_items for select 
to anon, authenticated 
using (true);

-- Create a function to update the updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to update the updated_at column
create or replace trigger on_gallery_items_updated
  before update on public.gallery_items
  for each row execute function public.handle_updated_at();

-- Create an index for better performance on common queries
create index if not exists idx_gallery_items_category on public.gallery_items (category);
create index if not exists idx_gallery_items_featured on public.gallery_items (featured);
create index if not exists idx_gallery_items_created_at on public.gallery_items (created_at);
