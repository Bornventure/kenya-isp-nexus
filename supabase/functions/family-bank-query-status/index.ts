
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
  const tokenUrl = Deno.env.get('FAMILY_BANK_TOKEN_URL') || "https://openbank.familybank.co.ke:8083/connect/token";
  const clientId = Deno.env.get('FAMILY_BANK_CLIENT_ID')!;
  const clientSecret = Deno.env.get('FAMILY_BANK_CLIENT_SECRET')!;

  console.log('Requesting OAuth2 token from:', tokenUrl);

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'client_id': clientId,
      'client_secret': clientSecret,
      'grant_type': 'client_credentials',
      'scope': 'ESB_REST_API'
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

    const { third_party_trans_id } = await req.json()

    console.log('=== Family Bank Status Query ===');
    console.log('Querying status for transaction:', third_party_trans_id);

    if (!third_party_trans_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing third_party_trans_id parameter'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the STK request details
    const { data: stkRequest, error: stkError } = await supabase
      .from('family_bank_stk_requests')
      .select('*')
      .eq('third_party_trans_id', third_party_trans_id)
      .maybeSingle()

    if (stkError || !stkRequest) {
      console.error('STK request not found:', stkError);
      return new Response(JSON.stringify({
        success: false,
        error: 'STK request not found',
        transaction_id: third_party_trans_id
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // If we already have a definitive status, return it
    if (stkRequest.status === 'success') {
      console.log('Transaction already marked as successful');
      return new Response(JSON.stringify({
        success: true,
        status: 'completed',
        message: 'Transaction completed successfully',
        transaction_data: stkRequest
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (stkRequest.status === 'failed') {
      console.log('Transaction already marked as failed');
      return new Response(JSON.stringify({
        success: false,
        status: 'failed',
        message: stkRequest.response_description || 'Transaction failed',
        transaction_data: stkRequest
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // For pending transactions, try to query Family Bank API
    console.log('Transaction still pending, querying Family Bank API...');

    try {
      // Get access token
      const accessToken = await getAccessToken();
      
      // Generate timestamp and password for query
      const timestamp = getTimestamp();
      const merchantCode = Deno.env.get('FAMILY_BANK_MERCHANT_CODE')!;
      const clientId = Deno.env.get('FAMILY_BANK_CLIENT_ID')!;
      const password = generatePassword(merchantCode, clientId, timestamp);

      // Query payload for Family Bank
      const queryPayload = {
        BusinessShortCode: merchantCode,
        Password: password,
        Timestamp: timestamp,
        ThirdPartyTransID: third_party_trans_id
      }

      console.log('Sending query to Family Bank API...');

      // Make query request to Family Bank (using STK query endpoint)
      const queryResponse = await fetch(Deno.env.get('FAMILY_BANK_STK_URL')!.replace('/stkpush/', '/stkpushquery/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(queryPayload)
      })

      if (!queryResponse.ok) {
        console.log('Family Bank query API not available or failed');
        // If query fails, return pending status
        return new Response(JSON.stringify({
          success: true,
          status: 'pending',
          message: 'Transaction is still being processed'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const queryResult = await queryResponse.json()
      console.log('Family Bank query response:', queryResult);

      // Handle query response
      if (queryResult.ResponseCode === '0' && queryResult.ResultCode === '0') {
        // Payment successful - update our records
        console.log('Query confirmed payment success');
        
        await supabase
          .from('family_bank_stk_requests')
          .update({
            status: 'success',
            response_description: queryResult.ResultDesc,
            callback_raw: queryResult
          })
          .eq('third_party_trans_id', third_party_trans_id)

        // Create payment record if not exists
        const { data: existingPayment } = await supabase
          .from('family_bank_payments')
          .select('id')
          .eq('third_party_trans_id', third_party_trans_id)
          .maybeSingle()

        if (!existingPayment) {
          await supabase
            .from('family_bank_payments')
            .insert({
              client_id: stkRequest.client_id,
              trans_id: third_party_trans_id,
              third_party_trans_id: third_party_trans_id,
              trans_amount: stkRequest.amount,
              trans_time: new Date().toISOString(),
              bill_ref_number: stkRequest.account_reference,
              msisdn: stkRequest.phone_number,
              transaction_type: 'Payment',
              status: 'completed',
              callback_raw: queryResult,
              isp_company_id: stkRequest.isp_company_id
            })

          // Handle wallet top-up if applicable
          if (stkRequest.account_reference === 'WALLET_TOPUP' && stkRequest.client_id) {
            await supabase
              .from('clients')
              .update({
                wallet_balance: supabase.sql`wallet_balance + ${stkRequest.amount}`
              })
              .eq('id', stkRequest.client_id)

            await supabase
              .from('wallet_transactions')
              .insert({
                client_id: stkRequest.client_id,
                transaction_type: 'credit',
                amount: stkRequest.amount,
                description: `Wallet top-up via Family Bank - ${third_party_trans_id}`,
                isp_company_id: stkRequest.isp_company_id,
                reference_number: third_party_trans_id
              })
          }
        }

        return new Response(JSON.stringify({
          success: true,
          status: 'completed',
          message: 'Payment completed successfully',
          query_result: queryResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        
      } else if (queryResult.ResponseCode === '0' && queryResult.ResultCode !== '0') {
        // Payment failed
        console.log('Query confirmed payment failure');
        
        await supabase
          .from('family_bank_stk_requests')
          .update({
            status: 'failed',
            response_description: queryResult.ResultDesc,
            callback_raw: queryResult
          })
          .eq('third_party_trans_id', third_party_trans_id)

        return new Response(JSON.stringify({
          success: false,
          status: 'failed',
          message: queryResult.ResultDesc || 'Payment failed',
          query_result: queryResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        
      } else {
        // Still pending
        console.log('Query indicates transaction still pending');
        return new Response(JSON.stringify({
          success: true,
          status: 'pending',
          message: 'Transaction is still being processed',
          query_result: queryResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

    } catch (queryError) {
      console.error('Family Bank query error:', queryError);
      // Fallback to pending if query fails
      return new Response(JSON.stringify({
        success: true,
        status: 'pending',
        message: 'Transaction is still being processed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Family Bank query status error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
