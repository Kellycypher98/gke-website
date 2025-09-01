-- Create a function to get user role
create or replace function public.get_user_role(user_id uuid)
returns text
language sql
security definer
as $$
  select role from public.users where id = user_id;
$$;
