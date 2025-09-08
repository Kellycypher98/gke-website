-- Update RLS policies for the orders table to allow public inserts
-- This is needed for guest checkouts

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert" ON public.orders;

-- Allow public read access to all orders
CREATE POLICY "Allow public read access"
ON public.orders
FOR SELECT
TO public
USING (true);

-- Allow public to insert new orders (for guest checkouts)
CREATE POLICY "Allow public insert"
ON public.orders
FOR INSERT
TO public
WITH CHECK (true);
