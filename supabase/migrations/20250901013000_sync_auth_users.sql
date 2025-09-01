-- Migration: Sync auth.users with public.users and grant RLS access
-- --------------------------------------------------------------
-- 1. Function to copy new auth users into public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert matching row in public.users if it does not exist
  insert into public.users (id, email, role)
  values (new.id, new.email, 'USER')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Trigger fired after a user signs up via Supabase Auth
create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 3. Enable Row Level Security and add a simple self-select policy
alter table public.users enable row level security;

create policy "Users can read themselves"
  on public.users
  for select
  using ( id = auth.uid() );

-- You may add additional policies (update/delete) later if needed.
