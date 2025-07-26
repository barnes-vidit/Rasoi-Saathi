import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  group_order_id: string;
  status: "forming" | "closed" | "dispatched" | "delivered";
  proof_file_url?: string;
  proof_type?: "image" | "audio";
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

    const { group_order_id, status, proof_file_url, proof_type }: StatusUpdateRequest = await req.json();

    // Get supplier ID for the authenticated user
    const { data: supplier, error: supplierError } = await supabaseClient
      .from("suppliers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (supplierError || !supplier) {
      throw new Error("Supplier profile not found");
    }

    // Verify the supplier owns this group order
    const { data: groupOrder, error: groupOrderError } = await supabaseClient
      .from("group_orders")
      .select("*")
      .eq("id", group_order_id)
      .eq("supplier_id", supplier.id)
      .single();

    if (groupOrderError || !groupOrder) {
      throw new Error("Group order not found or access denied");
    }

    // Update group order status
    const { error: updateError } = await supabaseClient
      .from("group_orders")
      .update({ status })
      .eq("id", group_order_id);

    if (updateError) {
      throw new Error(`Failed to update order status: ${updateError.message}`);
    }

    // If dispatched status and proof provided, save delivery proof
    if (status === "dispatched" && proof_file_url && proof_type) {
      const { error: proofError } = await supabaseClient
        .from("delivery_proofs")
        .insert({
          group_order_id,
          supplier_id: supplier.id,
          file_url: proof_file_url,
          type: proof_type
        });

      if (proofError) {
        console.error("Failed to save delivery proof:", proofError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Order status updated to ${status}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in update-order-status function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});