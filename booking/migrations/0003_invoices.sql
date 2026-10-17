-- Demo invoices and Stripe test-mode payments.
-- invoice_token_hash: the private invoice link (hashed, like every other token).
-- paid_*: set only after the server has confirmed the payment with Stripe.
ALTER TABLE bookings ADD COLUMN invoice_token_hash TEXT;
ALTER TABLE bookings ADD COLUMN paid_at TEXT;
ALTER TABLE bookings ADD COLUMN paid_amount_pence INTEGER;
ALTER TABLE bookings ADD COLUMN payment_ref TEXT;
CREATE INDEX IF NOT EXISTS idx_bookings_invoice_token ON bookings(invoice_token_hash);
