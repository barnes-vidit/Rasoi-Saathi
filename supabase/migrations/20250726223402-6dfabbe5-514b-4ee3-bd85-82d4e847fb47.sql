-- Create function to update group order totals
CREATE OR REPLACE FUNCTION public.update_group_totals(group_order_id_param UUID)
RETURNS void AS $$
BEGIN
  -- Update total quantities for each item in the group order
  UPDATE public.group_order_items 
  SET total_qty = (
    SELECT COALESCE(SUM(vo.quantity), 0)
    FROM public.vendor_orders vo
    WHERE vo.group_order_id = group_order_id_param
    AND vo.item_id = group_order_items.item_id
  )
  WHERE group_order_id = group_order_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically close expired group orders
CREATE OR REPLACE FUNCTION public.close_expired_orders()
RETURNS void AS $$
BEGIN
  UPDATE public.group_orders 
  SET status = 'closed'
  WHERE status = 'forming' 
  AND close_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to update group totals automatically
CREATE OR REPLACE FUNCTION public.trigger_update_group_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the update function for the affected group order
  PERFORM public.update_group_totals(
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.group_order_id
      ELSE NEW.group_order_id
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on vendor_orders to auto-update totals
CREATE TRIGGER trigger_vendor_orders_update_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_group_totals();

-- Add indexes for better performance
CREATE INDEX idx_vendor_orders_group_order_id ON public.vendor_orders(group_order_id);
CREATE INDEX idx_vendor_orders_vendor_id ON public.vendor_orders(vendor_id);
CREATE INDEX idx_vendor_orders_item_id ON public.vendor_orders(item_id);
CREATE INDEX idx_group_orders_zone_status ON public.group_orders(zone, status);
CREATE INDEX idx_group_orders_supplier_id ON public.group_orders(supplier_id);
CREATE INDEX idx_items_supplier_id ON public.items(supplier_id);
CREATE INDEX idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX idx_vendors_zone ON public.vendors(zone);