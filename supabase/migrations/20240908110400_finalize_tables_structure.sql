-- This migration ensures all tables have the correct structure and relationships
-- First, drop the tickets table if it exists
DROP TABLE IF EXISTS public.tickets CASCADE;
-- Ensure the orders table has the correct structure
DO $$
DECLARE constraint_rec RECORD;
-- Declare the record variable
BEGIN -- Check if the orders table exists and has the correct columns
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
        AND table_name = 'orders'
) THEN RAISE EXCEPTION 'The orders table does not exist. Please run previous migrations first.';
END IF;
-- Check if the id column is UUID
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'orders'
        AND column_name = 'id'
        AND data_type = 'uuid'
) THEN -- If id is not UUID, we need to convert it
RAISE NOTICE 'Converting orders.id to UUID type';
-- Drop foreign key constraints that reference orders.id
FOR constraint_rec IN
SELECT tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'orders'
    AND ccu.column_name = 'id' LOOP EXECUTE format(
        'ALTER TABLE %I DROP CONSTRAINT %I',
        constraint_rec.table_name,
        constraint_rec.constraint_name
    );
END LOOP;
-- Drop primary key if it exists
EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_pkey';
-- Add a new UUID column
EXECUTE 'ALTER TABLE public.orders ADD COLUMN new_id UUID DEFAULT gen_random_uuid()';
-- Copy data from old id to new_id, converting to UUID if possible
BEGIN EXECUTE 'UPDATE public.orders SET new_id = id::uuid';
EXCEPTION
WHEN OTHERS THEN -- If conversion fails, generate new UUIDs
RAISE NOTICE 'Could not convert ids to UUID, generating new ones';
EXECUTE 'UPDATE public.orders SET new_id = gen_random_uuid()';
END;
-- Drop the old id column
EXECUTE 'ALTER TABLE public.orders DROP COLUMN id';
-- Rename new_id to id
EXECUTE 'ALTER TABLE public.orders RENAME COLUMN new_id TO id';
-- Make id the primary key
EXECUTE 'ALTER TABLE public.orders ADD PRIMARY KEY (id)';
END IF;
-- Ensure all required columns exist in the orders table
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'orders'
        AND column_name = 'customerEmail'
) THEN EXECUTE 'ALTER TABLE public.orders ADD COLUMN "customerEmail" TEXT';
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'orders'
        AND column_name = 'customerName'
) THEN EXECUTE 'ALTER TABLE public.orders ADD COLUMN "customerName" TEXT';
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'orders'
        AND column_name = 'stripeSessionId'
) THEN EXECUTE 'ALTER TABLE public.orders ADD COLUMN "stripeSessionId" TEXT';
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'orders'
        AND column_name = 'status'
) THEN EXECUTE 'ALTER TABLE public.orders ADD COLUMN "status" TEXT NOT NULL DEFAULT ''pending''';
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'orders'
        AND column_name = 'ticketType'
) THEN EXECUTE 'ALTER TABLE public.orders ADD COLUMN "ticketType" TEXT DEFAULT ''standard''';
END IF;
END $$;
-- Now create the tickets table with the correct structure
CREATE TABLE IF NOT EXISTS public.tickets (
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
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets("orderId");
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets("eventId");
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets("userId");
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets("ticketNumber");
-- Enable RLS on tickets table
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
-- Add RLS policies for tickets table
CREATE POLICY "Allow public read access" ON public.tickets FOR
SELECT TO public USING (true);
CREATE POLICY "Allow all access to service role" ON public.tickets FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Add a trigger to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_tickets_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER update_tickets_updated_at BEFORE
UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION update_tickets_updated_at();
-- Ensure the orders table has the correct RLS policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert" ON public.orders;
-- Add RLS policies for orders table
CREATE POLICY "Allow public read access" ON public.orders FOR
SELECT TO public USING (true);
CREATE POLICY "Allow public insert" ON public.orders FOR
INSERT TO public WITH CHECK (true);
-- Add a trigger to update the updatedAt timestamp for orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;
-- Only create the trigger if it doesn't exist
DO $ BEGIN -- Drop any existing conflicting triggers first
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_updated_at_column ON public.orders;
DROP TRIGGER IF EXISTS set_updated_at ON public.orders;
-- Create the new trigger
CREATE TRIGGER update_orders_updated_at BEFORE
UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();
END $;