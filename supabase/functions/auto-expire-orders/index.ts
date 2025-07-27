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