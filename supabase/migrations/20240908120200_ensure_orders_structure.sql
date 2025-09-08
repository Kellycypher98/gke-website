-- This migration ensures the orders table has the correct structure and triggers

-- First, ensure the orders table exists
DO $$
BEGIN
    -- Create the orders table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
    ) THEN
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
        
        -- Enable RLS
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        
        -- Add RLS policies
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
        
        RAISE NOTICE 'Created orders table';
    END IF;
    
    -- Ensure all required columns exist with correct types
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customerEmail'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN "customerEmail" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customerName'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN "customerName" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'stripeSessionId'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN "stripeSessionId" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'ticketType'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN "ticketType" TEXT DEFAULT 'standard';
    END IF;
    
    -- Ensure updatedAt column exists with correct case
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'updatedAt'
    ) THEN
        -- Try to rename updated_at to updatedAt if it exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE public.orders RENAME COLUMN "updated_at" TO "updatedAt";
        ELSE
            ALTER TABLE public.orders ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now();
        END IF;
    END IF;
    
    -- Ensure createdAt column exists with correct case
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'createdAt'
    ) THEN
        -- Try to rename created_at to createdAt if it exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'created_at'
        ) THEN
            ALTER TABLE public.orders RENAME COLUMN "created_at" TO "createdAt";
        ELSE
            ALTER TABLE public.orders ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now();
        END IF;
    END IF;
    
    -- Ensure id is UUID
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'id' 
        AND data_type != 'uuid'
    ) THEN
        -- Create a new table with the correct structure
        CREATE TABLE public.orders_new (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "customerEmail" TEXT,
            "customerName" TEXT,
            "stripeSessionId" TEXT,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "ticketType" TEXT DEFAULT 'standard',
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Copy data from old table to new table
        EXECUTE 'INSERT INTO public.orders_new (id, "customerEmail", "customerName", "stripeSessionId", status, "ticketType", "createdAt", "updatedAt") ' ||
               'SELECT id::uuid, "customerEmail", "customerName", "stripeSessionId", status, "ticketType", "createdAt", "updatedAt" FROM public.orders';
        
        -- Drop the old table and rename the new one
        DROP TABLE public.orders CASCADE;
        ALTER TABLE public.orders_new RENAME TO orders;
        
        -- Recreate indexes and constraints
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        
        -- Recreate RLS policies
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
    
    -- Create or replace the update_orders_updated_at function
    CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
        NEW."updatedAt" = now();
        RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error in update_orders_updated_at: %', SQLERRM;
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
    
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
    
    -- Create the trigger
    CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_orders_updated_at();
    
    RAISE NOTICE 'Successfully set up orders table with triggers';
END $$;
