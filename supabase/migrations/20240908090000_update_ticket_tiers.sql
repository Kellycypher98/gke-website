-- Add foreign key from ticket_tiers to events if it doesn't exist
DO $$
BEGIN
    -- First, check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ticket_tiers' 
        AND column_name = 'eventId'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE public.ticket_tiers
        ADD COLUMN "eventId" UUID;
        
        -- Add a comment to the column
        COMMENT ON COLUMN public.ticket_tiers."eventId" IS 'Reference to the event this ticket tier belongs to';
        
        -- Add a foreign key constraint
        ALTER TABLE public.ticket_tiers
        ADD CONSTRAINT fk_ticket_tiers_event
        FOREIGN KEY ("eventId")
        REFERENCES public.events(id)
        ON DELETE CASCADE;
        
        -- Create an index for better query performance
        CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event_id 
        ON public.ticket_tiers("eventId");
    END IF;
END $$;
