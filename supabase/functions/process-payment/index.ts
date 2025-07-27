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