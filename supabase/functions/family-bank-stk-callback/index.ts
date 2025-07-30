
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('=== Family Bank STK Callback Received ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle empty request body
    let callbackData;
    const requestText = await req.text();
    
    console.log('Raw request body:', requestText);
    
    if (!requestText || requestText.trim() === '') {
      console.log('Empty request body received');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Empty request body' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      callbackData = JSON.parse(requestText);
      console.log('Parsed callback data:', JSON.stringify(callbackData, null, 2));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Failed to parse request text:', requestText);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid JSON in request body',
        received_data: requestText 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Store callback data for audit trail
    console.log('Storing callback data...');
    const { data: callback, error: callbackError } = await supabase
      .from('family_bank_stk_callbacks')
      .insert({
        callback_raw: callbackData,
        processed: false
      })
      .select()
      .single()

    if (callbackError) {
      console.error('Error storing callback:', callbackError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to store callback',
        details: callbackError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Callback stored with ID:', callback.id);

    const responseCode = callbackData.ResponseCode
    const thirdPartyTransId = callbackData.ThirdPartyTransID

    console.log('Processing callback for transaction:', thirdPartyTransId, 'with response code:', responseCode)

    // Find the corresponding STK request
    console.log('Looking up STK request...');
    const { data: stkRequest, error: stkError } = await supabase
      .from('family_bank_stk_requests')
      .select('*')
      .eq('third_party_trans_id', thirdPartyTransId)
      .maybeSingle()

    if (stkError) {
      console.error('Error looking up STK request:', stkError);
      
      // Mark callback as processed even if we can't find the STK request
      await supabase
        .from('family_bank_stk_callbacks')
        .update({ processed: true })
        .eq('id', callback.id)
      
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database error while looking up STK request',
        transaction_id: thirdPartyTransId 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!stkRequest) {
      console.error('STK request not found for transaction:', thirdPartyTransId);
      
      // Mark callback as processed even if we can't find the STK request
      await supabase
        .from('family_bank_stk_callbacks')
        .update({ processed: true })
        .eq('id', callback.id)
      
      return new Response(JSON.stringify({ 
        success: false,
        error: 'STK request not found',
        transaction_id: thirdPartyTransId 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Found STK request:', stkRequest.id, 'for transaction:', thirdPartyTransId)

    // Update STK request status based on response code
    if (responseCode === '0') {
      console.log('Payment successful for transaction:', thirdPartyTransId);
      
      // Update STK request to success
      const { error: updateError } = await supabase
        .from('family_bank_stk_requests')
        .update({
          status: 'success',
          merchant_request_id: callbackData.MerchantRequestID,
          checkout_request_id: callbackData.CheckoutRequestID,
          response_description: callbackData.ResponseDescription,
          customer_message: callbackData.CustomerMessage,
          callback_raw: callbackData
        })
        .eq('third_party_trans_id', thirdPartyTransId)

      if (updateError) {
        console.error('Error updating STK request to success:', updateError)
      } else {
        console.log('STK request updated to success for:', thirdPartyTransId)
      }

      // Create payment record
      console.log('Creating payment record...');
      const { error: paymentError } = await supabase
        .from('family_bank_payments')
        .insert({
          client_id: stkRequest.client_id,
          trans_id: callbackData.MerchantRequestID || thirdPartyTransId,
          third_party_trans_id: thirdPartyTransId,
          trans_amount: stkRequest.amount,
          trans_time: new Date().toISOString(),
          bill_ref_number: stkRequest.account_reference,
          msisdn: stkRequest.phone_number,
          transaction_type: 'Payment',
          status: 'completed',
          callback_raw: callbackData,
          isp_company_id: stkRequest.isp_company_id
        })

      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
      } else {
        console.log('Payment record created successfully for:', thirdPartyTransId)
      }

      // If this is a wallet top-up, update client wallet balance
      if (stkRequest.account_reference === 'WALLET_TOPUP' && stkRequest.client_id) {
        console.log('Processing wallet top-up for client:', stkRequest.client_id, 'Amount:', stkRequest.amount)
        
        // Update client wallet balance
        const { error: walletError } = await supabase
          .from('clients')
          .update({
            wallet_balance: supabase.sql`wallet_balance + ${stkRequest.amount}`
          })
          .eq('id', stkRequest.client_id)

        if (walletError) {
          console.error('Error updating wallet balance:', walletError)
        } else {
          console.log('Wallet balance updated successfully for client:', stkRequest.client_id)
        }

        // Create wallet transaction record
        const { error: walletTransactionError } = await supabase
          .from('wallet_transactions')
          .insert({
            client_id: stkRequest.client_id,
            transaction_type: 'credit',
            amount: stkRequest.amount,
            description: `Wallet top-up via Family Bank - ${thirdPartyTransId}`,
            isp_company_id: stkRequest.isp_company_id,
            reference_number: thirdPartyTransId
          })

        if (walletTransactionError) {
          console.error('Error creating wallet transaction:', walletTransactionError)
        } else {
          console.log('Wallet transaction created successfully')
        }
      }

    } else {
      console.log('Payment failed for transaction:', thirdPartyTransId, 'Response code:', responseCode)
      
      // Update STK request to failed
      const { error: failureUpdateError } = await supabase
        .from('family_bank_stk_requests')
        .update({
          status: 'failed',
          response_description: callbackData.ResponseDescription,
          customer_message: callbackData.CustomerMessage,
          callback_raw: callbackData
        })
        .eq('third_party_trans_id', thirdPartyTransId)

      if (failureUpdateError) {
        console.error('Error updating STK request to failed:', failureUpdateError)
      } else {
        console.log('STK request updated to failed for:', thirdPartyTransId)
      }
    }

    // Mark callback as processed
    await supabase
      .from('family_bank_stk_callbacks')
      .update({ processed: true })
      .eq('id', callback.id)

    console.log('Callback processed successfully for:', thirdPartyTransId)

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Callback processed successfully',
      transaction_id: thirdPartyTransId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('=== Family Bank STK Callback Error ===')
    console.error('Error details:', error)
    console.error('Error stack:', error.stack)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to process callback',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
