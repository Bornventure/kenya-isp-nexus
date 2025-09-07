
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate timestamp in the required format (YYYYMMDDHHMMSS)
function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
}

// Generate password using Base64 encoding of BusinessShortCode + ClientID + Timestamp
function generatePassword(businessShortCode: string, clientId: string, timestamp: string): string {
  const rawString = `${businessShortCode}${clientId}${timestamp}`;
  return btoa(rawString);
}

// Get OAuth2 access token from Family Bank
async function getAccessToken(): Promise<string> {
  const tokenUrl = Deno.env.get('FAMILY_BANK_TOKEN_URL')!;
  const clientId = Deno.env.get('FAMILY_BANK_CLIENT_ID')!;
  const clientSecret = Deno.env.get('FAMILY_BANK_CLIENT_SECRET')!;
  const scope = Deno.env.get('FAMILY_BANK_SCOPE')!;

  console.log('Requesting OAuth2 token from:', tokenUrl);

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: new URLSearchParams({
      'grant_type': 'client_credentials',
      'scope': scope
    })
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token request failed:', tokenResponse.status, errorText);
    throw new Error(`Failed to get access token: ${tokenResponse.status} - ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  console.log('Token response received successfully');
  
  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { client_id, invoice_id, amount, phone_number, account_reference } = await req.json()

    console.log('=== Family Bank STK Push Request ===');
    console.log('Request data:', { client_id, invoice_id, amount, phone_number, account_reference });

    // Get client details for isp_company_id - handle test scenario
    let clientData = null;
    let isp_company_id = null;
    
    if (client_id === 'test-client-id') {
      // For testing purposes, use a default company ID
      console.log('Using test mode for Family Bank STK push');
      // Get the first available company for testing
      const { data: testCompany } = await supabase
        .from('isp_companies')
        .select('id')
        .limit(1)
        .single();
      
      isp_company_id = testCompany?.id;
      clientData = { isp_company_id };
    } else {
      const { data: fetchedClientData, error: clientError } = await supabase
        .from('clients')
        .select('isp_company_id')
        .eq('id', client_id)
        .single()

      if (clientError || !fetchedClientData) {
        console.error('Error fetching client:', clientError)
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Client not found',
          details: clientError 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      clientData = fetchedClientData;
      isp_company_id = fetchedClientData.isp_company_id;
    }

    // Generate unique transaction ID
    const thirdPartyTransId = `FB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('Generated transaction ID:', thirdPartyTransId);

    // Format phone number
    let formattedPhone = phone_number.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone
    }

    console.log('Formatted phone number:', formattedPhone);

    // Generate timestamp and password
    const timestamp = getTimestamp();
    const merchantCode = Deno.env.get('FAMILY_BANK_MERCHANT_CODE')!;
    const clientId = Deno.env.get('FAMILY_BANK_CLIENT_ID')!;
    const password = generatePassword(merchantCode, clientId, timestamp);

    console.log('Generated authentication params:', {
      timestamp,
      merchantCode,
      clientId: clientId.substring(0, 5) + '...' // Partial logging for security
    });

    // Create STK request record BEFORE making the API call
    console.log('Creating STK request record...');

    const { data: stkRequest, error: stkError } = await supabase
      .from('family_bank_stk_requests')
      .insert({
        client_id: client_id === 'test-client-id' ? null : client_id,
        invoice_id,
        amount,
        phone_number: formattedPhone,
        account_reference,
        third_party_trans_id: thirdPartyTransId,
        transaction_desc: `Payment for ${account_reference}`,
        status: 'pending',
        isp_company_id: isp_company_id
      })
      .select()
      .single()

    if (stkError) {
      console.error('Error creating STK request:', stkError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to create STK request',
        details: stkError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('STK request record created successfully:', stkRequest.id);

    // Get OAuth2 access token
    let accessToken: string;
    try {
      accessToken = await getAccessToken();
      console.log('OAuth2 token obtained successfully');
    } catch (tokenError) {
      console.error('Failed to get access token:', tokenError);
      
      // Update STK request status to failed
      await supabase
        .from('family_bank_stk_requests')
        .update({ 
          status: 'failed',
          response_description: 'Failed to obtain access token',
          customer_message: 'Authentication failed. Please try again.'
        })
        .eq('id', stkRequest.id);

      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication failed',
        error: 'Unable to authenticate with Family Bank'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Prepare callback URL - ensure it's properly formatted
    const callbackUrl = `${supabaseUrl}/functions/v1/family-bank-stk-callback`;
    console.log('Using callback URL:', callbackUrl);

    // Family Bank STK Push payload
    const stkPayload = {
      BusinessShortCode: merchantCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: merchantCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: account_reference,
      TransactionDesc: `Payment for ${account_reference}`,
      ThirdPartyTransID: thirdPartyTransId
    }

    console.log('STK Push payload prepared:', {
      ...stkPayload,
      Password: '[HIDDEN]' // Hide password in logs for security
    });

    // Make STK push request to Family Bank
    console.log('Sending STK Push request to Family Bank...');
    
    const familyBankResponse = await fetch(Deno.env.get('FAMILY_BANK_STK_URL')!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(stkPayload)
    })

    const familyBankResult = await familyBankResponse.json()
    console.log('Family Bank STK response:', familyBankResult)

    // Update STK request with response
    const updateData = {
      merchant_request_id: familyBankResult.MerchantRequestID || null,
      checkout_request_id: familyBankResult.CheckoutRequestID || null,
      status_code: familyBankResult.ResponseCode || null,
      response_description: familyBankResult.ResponseDescription || 'No description provided',
      customer_message: familyBankResult.CustomerMessage || 'Payment request sent',
      callback_raw: familyBankResult
    };

    console.log('Updating STK request with Family Bank response...');
    
    const { error: updateError } = await supabase
      .from('family_bank_stk_requests')
      .update(updateData)
      .eq('id', stkRequest.id)

    if (updateError) {
      console.error('Error updating STK request with response:', updateError)
    } else {
      console.log('STK request updated successfully with Family Bank response')
    }

    if (familyBankResult.ResponseCode === '0') {
      console.log('STK Push sent successfully to Family Bank');
      return new Response(JSON.stringify({
        success: true,
        message: 'STK push sent successfully',
        transaction_id: thirdPartyTransId,
        customer_message: familyBankResult.CustomerMessage || 'Please check your phone for the payment prompt'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      console.log('Family Bank rejected STK Push request:', familyBankResult.ResponseCode);
      
      // Update status to failed if Family Bank rejected the request
      await supabase
        .from('family_bank_stk_requests')
        .update({ status: 'failed' })
        .eq('id', stkRequest.id)

      return new Response(JSON.stringify({
        success: false,
        message: familyBankResult.ResponseDescription || 'STK push failed',
        error_code: familyBankResult.ResponseCode,
        customer_message: familyBankResult.CustomerMessage
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('=== Family Bank STK Push Error ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to process STK push request',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
