-- Update the webhook handlers to use the orders table instead of bookings
-- This is a reference migration - the actual code changes need to be made in the application code

-- The following SQL is for reference only - the actual changes need to be made in the application code
-- Update the webhook handlers in the following files:
-- 1. src/app/api/webhooks/stripe/route.ts
-- 2. src/app/api/webhooks/test/route.ts

-- The changes should update all references to the 'bookings' table to use 'orders' instead
-- and update the column names to match the orders table schema:
-- - payment_status -> paymentStatus
-- - stripe_session_id -> stripeSessionId
-- - status -> status (same name, but might need type conversion)
-- - created_at -> createdAt
-- - updated_at -> updatedAt
