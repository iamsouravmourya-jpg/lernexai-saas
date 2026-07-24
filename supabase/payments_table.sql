-- Razorpay payment records. Run this in the Supabase SQL editor.
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  purpose TEXT NOT NULL DEFAULT 'pro_subscription',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id
  ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status
  ON public.payments(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_razorpay_order_id
  ON public.payments(razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Edge Functions use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- Do not add public INSERT or UPDATE policies for payment records.

-- plan_type is stored in auth.users.raw_user_meta_data and updated through
-- the Supabase Admin Auth API by verify-razorpay-payment.
