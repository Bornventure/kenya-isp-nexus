
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

    const { phone, amount, accountRef, clientId, invoiceId, ispCompanyId } = await req.json();

    console.log('Family Bank STK Push request:', { phone, amount, accountRef, clientId });

    // Generate unique transaction ID
    const transID = `FBL${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const timestamp = getTimestamp();
    const password = btoa(
      `${Deno.env.get("FBL_SHORTCODE")}${Deno.env.get("FBL_PASSKEY")}${timestamp}`
    );

    // Get access token
    const tokenRes = await fetch(Deno.env.get("FBL_TOKEN_URL")!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*"
      },
      body: JSON.stringify({
        client_id: Deno.env.get("FBL_CLIENT_ID"),
        client_secret: Deno.env.get("FBL_CLIENT_SECRET"),
        grant_type: "client_credentials",
        scope: "OB_BULK_PAY"
      })
    });

    if (!tokenRes.ok) {
      throw new Error(`Token request failed: ${tokenRes.statusText}`);
    }

    const { access_token } = await tokenRes.json();

    // Store STK request in database
    const { error: dbError } = await supabase
      .from('family_bank_stk_requests')
      .insert({
        phone_number: phone,
        amount: parseFloat(amount),
        account_reference: accountRef,
        transaction_desc: "Website Payment",
        third_party_trans_id: transID,
        client_id: clientId,
        invoice_id: invoiceId,
        isp_company_id: ispCompanyId,
        status: 'pending'
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Prepare STK Push payload
    const payload = {
      BusinessShortCode: Deno.env.get("FBL_SHORTCODE"),
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: Deno.env.get("FBL_SHORTCODE"),
      PhoneNumber: phone,
      CallBackURL: Deno.env.get("FBL_STK_CALLBACK_URL"),
      AccountReference: accountRef,
      TransactionDesc: "Website Payment",
      ThirdPartyTransID: transID
    };

    console.log('Sending STK Push to Family Bank...');

    const res = await fetch(Deno.env.get("FBL_STK_PUSH_URL")!, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Family Bank STK Push response:', data);

    // Update request with response data
    if (data.MerchantRequestID) {
      await supabase
        .from('family_bank_stk_requests')
        .update({
          merchant_request_id: data.MerchantRequestID,
          checkout_request_id: data.CheckoutRequestID,
          status_code: data.ResponseCode,
          response_description: data.ResponseDescription,
          customer_message: data.CustomerMessage
        })
        .eq('third_party_trans_id', transID);
    }

    return new Response(JSON.stringify({
      success: data.ResponseCode === '0',
      ...data,
      ThirdPartyTransID: transID
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Family Bank STK Push error:', error);
    return new Response(JSON.stringify({ 
      error: "STK Push failed", 
      detail: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function getTimestamp() {
  const now = new Date();
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
