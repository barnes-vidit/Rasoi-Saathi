-- Enable phone authentication by creating a trigger for auto-expiry
CREATE OR REPLACE FUNCTION public.auto_close_expired_group_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Close group orders that have passed their close_at time
  UPDATE public.group_orders 
  SET status = 'closed', updated_at = now()
  WHERE status = 'forming' 
  AND close_at < now();
END;
$$;

-- Create a scheduled trigger using pg_cron (if available) or manual trigger
-- Note: In production, you would use pg_cron or call this function via Edge Functions
-- For now, we'll create a manual trigger that can be called