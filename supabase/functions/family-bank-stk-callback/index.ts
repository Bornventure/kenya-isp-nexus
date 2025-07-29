
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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const callbackData = await req.json()
    console.log('Family Bank STK Callback received:', JSON.stringify(callbackData, null, 2))

    // Store callback data
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
      return new Response(JSON.stringify({ error: 'Failed to store callback' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const responseCode = callbackData.ResponseCode
    const thirdPartyTransId = callbackData.ThirdPartyTransID

    console.log('Processing callback for transaction:', thirdPartyTransId, 'with response code:', responseCode)

    // Find the corresponding STK request
    const { data: stkRequest, error: stkError } = await supabase
      .from('family_bank_stk_requests')
      .select('*')
      .eq('third_party_trans_id', thirdPartyTransId)
      .single()

    if (stkError || !stkRequest) {
      console.error('STK request not found:', stkError)
      return new Response(JSON.stringify({ error: 'STK request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update STK request status based on response code
    if (responseCode === '0') {
      // Success
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
        console.error('Error updating STK request:', updateError)
      } else {
        console.log('STK request updated to success for:', thirdPartyTransId)
        
        // Create payment record
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
      }
    } else {
      // Failed
      console.log('Payment failed for transaction:', thirdPartyTransId)
      await supabase
        .from('family_bank_stk_requests')
        .update({
          status: 'failed',
          response_description: callbackData.ResponseDescription,
          customer_message: callbackData.CustomerMessage,
          callback_raw: callbackData
        })
        .eq('third_party_trans_id', thirdPartyTransId)
    }

    // Mark callback as processed
    await supabase
      .from('family_bank_stk_callbacks')
      .update({ processed: true })
      .eq('id', callback.id)

    console.log('Callback processed successfully for:', thirdPartyTransId)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Family Bank STK Callback error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
