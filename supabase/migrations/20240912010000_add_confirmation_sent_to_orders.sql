-- Add confirmation_sent column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow updates to confirmation_sent from service role
DROP POLICY IF EXISTS "Enable update for service role" ON public.orders;
CREATE POLICY "Enable update for service role" 
ON public.orders
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_sent ON public.orders(confirmation_sent) 
WHERE confirmation_sent = FALSE;
