-- First, drop any existing triggers that might conflict
DO $$
BEGIN
    -- Drop triggers on orders table
    DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
    DROP TRIGGER IF EXISTS update_updated_at_column ON public.orders;
    DROP TRIGGER IF EXISTS update_updated_at_column_trigger ON public.orders;
    DROP TRIGGER IF EXISTS set_updated_at ON public.orders;
    DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
    
    -- Drop triggers on tickets table
    DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
    DROP TRIGGER IF EXISTS update_tickets_updated_at_trigger ON public.tickets;
END $$;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.update_orders_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_tickets_updated_at() CASCADE;

-- Create the update_orders_updated_at function
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the update_tickets_updated_at function
CREATE OR REPLACE FUNCTION public.update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for orders table
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_orders_updated_at();

-- Create the trigger for tickets table
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_tickets_updated_at();
