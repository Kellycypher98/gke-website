-- Create tickets table for storing individual ticket information
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    "eventId" UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    "userId" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    "userEmail" TEXT NOT NULL,
    "ticketTierId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "checkedInAt" TIMESTAMP WITH TIME ZONE,
    "checkedInBy" UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets("orderId");
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets("eventId");
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets("userId");
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets("ticketNumber");

-- Add RLS policies for the tickets table
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Allow public read access to tickets (for ticket validation)
CREATE POLICY "Allow public read access"
ON public.tickets
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to update their own tickets
CREATE POLICY "Allow users to update their own tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING ("userId" = auth.uid())
WITH CHECK (true);

-- Allow service role to perform any operation (for server-side operations)
CREATE POLICY "Enable all for service role"
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

-- Add comments to the table and columns
COMMENT ON TABLE public.tickets IS 'Stores individual ticket information for event attendees';
COMMENT ON COLUMN public.tickets."orderId" IS 'Reference to the order this ticket belongs to';
COMMENT ON COLUMN public.tickets."eventId" IS 'Reference to the event this ticket is for';
COMMENT ON COLUMN public.tickets."userId" IS 'Reference to the user who owns this ticket (can be null for guest checkouts)';
COMMENT ON COLUMN public.tickets."userEmail" IS 'Email of the ticket holder';
COMMENT ON COLUMN public.tickets."ticketTierId" IS 'Reference to the ticket tier this ticket is for';
COMMENT ON COLUMN public.tickets."ticketNumber" IS 'Unique ticket number for identification';
COMMENT ON COLUMN public.tickets.status IS 'Ticket status (e.g., PENDING, CONFIRMED, CANCELLED, USED)';
COMMENT ON COLUMN public.tickets."createdAt" IS 'When the ticket was created';
COMMENT ON COLUMN public.tickets."updatedAt" IS 'When the ticket was last updated';
COMMENT ON COLUMN public.tickets."checkedInAt" IS 'When the ticket was checked in';
COMMENT ON COLUMN public.tickets."checkedInBy" IS 'Who checked in the ticket';

-- Create a function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    ticket_number TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        ticket_number := 'TKT-' || to_char(now(), 'YYMMDD') || '-' || 
                        substr(md5(random()::text), 1, 8);
        
        SELECT EXISTS (
            SELECT 1 FROM public.tickets 
            WHERE "ticketNumber" = ticket_number
        ) INTO exists;
        
        EXIT WHEN NOT exists;
    END LOOP;
    
    RETURN ticket_number;
END;
$$ LANGUAGE plpgsql;
