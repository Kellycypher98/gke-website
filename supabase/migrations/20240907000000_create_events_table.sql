-- Drop the existing tables if they exist (be careful with this in production)
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
DROP TRIGGER IF EXISTS update_ticket_tiers_updated_at ON public.ticket_tiers;
DROP TABLE IF EXISTS public.ticket_tiers;
DROP TABLE IF EXISTS public.events;
DROP FUNCTION IF EXISTS update_updated_at_column();
-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  image TEXT,
  gallery TEXT [],
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT [],
  date DATE NOT NULL,
  time TIME,
  location TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  capacity INTEGER,
  sold INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'CANCELLED')),
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT [],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Rest of the SQL remains the same...
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- Create policies for RLS
CREATE POLICY "Enable read access for all users" ON public.events FOR
SELECT TO anon,
  authenticated USING (status = 'PUBLISHED');
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_brand ON public.events(brand);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_events_updated_at BEFORE
UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Create ticket_tiers table
CREATE TABLE IF NOT EXISTS public.ticket_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  quantity INTEGER NOT NULL,
  sold INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable Row Level Security for ticket_tiers
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
-- Create policies for ticket_tiers RLS
CREATE POLICY "Enable read access for all users" ON public.ticket_tiers FOR
SELECT TO anon,
  authenticated USING (
    EXISTS (
      SELECT 1
      FROM public.events
      WHERE id = event_id
        AND status = 'PUBLISHED'
    )
  );
-- Create trigger to update updated_at timestamp for ticket_tiers
CREATE TRIGGER update_ticket_tiers_updated_at BEFORE
UPDATE ON public.ticket_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();