-- Enable RLS on the orders table if not already enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Allow select for users viewing their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service role to manage orders" ON public.orders;

-- Create new policies
-- Allow service role full access (for server-side operations)
CREATE POLICY "Allow service role to manage orders"
ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to insert orders
CREATE POLICY "Allow insert for authenticated users"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view their own orders
CREATE POLICY "Allow select for users viewing their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING ("userId" = auth.uid() OR "userId" IS NULL);

-- Allow unauthenticated inserts (for guest checkouts)
CREATE POLICY "Allow unauthenticated inserts"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow public read access to orders (adjust if you need more restrictions)
CREATE POLICY "Allow public read access"
ON public.orders
FOR SELECT
TO public
USING (true);
