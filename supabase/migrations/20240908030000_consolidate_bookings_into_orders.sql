-- Add missing columns to orders table to support all necessary fields
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS "customerEmail" TEXT,
ADD COLUMN IF NOT EXISTS "customerName" TEXT,
ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS "ticketType" TEXT DEFAULT 'standard';

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Allow public read access" ON public.orders;

CREATE POLICY "Allow public read access"
ON public.orders
FOR SELECT
TO public
USING (true);

-- Create a function to update event sold count that can be called from triggers or RPC
CREATE OR REPLACE FUNCTION public.increment_event_sold(event_id TEXT, increment_by INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.events 
  SET "sold" = COALESCE("sold", 0) + increment_by
  WHERE id::TEXT = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
