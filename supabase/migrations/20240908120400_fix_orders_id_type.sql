-- This migration fixes the type mismatch between tickets.orderId and orders.id

-- First, drop the foreign key constraint if it exists
DO $$
BEGIN
    -- Check if the constraint exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'tickets' 
        AND constraint_name = 'fk_tickets_order'
    ) THEN
        -- Drop the foreign key constraint
        ALTER TABLE public.tickets DROP CONSTRAINT fk_tickets_order;
    END IF;
    
    -- Check the current type of orders.id
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'id' 
        AND data_type != 'uuid'
    ) THEN
        -- Create a temporary table to hold the orders data
        CREATE TEMP TABLE temp_orders AS SELECT * FROM public.orders;
        
        -- Drop the original table
        DROP TABLE public.orders CASCADE;
        
        -- Recreate the orders table with UUID id
        CREATE TABLE public.orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "customerEmail" TEXT,
            "customerName" TEXT,
            "stripeSessionId" TEXT,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "ticketType" TEXT DEFAULT 'standard',
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Copy data back, converting id to UUID
        INSERT INTO public.orders 
        SELECT 
            id::uuid,  -- Explicit cast to UUID
            "customerEmail", 
            "customerName", 
            "stripeSessionId", 
            "status", 
            "ticketType", 
            "createdAt", 
            "updatedAt"
        FROM temp_orders;
        
        -- Drop the temporary table
        DROP TABLE temp_orders;
        
        -- Recreate indexes and constraints
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        
        -- Recreate RLS policies
        DROP POLICY IF EXISTS "Allow public read access" ON public.orders;
        DROP POLICY IF EXISTS "Allow public insert" ON public.orders;
        
        CREATE POLICY "Allow public read access"
        ON public.orders
        FOR SELECT
        TO public
        USING (true);
        
        CREATE POLICY "Allow public insert"
        ON public.orders
        FOR INSERT
        TO public
        WITH CHECK (true);
        
        RAISE NOTICE 'Converted orders.id to UUID type';
    END IF;
    
    -- Now ensure the tickets table has the correct foreign key
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'tickets' 
        AND constraint_name = 'fk_tickets_order'
    ) THEN
        -- Ensure the orderId column is UUID
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'tickets' 
            AND column_name = 'orderId' 
            AND data_type != 'uuid'
        ) THEN
            -- Create a temporary table to hold the tickets data
            CREATE TEMP TABLE temp_tickets AS SELECT * FROM public.tickets;
            
            -- Drop the original table
            DROP TABLE public.tickets CASCADE;
            
            -- Recreate the tickets table with UUID orderId
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
            
            -- Copy data back, converting orderId to UUID
            INSERT INTO public.tickets 
            SELECT 
                id::uuid,  -- Cast id to UUID
                "orderId"::uuid,  -- Cast orderId to UUID
                "eventId"::uuid,  -- Cast eventId to UUID
                "userId"::uuid,   -- Cast userId to UUID (if not null)
                "userEmail", 
                "ticketTierId", 
                "ticketNumber", 
                "status", 
                "createdAt", 
                "updatedAt"
            FROM temp_tickets;
            
            -- Drop the temporary table
            DROP TABLE temp_tickets;
            
            -- Recreate indexes
            CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets("orderId");
            CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets("eventId");
            CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets("userId");
            CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets("ticketNumber");
            
            -- Re-enable RLS
            ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
            
            -- Recreate RLS policies
            DROP POLICY IF EXISTS "Allow public read access" ON public.tickets;
            DROP POLICY IF EXISTS "Allow all access to service role" ON public.tickets;
            
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
            
            RAISE NOTICE 'Converted tickets.orderId to UUID type and recreated foreign key constraint';
        ELSE
            -- Just add the foreign key constraint if the column is already UUID
            ALTER TABLE public.tickets 
            ADD CONSTRAINT fk_tickets_order 
            FOREIGN KEY ("orderId") 
            REFERENCES public.orders(id) 
            ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Recreate the update triggers
    CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW."updatedAt" = now();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
    CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_orders_updated_at();
    
    CREATE OR REPLACE FUNCTION public.update_tickets_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW."updatedAt" = now();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
    CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tickets_updated_at();
    
    RAISE NOTICE 'Successfully fixed type mismatches and recreated all constraints and triggers';
END $$;
