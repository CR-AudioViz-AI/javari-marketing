-- Credit Transactions Table (Universal across all Javari apps)
-- Run this in your Supabase SQL Editor

-- Create credit_transactions table if not exists
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deduction', 'addition', 'refund', 'purchase', 'bonus')),
  amount INTEGER NOT NULL,
  action TEXT NOT NULL,
  balance_before INTEGER NOT NULL DEFAULT 0,
  balance_after INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_action ON public.credit_transactions(action);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transactions
CREATE POLICY "Users view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update
CREATE POLICY "Service role manages transactions" ON public.credit_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- Add credits_balance column to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'credits_balance'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN credits_balance INTEGER DEFAULT 100;
  END IF;
END $$;

-- Create function to get user credit summary
CREATE OR REPLACE FUNCTION get_credit_summary(p_user_id UUID)
RETURNS TABLE (
  current_balance INTEGER,
  total_earned INTEGER,
  total_spent INTEGER,
  total_refunded INTEGER,
  transaction_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((SELECT credits_balance FROM profiles WHERE id = p_user_id), 0) as current_balance,
    COALESCE(SUM(CASE WHEN amount > 0 AND type != 'refund' THEN amount ELSE 0 END)::INTEGER, 0) as total_earned,
    COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END)::INTEGER, 0) as total_spent,
    COALESCE(SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END)::INTEGER, 0) as total_refunded,
    COUNT(*)::INTEGER as transaction_count
  FROM credit_transactions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION get_credit_summary TO authenticated;

COMMENT ON TABLE public.credit_transactions IS 'Universal credit transaction history across all Javari apps';
