-- Fix database security warnings by setting search_path for functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.update_group_totals(uuid) SET search_path = 'public';
ALTER FUNCTION public.close_expired_orders() SET search_path = 'public';
ALTER FUNCTION public.trigger_update_group_totals() SET search_path = 'public';

-- Add a cron job to automatically close expired orders
-- Note: We'll use a simple approach with triggers for now
CREATE OR REPLACE FUNCTION public.auto_close_expired_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Close group orders that have passed their close_at time
  UPDATE public.group_orders 
  SET status = 'closed', updated_at = now()
  WHERE status = 'forming' 
  AND close_at < now();
END;
$$;

-- Add some sample data for testing
INSERT INTO public.suppliers (name, phone, delivery_zones) VALUES
('राम किराना स्टोर', '+919876543210', ARRAY['Zone A', 'Zone B']),
('श्याम होलसेल मार्केट', '+919876543211', ARRAY['Zone B', 'Zone C']),
('गोपाल सब्जी भंडार', '+919876543212', ARRAY['Zone A', 'Zone C'])
ON CONFLICT DO NOTHING;

-- Add sample items for suppliers
INSERT INTO public.items (name, price_per_kg, available_qty, supplier_id, image_url) 
SELECT 
  'आलू (Potato)', 25, 100, s.id, '/potato.jpg'
FROM public.suppliers s 
WHERE s.name = 'राम किराना स्टोर'
ON CONFLICT DO NOTHING;

INSERT INTO public.items (name, price_per_kg, available_qty, supplier_id, image_url) 
SELECT 
  'प्याज (Onion)', 30, 80, s.id, '/onion.jpg'
FROM public.suppliers s 
WHERE s.name = 'राम किराना स्टोर'
ON CONFLICT DO NOTHING;

INSERT INTO public.items (name, price_per_kg, available_qty, supplier_id, image_url) 
SELECT 
  'टमाटर (Tomato)', 40, 60, s.id, '/tomato.jpg'
FROM public.suppliers s 
WHERE s.name = 'श्याम होलसेल मार्केट'
ON CONFLICT DO NOTHING;

INSERT INTO public.items (name, price_per_kg, available_qty, supplier_id, image_url) 
SELECT 
  'खाना पकाने का तेल (Cooking Oil)', 120, 50, s.id, '/oil.jpg'
FROM public.suppliers s 
WHERE s.name = 'गोपाल सब्जी भंडार'
ON CONFLICT DO NOTHING;