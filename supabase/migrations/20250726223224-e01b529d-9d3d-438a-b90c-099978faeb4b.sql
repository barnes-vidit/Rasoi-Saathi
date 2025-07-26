-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  zone TEXT NOT NULL,
  language TEXT DEFAULT 'hi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  delivery_zones TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  available_qty DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create group_orders table
CREATE TABLE public.group_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'forming',
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  close_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '2 hours'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('forming', 'closed', 'dispatched', 'delivered'))
);

-- Create group_order_items table
CREATE TABLE public.group_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_order_id UUID REFERENCES public.group_orders(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  total_qty DECIMAL(10,2) DEFAULT 0,
  price_per_kg DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_order_id, item_id)
);

-- Create vendor_orders table
CREATE TABLE public.vendor_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_order_id UUID REFERENCES public.group_orders(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_order_id, vendor_id, item_id)
);

-- Create delivery_proofs table
CREATE TABLE public.delivery_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_order_id UUID REFERENCES public.group_orders(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_proof_type CHECK (type IN ('image', 'audio'))
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('delivery-proofs', 'delivery-proofs', true);

-- Enable Row Level Security on all tables
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_proofs ENABLE ROW LEVEL SECURITY;

-- Vendors policies
CREATE POLICY "Vendors can view their own profile" ON public.vendors
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Vendors can update their own profile" ON public.vendors
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Vendors can insert their own profile" ON public.vendors
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Suppliers policies
CREATE POLICY "Suppliers can view their own profile" ON public.suppliers
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Suppliers can update their own profile" ON public.suppliers
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Suppliers can insert their own profile" ON public.suppliers
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Items policies
CREATE POLICY "Items are viewable by everyone" ON public.items
FOR SELECT USING (true);

CREATE POLICY "Suppliers can manage their own items" ON public.items
FOR ALL USING (supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid()));

-- Group orders policies
CREATE POLICY "Group orders are viewable by vendors in same zone" ON public.group_orders
FOR SELECT USING (
  zone IN (SELECT zone FROM public.vendors WHERE user_id = auth.uid())
  OR supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid())
);

CREATE POLICY "Suppliers can update their group orders" ON public.group_orders
FOR UPDATE USING (supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid()));

CREATE POLICY "Suppliers can create group orders" ON public.group_orders
FOR INSERT WITH CHECK (supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid()));

-- Group order items policies
CREATE POLICY "Group order items are viewable by related users" ON public.group_order_items
FOR SELECT USING (
  group_order_id IN (
    SELECT id FROM public.group_orders 
    WHERE zone IN (SELECT zone FROM public.vendors WHERE user_id = auth.uid())
    OR supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Group order items can be managed by suppliers" ON public.group_order_items
FOR ALL USING (
  group_order_id IN (
    SELECT id FROM public.group_orders 
    WHERE supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid())
  )
);

-- Vendor orders policies
CREATE POLICY "Vendors can view their own orders" ON public.vendor_orders
FOR SELECT USING (
  vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
  OR group_order_id IN (
    SELECT id FROM public.group_orders 
    WHERE supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Vendors can manage their own orders" ON public.vendor_orders
FOR ALL USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

-- Delivery proofs policies
CREATE POLICY "Delivery proofs are viewable by related users" ON public.delivery_proofs
FOR SELECT USING (
  group_order_id IN (
    SELECT go.id FROM public.group_orders go
    JOIN public.vendor_orders vo ON vo.group_order_id = go.id
    JOIN public.vendors v ON v.id = vo.vendor_id
    WHERE v.user_id = auth.uid()
  )
  OR supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid())
);

CREATE POLICY "Suppliers can manage delivery proofs" ON public.delivery_proofs
FOR ALL USING (supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid()));

-- Storage policies for delivery proofs
CREATE POLICY "Delivery proof uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'delivery-proofs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Delivery proof access" ON storage.objects
FOR SELECT USING (bucket_id = 'delivery-proofs');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_orders_updated_at BEFORE UPDATE ON public.group_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_order_items_updated_at BEFORE UPDATE ON public.group_order_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_orders_updated_at BEFORE UPDATE ON public.vendor_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER TABLE public.group_orders REPLICA IDENTITY FULL;
ALTER TABLE public.group_order_items REPLICA IDENTITY FULL;
ALTER TABLE public.vendor_orders REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_orders;