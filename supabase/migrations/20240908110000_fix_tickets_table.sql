-- Drop existing table if it exists
DROP TABLE IF EXISTS public.tickets CASCADE;

-- Create tickets table with explicit UUID type for orderId
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "userId" UUID,
    "userEmail" TEXT NOT NULL,
    "ticketTierId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_tickets_order FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_tickets_event FOREIGN KEY ("eventId") REFERENCES public.events(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_tickets_order_id ON public.tickets("orderId");
CREATE INDEX idx_tickets_event_id ON public.tickets("eventId");
CREATE INDEX idx_tickets_user_id ON public.tickets("userId");
CREATE INDEX idx_tickets_ticket_number ON public.tickets("ticketNumber");

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow public read access"
ON public.tickets
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow all access to service role"
ON public.tickets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add a trigger to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION update_tickets_updated_at();
