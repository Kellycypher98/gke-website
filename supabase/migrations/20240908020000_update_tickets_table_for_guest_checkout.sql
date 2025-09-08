-- Add user_email column to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS user_email TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- Add index for user_email
CREATE INDEX IF NOT EXISTS idx_tickets_user_email ON public.tickets("userEmail");
