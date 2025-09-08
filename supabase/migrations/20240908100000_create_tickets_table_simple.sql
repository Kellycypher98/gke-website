-- Drop the table if it exists to avoid conflicts
DROP TABLE IF EXISTS public.tickets CASCADE;

-- First, check the data type of the id column in the orders table
DO $$
DECLARE
    orders_id_type TEXT;
BEGIN
    SELECT data_type INTO orders_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'id';
    
    RAISE NOTICE 'Orders ID type: %', orders_id_type;
    
    -- Create a simple tickets table with just the essential columns
    EXECUTE format('CREATE TABLE IF NOT EXISTS public.tickets (
        id %s PRIMARY KEY DEFAULT gen_random_uuid(),
        "orderId" %s NOT NULL,
        "eventId" UUID NOT NULL,
        "userId" UUID,
        "userEmail" TEXT NOT NULL,
        "ticketTierId" TEXT NOT NULL,
        "ticketNumber" TEXT NOT NULL UNIQUE,
        "status" TEXT NOT NULL DEFAULT ''PENDING'',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
    )', 
    orders_id_type, orders_id_type);
    
    -- Add foreign key constraints
    EXECUTE format('
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 
                FROM information_schema.table_constraints 
                WHERE constraint_name = ''fk_tickets_order''
            ) THEN
                ALTER TABLE public.tickets
                ADD CONSTRAINT fk_tickets_order
                FOREIGN KEY ("orderId")
                REFERENCES public.orders(id)
                ON DELETE CASCADE;
            END IF;
        END $$;
    ');
END $$;

ALTER TABLE public.tickets
ADD CONSTRAINT fk_tickets_event
FOREIGN KEY ("eventId")
REFERENCES public.events(id)
ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX idx_tickets_order_id ON public.tickets("orderId");
CREATE INDEX idx_tickets_event_id ON public.tickets("eventId");
CREATE INDEX idx_tickets_user_id ON public.tickets("userId");
CREATE INDEX idx_tickets_ticket_number ON public.tickets("ticketNumber");

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies
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
