-- This migration ensures the tickets table has the correct structure and relationships

-- First, ensure the events table exists (required for foreign key)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'events'
    ) THEN
        -- Create a minimal events table if it doesn't exist
        CREATE TABLE public.events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "name" TEXT NOT NULL,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
        
        -- Add RLS policies
        CREATE POLICY "Allow public read access"
        ON public.events
        FOR SELECT
        TO public
        USING (true);
        
        RAISE NOTICE 'Created minimal events table';
    END IF;
    
    -- Create the tickets table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tickets'
    ) THEN
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
        
        RAISE NOTICE 'Created tickets table with indexes and policies';
    END IF;
    
    -- Ensure all required columns exist with correct types
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'userId'
    ) THEN
        ALTER TABLE public.tickets ADD COLUMN "userId" UUID;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'userEmail'
    ) THEN
        ALTER TABLE public.tickets ADD COLUMN "userEmail" TEXT NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'ticketTierId'
    ) THEN
        ALTER TABLE public.tickets ADD COLUMN "ticketTierId" TEXT NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'ticketNumber'
    ) THEN
        ALTER TABLE public.tickets ADD COLUMN "ticketNumber" TEXT NOT NULL DEFAULT '';
        
        -- Set a default value for existing rows
        UPDATE public.tickets 
        SET "ticketNumber" = 'TKT-' || substr(md5(random()::text), 1, 8) 
        WHERE "ticketNumber" = '';
        
        -- Add the unique constraint
        ALTER TABLE public.tickets ADD CONSTRAINT tickets_ticketnumber_key UNIQUE ("ticketNumber");
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.tickets ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING';
    END IF;
    
    -- Ensure updatedAt column exists with correct case
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'updatedAt'
    ) THEN
        -- Try to rename updated_at to updatedAt if it exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'tickets' 
            AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE public.tickets RENAME COLUMN "updated_at" TO "updatedAt";
        ELSE
            ALTER TABLE public.tickets ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now();
        END IF;
    END IF;
    
    -- Ensure createdAt column exists with correct case
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'createdAt'
    ) THEN
        -- Try to rename created_at to createdAt if it exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'tickets' 
            AND column_name = 'created_at'
        ) THEN
            ALTER TABLE public.tickets RENAME COLUMN "created_at" TO "createdAt";
        ELSE
            ALTER TABLE public.tickets ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now();
        END IF;
    END IF;
    
    -- Ensure foreign key constraints exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'tickets' 
        AND constraint_name = 'fk_tickets_order'
    ) THEN
        ALTER TABLE public.tickets 
        ADD CONSTRAINT fk_tickets_order 
        FOREIGN KEY ("orderId") 
        REFERENCES public.orders(id) 
        ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'tickets' 
        AND constraint_name = 'fk_tickets_event'
    ) THEN
        ALTER TABLE public.tickets 
        ADD CONSTRAINT fk_tickets_event 
        FOREIGN KEY ("eventId") 
        REFERENCES public.events(id) 
        ON DELETE CASCADE;
    END IF;
    
    -- Create or replace the update_tickets_updated_at function
    CREATE OR REPLACE FUNCTION public.update_tickets_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
        NEW."updatedAt" = now();
        RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error in update_tickets_updated_at: %', SQLERRM;
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
    
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
    
    -- Create the trigger
    CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tickets_updated_at();
    
    RAISE NOTICE 'Successfully set up tickets table with triggers';
END $$;
