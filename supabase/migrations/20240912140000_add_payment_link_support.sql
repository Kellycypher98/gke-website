-- Add payment link support to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_link_id TEXT,
ADD COLUMN IF NOT EXISTS metadata TEXT;

-- Create index for payment link lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_link_id ON public.orders(payment_link_id);

-- Update RLS policies to allow service role to update these fields
DROP POLICY IF EXISTS "Enable update for service role" ON public.orders;
CREATE POLICY "Enable update for service role" 
ON public.orders
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Add comment to explain the metadata field
COMMENT ON COLUMN public.orders.metadata IS 'Stores additional metadata about the order, including payment link details';

-- Update existing orders with empty metadata if needed
UPDATE public.orders 
SET metadata = '{}' 
WHERE metadata IS NULL;
