-- Add scanned_at column to track when a ticket is first scanned
ALTER TABLE tickets ADD COLUMN scanned_at TIMESTAMP WITH TIME ZONE;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tickets_scanned_at ON tickets(scanned_at);
