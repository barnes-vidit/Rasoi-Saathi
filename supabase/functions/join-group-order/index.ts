import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JoinOrderRequest {
  group_order_id: string;
  items: Array<{
    item_id: string;
    quantity: number;
  }>;
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

    const { group_order_id, items }: JoinOrderRequest = await req.json();

    // Get vendor ID for the authenticated user
    const { data: vendor, error: vendorError } = await supabaseClient
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (vendorError || !vendor) {
      throw new Error("Vendor profile not found");
    }

    // Check if group order exists and is still forming
    const { data: groupOrder, error: groupOrderError } = await supabaseClient
      .from("group_orders")
      .select("*")
      .eq("id", group_order_id)
      .eq("status", "forming")
      .single();

    if (groupOrderError || !groupOrder) {
      throw new Error("Group order not found or no longer accepting orders");
    }

    // Insert or update vendor orders
    for (const item of items) {
      const { error: upsertError } = await supabaseClient
        .from("vendor_orders")
        .upsert({
          group_order_id,
          vendor_id: vendor.id,
          item_id: item.item_id,
          quantity: item.quantity,
          paid: false
        }, {
          onConflict: "group_order_id,vendor_id,item_id"
        });

      if (upsertError) {
        console.error("Error upserting vendor order:", upsertError);
        throw new Error(`Failed to add item to order: ${upsertError.message}`);
      }
    }

    // Update group order item totals
    const { error: updateError } = await supabaseClient.rpc("update_group_totals", {
      group_order_id_param: group_order_id
    });

    if (updateError) {
      console.error("Error updating group totals:", updateError);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in join-group-order function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});