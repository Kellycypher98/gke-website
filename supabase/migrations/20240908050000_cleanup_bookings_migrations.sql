-- This migration cleans up old migrations related to the bookings table which has been removed

-- The following files were removed or made obsolete by the consolidation of the bookings table into orders:
-- - 20240907210000_create_bookings_table.sql
-- - 20240907211500_add_payment_link_id_to_bookings.sql

-- Note: The actual tables and functions were already dropped when the bookings table was removed.
-- This migration is just for documentation purposes to explain why those migrations are no longer needed.

-- The functionality from the bookings table has been consolidated into the orders table
-- with the following schema changes:
-- - Added columns to orders: customerEmail, customerName, stripeSessionId, status, ticketType
-- - Updated webhook handlers to use the orders table instead of bookings
-- - Updated all application code to work with the consolidated schema

-- No actual SQL to run here as the cleanup was already done manually
