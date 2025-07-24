
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

    console.log('Family Bank STK Push request:', { phone, amount, accountRef, clientId, invoiceId, ispCompanyId });

    // Input validation
    if (!phone || !amount || !accountRef || !clientId) {
      throw new Error('Missing required fields: phone, amount, accountRef, and clientId are required');
    }

    // Get client details to determine ISP company ID if not provided
    let finalIspCompanyId = ispCompanyId;
    if (!finalIspCompanyId && clientId) {
      console.log('Getting client details for ISP company ID');
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('isp_company_id')
        .eq('id', clientId)
        .single();

      if (clientError) {
        console.error('Error getting client details:', clientError);
        throw new Error(`Failed to get client details: ${clientError.message}`);
      }

      if (clientData) {
        finalIspCompanyId = clientData.isp_company_id;
        console.log('Found ISP company ID from client:', finalIspCompanyId);
      }
    }

    if (!finalIspCompanyId) {
      throw new Error('Could not determine ISP company ID');
    }

    // Generate unique transaction ID
    const transID = `FBL${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const timestamp = getTimestamp();
    const businessShortCode = "1740083";
    const bankClientId = "LAKELINK"; // Family Bank client ID
    const password = btoa(`${businessShortCode}${bankClientId}${timestamp}`);

    console.log('Getting Family Bank access token...');

    // Get access token with timeout and better error handling
    let tokenRes;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      tokenRes = await fetch("https://sandbox.familybank.co.ke/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          'client_id': 'LAKELINK',
          'client_secret': 'secret',
          'grant_type': 'client_credentials',
          'scope': 'ESB_REST_API'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (fetchError) {
      console.error('Token request fetch error:', fetchError);
      throw new Error(`Family Bank API is currently unavailable. Please try again later. Error: ${fetchError.message}`);
    }

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('Token request failed:', {
        status: tokenRes.status,
        statusText: tokenRes.statusText,
        response: errorText
      });
      
      if (tokenRes.status === 522) {
        throw new Error('Family Bank API is currently experiencing connectivity issues. Please try again in a few minutes.');
      }
      
      throw new Error(`Family Bank authentication failed (${tokenRes.status}). Please contact support if this persists.`);
    }

    const tokenData = await tokenRes.json();
    console.log('Token response received');

    if (!tokenData.access_token) {
      throw new Error('No access token received from Family Bank');
    }

    // Store STK request in database FIRST before making the API call
    console.log('Storing STK request in database with data:', {
      phone_number: phone,
      amount: parseFloat(amount),
      account_reference: accountRef,
      transaction_desc: "Website Payment",
      third_party_trans_id: transID,
      client_id: clientId,
      invoice_id: invoiceId || null,
      isp_company_id: finalIspCompanyId,
      status: 'pending'
    });

    const { data: stkRequestData, error: dbError } = await supabase
      .from('family_bank_stk_requests')
      .insert({
        phone_number: phone,
        amount: parseFloat(amount),
        account_reference: accountRef,
        transaction_desc: "Website Payment",
        third_party_trans_id: transID,
        client_id: clientId,
        invoice_id: invoiceId || null,
        isp_company_id: finalIspCompanyId,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error storing STK request:', dbError);
      throw new Error(`Failed to store STK request: ${dbError.message}`);
    }

    console.log('STK request stored successfully in database:', stkRequestData);

    // Prepare STK Push payload
    const payload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: businessShortCode,
      PhoneNumber: phone,
      CallBackURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/family-bank-stk-callback`,
      AccountReference: accountRef,
      TransactionDesc: "Website Payment",
      ThirdPartyTransID: transID
    };

    console.log('Sending STK Push to Family Bank...', payload);

    // Send STK Push with timeout
    let stkRes;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      stkRes = await fetch("https://sandbox.familybank.co.ke/api/v1/Mpesa/stkpush", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (fetchError) {
      console.error('STK Push fetch error:', fetchError);
      
      // Update the database record to failed status
      await supabase
        .from('family_bank_stk_requests')
        .update({
          status: 'failed',
          response_description: `API unavailable: ${fetchError.message}`
        })
        .eq('third_party_trans_id', transID);
        
      throw new Error(`Family Bank payment service is currently unavailable. Please try again later. Error: ${fetchError.message}`);
    }

    if (!stkRes.ok) {
      const errorText = await stkRes.text();
      console.error('STK Push request failed:', {
        status: stkRes.status,
        statusText: stkRes.statusText,
        response: errorText
      });

      // Update the database record to failed status
      await supabase
        .from('family_bank_stk_requests')
        .update({
          status: 'failed',
          response_description: `STK Push failed: ${stkRes.status} - ${errorText}`
        })
        .eq('third_party_trans_id', transID);
      
      if (stkRes.status === 522) {
        throw new Error('Family Bank payment service is currently experiencing connectivity issues. Please try again in a few minutes.');
      }
      
      throw new Error(`STK Push request failed (${stkRes.status}). Please contact support if this persists.`);
    }

    const stkData = await stkRes.json();
    console.log('Family Bank STK Push response:', stkData);

    if (stkData.ResponseCode !== '0') {
      console.error('STK Push failed:', stkData);
      
      // Update the database record to failed status
      await supabase
        .from('family_bank_stk_requests')
        .update({
          status: 'failed',
          response_description: stkData.ResponseDescription || 'STK Push failed'
        })
        .eq('third_party_trans_id', transID);
        
      throw new Error(`STK Push failed: ${stkData.ResponseDescription}`);
    }

    // Update request with response data
    if (stkData.MerchantRequestID) {
      const { error: updateError } = await supabase
        .from('family_bank_stk_requests')
        .update({
          merchant_request_id: stkData.MerchantRequestID,
          checkout_request_id: stkData.CheckoutRequestID,
          status_code: stkData.ResponseCode,
          response_description: stkData.ResponseDescription,
          customer_message: stkData.CustomerMessage
        })
        .eq('third_party_trans_id', transID);

      if (updateError) {
        console.error('Failed to update STK request with response data:', updateError);
      } else {
        console.log('STK request updated with response data');
      }
    }

    console.log('STK Push completed successfully, returning response');

    return new Response(JSON.stringify({
      success: true,
      ...stkData,
      ThirdPartyTransID: transID
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Family Bank STK Push error:', error);
    return new Response(JSON.stringify({ 
      success: false,
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
