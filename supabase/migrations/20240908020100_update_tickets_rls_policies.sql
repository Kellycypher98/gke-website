-- Enable RLS on the tickets table if not already enabled
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.tickets;
DROP POLICY IF EXISTS "Allow select for users viewing their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Allow service role to manage tickets" ON public.tickets;

-- Create new policies
-- Allow service role full access (for server-side operations)
CREATE POLICY "Allow service role to manage tickets"
ON public.tickets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to insert tickets
CREATE POLICY "Allow insert for authenticated users"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow unauthenticated inserts (for guest checkouts)
CREATE POLICY "Allow unauthenticated inserts"
ON public.tickets
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow users to view their own tickets by user_id or email
CREATE POLICY "Allow select for users viewing their own tickets"
ON public.tickets
FOR SELECT
USING (
  auth.role() = 'service_role' OR
  "userId" = auth.uid() OR
  (auth.role() = 'anon' AND "userEmail" IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ))
);

-- Allow public read access to tickets (adjust if you need more restrictions)
CREATE POLICY "Allow public read access"
ON public.tickets
FOR SELECT
TO public
USING (true);
