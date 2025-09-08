-- This migration fixes trigger issues and ensures proper column names

-- First, drop any existing triggers that might conflict
DO $$
BEGIN
    -- Drop all triggers on the orders table
    PERFORM pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = current_database()
    AND pid <> pg_backend_pid();
    
    -- Drop existing triggers
    DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
    DROP TRIGGER IF EXISTS update_updated_at_column ON public.orders;
    DROP TRIGGER IF EXISTS update_updated_at_column_trigger ON public.orders;
    DROP TRIGGER IF EXISTS set_updated_at ON public.orders;
    DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
    
    -- Drop existing functions
    DROP FUNCTION IF EXISTS public.update_orders_updated_at() CASCADE;
    DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
    
    -- Ensure the updatedAt column exists with the correct case
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
            -- If neither exists, add the column
            ALTER TABLE public.orders ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now();
        END IF;
    END IF;
    
    -- Create the update_orders_updated_at function with proper error handling
    CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
        NEW."updatedAt" = now();
        RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
        -- If there's an error, log it and continue
        RAISE NOTICE 'Error in update_orders_updated_at: %', SQLERRM;
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
    
    -- Create the trigger
    CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_orders_updated_at();
    
    RAISE NOTICE 'Successfully created orders update trigger';
END $$;

-- Do the same for the tickets table
DO $$
BEGIN
    -- Drop existing triggers
    DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
    DROP TRIGGER IF EXISTS update_updated_at_column ON public.tickets;
    
    -- Drop existing functions
    DROP FUNCTION IF EXISTS public.update_tickets_updated_at() CASCADE;
    
    -- Ensure the updatedAt column exists with the correct case
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tickets'
    ) THEN
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
                -- If neither exists, add the column
                ALTER TABLE public.tickets ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now();
            END IF;
        END IF;
        
        -- Create the update_tickets_updated_at function with proper error handling
        CREATE OR REPLACE FUNCTION public.update_tickets_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW."updatedAt" = now();
            RETURN NEW;
        EXCEPTION WHEN OTHERS THEN
            -- If there's an error, log it and continue
            RAISE NOTICE 'Error in update_tickets_updated_at: %', SQLERRM;
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
        
        -- Create the trigger
        CREATE TRIGGER update_tickets_updated_at
        BEFORE UPDATE ON public.tickets
        FOR EACH ROW
        EXECUTE FUNCTION public.update_tickets_updated_at();
        
        RAISE NOTICE 'Successfully created tickets update trigger';
    END IF;
END $$;
