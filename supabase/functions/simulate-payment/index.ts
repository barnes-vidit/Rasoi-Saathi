import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  vendor_order_ids: string[];
  amount: number;
  payment_method: string;
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

    const { vendor_order_ids, amount, payment_method }: PaymentRequest = await req.json();

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock payment ID
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update vendor orders as paid
    const { error: updateError } = await supabaseClient
      .from("vendor_orders")
      .update({
        paid: true,
        payment_id: paymentId
      })
      .in("id", vendor_order_ids);

    if (updateError) {
      throw new Error(`Payment update failed: ${updateError.message}`);
    }

    // Check if all vendors in the group order have paid
    const { data: vendorOrders, error: checkError } = await supabaseClient
      .from("vendor_orders")
      .select("group_order_id, paid")
      .in("id", vendor_order_ids);

    if (checkError) {
      throw new Error(`Failed to verify payment status: ${checkError.message}`);
    }

    if (vendorOrders.length > 0) {
      const groupOrderId = vendorOrders[0].group_order_id;
      
      // Check if all orders in this group are paid
      const { data: allOrders, error: allOrdersError } = await supabaseClient
        .from("vendor_orders")
        .select("paid")
        .eq("group_order_id", groupOrderId);

      if (!allOrdersError && allOrders.every(order => order.paid)) {
        // All vendors have paid, close the group order
        const { error: closeError } = await supabaseClient
          .from("group_orders")
          .update({ status: "closed" })
          .eq("id", groupOrderId);

        if (closeError) {
          console.error("Failed to close group order:", closeError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      payment_id: paymentId,
      message: "Payment processed successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in simulate-payment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});