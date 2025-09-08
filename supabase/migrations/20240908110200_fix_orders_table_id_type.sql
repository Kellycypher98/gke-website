-- First, check if we need to fix the orders table id type
DO $$
DECLARE
    id_type TEXT;
    constraint_rec RECORD;
    constraint_name TEXT;
    constraint_def TEXT;
    index_rec RECORD;
    index_name TEXT;
    index_def TEXT;
    new_constraints TEXT[] := '{}';
    new_indexes TEXT[] := '{}';
BEGIN
    -- Get the current data type of the id column
    SELECT data_type INTO id_type
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'id';
    
    RAISE NOTICE 'Current orders.id type: %', id_type;
    
    -- If the id is not already UUID, we need to convert it
    IF id_type != 'uuid' THEN
        RAISE NOTICE 'Converting orders.id from % to UUID', id_type;
        
        -- First, drop all foreign key constraints that reference the orders table
        FOR constraint_rec IN 
            SELECT 
                tc.constraint_name,
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE 
                tc.constraint_type = 'FOREIGN KEY'
                AND ccu.table_name = 'orders'
                AND ccu.column_name = 'id'
        LOOP
            RAISE NOTICE 'Dropping constraint % on table %.%', 
                constraint_rec.constraint_name, 
                constraint_rec.table_name, 
                constraint_rec.column_name;
                
            EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', 
                constraint_rec.table_name, 
                constraint_rec.constraint_name);
        END LOOP;
        
        -- Drop the primary key constraint
        EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_pkey';
        
        -- Add a new UUID column
        EXECUTE 'ALTER TABLE public.orders ADD COLUMN new_id UUID DEFAULT gen_random_uuid()';
        
        -- Copy data from old id to new_id, converting to UUID if possible
        BEGIN
            EXECUTE 'UPDATE public.orders SET new_id = id::uuid';
        EXCEPTION WHEN OTHERS THEN
            RAISE EXCEPTION 'Failed to convert id to UUID. Error: %', SQLERRM;
        END;
        
        -- Drop the old id column
        EXECUTE 'ALTER TABLE public.orders DROP COLUMN id';
        
        -- Rename new_id to id
        EXECUTE 'ALTER TABLE public.orders RENAME COLUMN new_id TO id';
        
        -- Make id the primary key
        EXECUTE 'ALTER TABLE public.orders ADD PRIMARY KEY (id)';
        
        -- Recreate any dropped indexes
        FOR index_rec IN 
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'orders' 
            AND indexname != 'orders_pkey'
        LOOP
            RAISE NOTICE 'Recreating index %', index_rec.indexname;
            EXECUTE index_rec.indexdef;
        END LOOP;
        
        RAISE NOTICE 'Successfully converted orders.id to UUID';
    ELSE
        RAISE NOTICE 'orders.id is already UUID, no conversion needed';
    END IF;
END $$;
