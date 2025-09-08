-- Make userId column nullable in the orders table to support guest checkouts
-- This allows orders to be created without requiring a user to be logged in

-- First, drop any dependent objects that might prevent the column modification
-- (This is a safety measure in case there are any constraints or indexes)
DO $$
BEGIN
    -- Drop any dependent constraints
    EXECUTE (
        SELECT 'ALTER TABLE public.orders DROP CONSTRAINT ' || conname || ';'
        FROM pg_constraint
        WHERE conrelid = 'public.orders'::regclass
        AND conname LIKE '%userid%'  -- This is a simple match, adjust if needed
    );
    
    -- Drop any dependent indexes
    EXECUTE (
        SELECT 'DROP INDEX IF EXISTS ' || indexname || ';'
        FROM pg_indexes
        WHERE tablename = 'orders' 
        AND indexname LIKE '%userid%'  -- This is a simple match, adjust if needed
    );
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if the constraint or index doesn't exist
    RAISE NOTICE 'Error dropping constraints or indexes: %', SQLERRM;
END $$;

-- Now alter the column to be nullable
ALTER TABLE public.orders 
ALTER COLUMN "userId" DROP NOT NULL;
