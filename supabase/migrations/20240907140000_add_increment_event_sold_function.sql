-- Create a function to increment the sold count of an event
create or replace function increment_event_sold(event_id uuid, increment_by integer)
returns void as $$
begin
  update events
  set sold = sold + increment_by
  where id = event_id;
end;
$$ language plpgsql security definer;
