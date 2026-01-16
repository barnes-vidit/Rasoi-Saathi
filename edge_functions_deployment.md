# Edge Functions Deployment Guide

Since you prefer using the **Supabase Dashboard Editor**, follow these steps for each function below.

## Instructions
1.  Go to **Edge Functions** in your Supabase Dashboard.
2.  Click **Create new edge function**.
3.  Enter the **Function Name** (e.g., `process-payment`).
4.  **Copy the code** provided below for that function.
5.  **Paste** it into the editor (replace the default `index.ts` content).
6.  Click **Deploy function**.
7.  Repeat for all functions.

---

## 1. Function Name: `process-payment`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  vendor_id: string;
  group_order_id: string;
  items: Array<{
    item_id: string;
    quantity: number;
  }>;
  total_amount: number;
  payment_method: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendor_id, group_order_id, items, total_amount, payment_method }: PaymentRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Simulate payment processing
    console.log(`Processing payment for vendor ${vendor_id}, amount: ₹${total_amount}`);
    
    // Mock payment gateway call (in real implementation, this would call Razorpay/UPI)
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (paymentSuccess) {
      // Create vendor orders
      const vendorOrders = items.map(item => ({
        vendor_id,
        group_order_id,
        item_id: item.item_id,
        quantity: item.quantity,
        paid: true,
        payment_id: paymentId
      }));

      const { error: orderError } = await supabase
        .from('vendor_orders')
        .insert(vendorOrders);

      if (orderError) {
        throw new Error(`Failed to create vendor orders: ${orderError.message}`);
      }

      // Update group order totals
      const { error: updateError } = await supabase
        .rpc('update_group_totals', { group_order_id_param: group_order_id });

      if (updateError) {
        console.error('Failed to update group totals:', updateError);
      }

      console.log(`Payment successful: ${paymentId}`);

      return new Response(
        JSON.stringify({
          success: true,
          payment_id: paymentId,
          message: 'Payment processed successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      console.log('Payment failed - simulated failure');
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment failed',
          message: 'Payment could not be processed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

---

## 2. Function Name: `auto-expire-orders`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Running auto-expire orders job...');

    // Get all group orders that should be closed
    const { data: expiredOrders, error: fetchError } = await supabase
      .from('group_orders')
      .select('id, zone, supplier_id, close_at')
      .eq('status', 'forming')
      .lt('close_at', new Date().toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch expired orders: ${fetchError.message}`);
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      console.log('No expired orders found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired orders found',
          processed: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`Found ${expiredOrders.length} expired orders to close`);

    // Close expired orders
    const orderIds = expiredOrders.map(order => order.id);
    
    const { error: updateError } = await supabase
      .from('group_orders')
      .update({ 
        status: 'closed',
        updated_at: new Date().toISOString()
      })
      .in('id', orderIds);

    if (updateError) {
      throw new Error(`Failed to close expired orders: ${updateError.message}`);
    }

    // Log the closed orders
    for (const order of expiredOrders) {
      console.log(`Closed expired order: ${order.id} in zone ${order.zone}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully closed ${expiredOrders.length} expired orders`,
        processed: expiredOrders.length,
        closed_orders: orderIds
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Auto-expire orders error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to process expired orders'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

---

## 3. Function Name: `create-group-order`

```typescript
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
```

---

## 4. Function Name: `update-order-status`

```typescript
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
```

---

## 5. Function Name: `join-group-order`

```typescript
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
```
