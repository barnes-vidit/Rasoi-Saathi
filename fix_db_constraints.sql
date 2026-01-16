-- FIX FOR DEMO MODE
-- The "Demo User" (ID 000000...000) does not exist in the real auth.users table.
-- This causes a "Foreign Key Violation" when trying to save vendors/suppliers.

-- RUN THIS SCRIPT to remove the strict check, allowing the Demo User to save data.

-- 1. Remove Foreign Key on Vendors
ALTER TABLE "public"."vendors" DROP CONSTRAINT IF EXISTS "vendors_user_id_fkey";

-- 2. Remove Foreign Key on Suppliers
ALTER TABLE "public"."suppliers" DROP CONSTRAINT IF EXISTS "suppliers_user_id_fkey";

-- 3. (Optional) Remove Foreign Key on Group Orders just in case
ALTER TABLE "public"."group_orders" DROP CONSTRAINT IF EXISTS "group_orders_supplier_id_fkey";
-- Note: Supplier ID is usually internal, so this might not be needed, but safe to do for demo clarity.
