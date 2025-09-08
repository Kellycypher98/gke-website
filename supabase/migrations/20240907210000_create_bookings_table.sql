-- Create the bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  ticket_type TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  amount_paid INTEGER NOT NULL,
  payment_status TEXT NOT NULL,
  payment_intent_id TEXT,
  stripe_session_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add foreign key constraint if events table exists
  CONSTRAINT fk_event
    FOREIGN KEY (event_id)
    REFERENCES public.events(id)
    ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON public.bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session_id ON public.bookings(stripe_session_id);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns
COMMENT ON TABLE public.bookings IS 'Stores booking information for events';
COMMENT ON COLUMN public.bookings.event_id IS 'Reference to the event this booking is for';
COMMENT ON COLUMN public.bookings.ticket_type IS 'Type of ticket purchased (e.g., early_bird, standard, vip)';
COMMENT ON COLUMN public.bookings.customer_email IS 'Email of the customer who made the booking';
COMMENT ON COLUMN public.bookings.amount_paid IS 'Amount paid in the smallest currency unit (e.g., cents for USD)';
COMMENT ON COLUMN public.bookings.payment_status IS 'Current status of the payment (e.g., paid, pending, failed)';
COMMENT ON COLUMN public.bookings.stripe_session_id IS 'Stripe checkout session ID';
COMMENT ON COLUMN public.bookings.status IS 'Booking status (e.g., confirmed, cancelled, refunded)';
