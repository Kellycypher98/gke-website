-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    password TEXT,
    role TEXT NOT NULL DEFAULT 'USER',
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    "lastLoginAt" TIMESTAMPTZ,
    "lastActiveAt" TIMESTAMPTZ,
    "hasBoughtTicket" BOOLEAN NOT NULL DEFAULT false,
    "lastEventAttendedId" TEXT,
    "attendedLastEvent" BOOLEAN NOT NULL DEFAULT false,
    "hasRequestedRefund" BOOLEAN NOT NULL DEFAULT false,
    "refundRequestedAt" TIMESTAMPTZ,
    "hasBeenRefunded" BOOLEAN NOT NULL DEFAULT false,
    "refundedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "authExternalId" TEXT UNIQUE,
    "stripeCustomerId" TEXT UNIQUE
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    image TEXT,
    gallery TEXT[],
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[],
    date TIMESTAMPTZ NOT NULL,
    "time" TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    sold INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ticket_tiers table
CREATE TABLE IF NOT EXISTS public.ticket_tiers (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    "eventId" TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "saleStart" TIMESTAMPTZ,
    "saleEnd" TIMESTAMPTZ,
    description TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "eventId" TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(10,2) NOT NULL,
    "paymentIntentId" TEXT,
    "paymentStatus" TEXT,
    "paymentMethod" TEXT,
    "refundedAmount" DECIMAL(10,2) DEFAULT 0,
    "refundedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    "orderId" TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    "eventId" TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "ticketTierId" TEXT NOT NULL REFERENCES public.ticket_tiers(id) ON DELETE CASCADE,
    "ticketNumber" TEXT UNIQUE NOT NULL,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    email TEXT UNIQUE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders("userId");
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON public.orders("eventId");
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets("orderId");
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets("userId");
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets("eventId");
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event_id ON public.ticket_tiers("eventId");

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at column
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_tiers_updated_at
BEFORE UPDATE ON public.ticket_tiers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscriptions_updated_at
BEFORE UPDATE ON public.newsletter_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();