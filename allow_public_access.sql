-- DANGER: This disables security for specific tables to allow "Demo Mode" with mock users
-- Run this in your Supabase SQL Editor

-- 1. Vendors
DROP POLICY IF EXISTS "Enable all access for demo" ON "public"."vendors";
CREATE POLICY "Enable all access for demo" ON "public"."vendors"
FOR ALL USING (true) WITH CHECK (true);

-- 2. Suppliers
DROP POLICY IF EXISTS "Enable all access for demo" ON "public"."suppliers";
CREATE POLICY "Enable all access for demo" ON "public"."suppliers"
FOR ALL USING (true) WITH CHECK (true);

-- 3. Group Orders
DROP POLICY IF EXISTS "Enable all access for demo" ON "public"."group_orders";
CREATE POLICY "Enable all access for demo" ON "public"."group_orders"
FOR ALL USING (true) WITH CHECK (true);

-- 4. Group Order Items
DROP POLICY IF EXISTS "Enable all access for demo" ON "public"."group_order_items";
CREATE POLICY "Enable all access for demo" ON "public"."group_order_items"
FOR ALL USING (true) WITH CHECK (true);

-- 5. Vendor Orders
DROP POLICY IF EXISTS "Enable all access for demo" ON "public"."vendor_orders";
CREATE POLICY "Enable all access for demo" ON "public"."vendor_orders"
FOR ALL USING (true) WITH CHECK (true);

-- 6. Items
DROP POLICY IF EXISTS "Enable all access for demo" ON "public"."items";
CREATE POLICY "Enable all access for demo" ON "public"."items"
FOR ALL USING (true) WITH CHECK (true);
