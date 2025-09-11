-- Create a table to track email statuses
CREATE TABLE IF NOT EXISTS public.email_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Create an index for faster lookups by email_id
CREATE INDEX IF NOT EXISTS idx_email_status_email_id ON public.email_status(email_id);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_email_status_updated_at ON public.email_status;
CREATE TRIGGER update_email_status_updated_at
BEFORE UPDATE ON public.email_status
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
