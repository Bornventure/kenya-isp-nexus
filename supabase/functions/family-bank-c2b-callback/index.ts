
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
    console.log("Family Bank C2B IPN RECEIVED:", JSON.stringify(body, null, 2));

    // Store the C2B payment in database
    const { error } = await supabase
      .from('family_bank_payments')
      .insert({
        trans_id: body.TransID,
        trans_time: body.TransTime,
        transaction_type: body.TransactionType,
        trans_amount: parseFloat(body.TransAmount),
        business_shortcode: body.BusinessShortCode,
        bill_ref_number: body.BillRefNumber,
        invoice_number: body.InvoiceNumber,
        org_account_balance: body.OrgAccountBalance ? parseFloat(body.OrgAccountBalance) : null,
        third_party_trans_id: body.ThirdPartyTransID,
        msisdn: body.MSISDN,
        kyc_info: body.KYCInfo,
        first_name: body.FirstName,
        middle_name: body.MiddleName,
        last_name: body.LastName,
        callback_raw: body,
        status: 'received'
      });

    if (error) {
      console.error('Error storing Family Bank payment:', error);
    }

    // Process the payment (similar to M-Pesa processing)
    if (body.BillRefNumber) {
      // Try to find matching client/invoice by reference
      const { data: client } = await supabase
        .from('clients')
        .select('id, isp_company_id')
        .eq('phone', body.MSISDN)
        .single();

      if (client) {
        // Call payment processor
        await supabase.functions.invoke('process-payment', {
          body: {
            checkoutRequestId: body.TransID,
            clientId: client.id,
            amount: parseFloat(body.TransAmount),
            paymentMethod: 'family_bank',
            familyBankReceiptNumber: body.TransID
          }
        });
      }
    }

    return new Response(
      JSON.stringify({
        status_code: "PAYMENT_ACK",
        status_description: "Payment Transaction Received Successfully",
        payment_ref: `PAYREF-${Date.now()}`,
        date_time: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Family Bank C2B callback error:', error);
    
    return new Response(
      JSON.stringify({
        status_code: "PAYMENT_ERROR",
        status_description: "Payment processing failed",
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
