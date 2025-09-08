-- Enable RLS on the events table if not already enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON public.events;
DROP POLICY IF EXISTS "Allow service role to manage events" ON public.events;

-- Create new policies
-- Allow service role full access (for server-side operations)
CREATE POLICY "Allow service role to manage events"
ON public.events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public read access to events
CREATE POLICY "Allow public read access"
ON public.events
FOR SELECT
TO public
USING (true);

-- Allow updates to sold count via the increment function
CREATE POLICY "Allow increment_event_sold function"
ON public.events
FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);
