-- Add stripe_payment_link_id column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS stripe_payment_link_id TEXT;

-- Add comment to the new column
COMMENT ON COLUMN public.bookings.stripe_payment_link_id IS 'Stripe Payment Link ID if this booking was created via a Payment Link';

-- Create an index for faster lookups by payment link ID
CREATE INDEX IF NOT EXISTS idx_bookings_payment_link_id 
ON public.bookings(stripe_payment_link_id) 
WHERE stripe_payment_link_id IS NOT NULL;
