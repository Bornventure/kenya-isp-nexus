
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log("Family Bank STK Callback RECEIVED:", JSON.stringify(body, null, 2));

    // Store the callback for processing via trigger
    const { error } = await supabase
      .from('family_bank_stk_callbacks')
      .insert({
        callback_raw: body,
        processed: false
      });

    if (error) {
      console.error('Error storing Family Bank STK callback:', error);
    }

    // If successful payment, process it
    if (body.ResponseCode === '0') {
      const { data: stkRequest } = await supabase
        .from('family_bank_stk_requests')
        .select('client_id, amount, invoice_id')
        .eq('third_party_trans_id', body.ThirdPartyTransID)
        .single();

      if (stkRequest) {
        // Call payment processor
        await supabase.functions.invoke('process-payment', {
          body: {
            checkoutRequestId: body.CheckoutRequestID,
            clientId: stkRequest.client_id,
            amount: stkRequest.amount,
            paymentMethod: 'family_bank',
            familyBankReceiptNumber: body.TransID
          }
        });
      }
    }

    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: "Callback received successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Family Bank STK callback error:', error);
    
    return new Response(
      JSON.stringify({
        ResultCode: 1,
        ResultDesc: "Callback processing failed"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
