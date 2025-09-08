-- Check the data type of the id column in the orders table
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_name = 'orders' 
    AND column_name = 'id';

-- Check the constraints on the orders table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.table_name = 'orders';

-- Check if the orders table has any rows with non-UUID ids
-- This is just for diagnostic purposes, don't run in production without caution
-- SELECT id FROM public.orders WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- If needed, we can add a function to convert text IDs to UUIDs
-- This is just an example, don't run it yet
/*
DO $$
BEGIN
    -- First, create a new UUID column
    ALTER TABLE public.orders ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
    
    -- Copy the data from the old id to the new UUID column
    -- This assumes the text IDs are valid UUIDs
    UPDATE public.orders SET new_id = id::UUID;
    
    -- Drop the old column
    ALTER TABLE public.orders DROP COLUMN id;
    
    -- Rename the new column to id
    ALTER TABLE public.orders RENAME COLUMN new_id TO id;
    
    -- Make it the primary key
    ALTER TABLE public.orders ADD PRIMARY KEY (id);
    
    -- Recreate any dropped indexes or constraints here
END $$;
*/
