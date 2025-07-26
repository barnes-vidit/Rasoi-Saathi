import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  zone: string;
  item_ids: string[];
  duration_hours?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const { zone, item_ids, duration_hours = 2 }: CreateOrderRequest = await req.json();

    // Get supplier ID for the authenticated user
    const { data: supplier, error: supplierError } = await supabaseClient
      .from("suppliers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (supplierError || !supplier) {
      throw new Error("Supplier profile not found");
    }

    // Check if supplier delivers to this zone
    const { data: supplierDetails, error: zoneError } = await supabaseClient
      .from("suppliers")
      .select("delivery_zones")
      .eq("id", supplier.id)
      .single();

    if (zoneError || !supplierDetails?.delivery_zones?.includes(zone)) {
      throw new Error("Supplier does not deliver to this zone");
    }

    // Create the group order
    const closeAt = new Date();
    closeAt.setHours(closeAt.getHours() + duration_hours);

    const { data: groupOrder, error: orderError } = await supabaseClient
      .from("group_orders")
      .insert({
        zone,
        supplier_id: supplier.id,
        close_at: closeAt.toISOString(),
        status: "forming"
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create group order: ${orderError.message}`);
    }

    // Get item details and create group order items
    const { data: items, error: itemsError } = await supabaseClient
      .from("items")
      .select("*")
      .in("id", item_ids)
      .eq("supplier_id", supplier.id);

    if (itemsError) {
      throw new Error(`Failed to fetch items: ${itemsError.message}`);
    }

    const groupOrderItems = items.map(item => ({
      group_order_id: groupOrder.id,
      item_id: item.id,
      name: item.name,
      price_per_kg: item.price_per_kg,
      total_qty: 0
    }));

    const { error: itemsInsertError } = await supabaseClient
      .from("group_order_items")
      .insert(groupOrderItems);

    if (itemsInsertError) {
      throw new Error(`Failed to create group order items: ${itemsInsertError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      group_order_id: groupOrder.id,
      message: "Group order created successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-group-order function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});