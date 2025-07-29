
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

    const { client_id, invoice_id, amount, phone_number, account_reference } = await req.json()

    console.log('Family Bank STK Push request:', { client_id, invoice_id, amount, phone_number, account_reference })

    // Get client details for isp_company_id
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('isp_company_id')
      .eq('id', client_id)
      .single()

    if (clientError || !clientData) {
      console.error('Error fetching client:', clientError)
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate unique transaction ID
    const thirdPartyTransId = `FB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Format phone number
    let formattedPhone = phone_number.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone
    }

    // Create STK request record
    const { data: stkRequest, error: stkError } = await supabase
      .from('family_bank_stk_requests')
      .insert({
        client_id,
        invoice_id,
        amount,
        phone_number: formattedPhone,
        account_reference,
        third_party_trans_id: thirdPartyTransId,
        transaction_desc: `Payment for invoice ${account_reference}`,
        status: 'pending',
        isp_company_id: clientData.isp_company_id
      })
      .select()
      .single()

    if (stkError) {
      console.error('Error creating STK request:', stkError)
      return new Response(JSON.stringify({ error: 'Failed to create STK request' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Family Bank STK Push payload with correct callback URL
    const stkPayload = {
      MerchantCode: Deno.env.get('FAMILY_BANK_MERCHANT_CODE'),
      AccountNumber: account_reference,
      Amount: amount,
      Currency: 'KES',
      DateExpiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes expiry
      Description: `Payment for invoice ${account_reference}`,
      ThirdPartyTransID: thirdPartyTransId,
      MSISDN: formattedPhone,
      CallBackUrl: `${supabaseUrl}/functions/v1/family-bank-stk-callback`
    }

    console.log('STK Push payload:', stkPayload)

    // Make STK push request to Family Bank
    const familyBankResponse = await fetch(Deno.env.get('FAMILY_BANK_STK_URL')!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('FAMILY_BANK_ACCESS_TOKEN')}`
      },
      body: JSON.stringify(stkPayload)
    })

    const familyBankResult = await familyBankResponse.json()
    console.log('Family Bank STK response:', familyBankResult)

    // Update STK request with response
    await supabase
      .from('family_bank_stk_requests')
      .update({
        merchant_request_id: familyBankResult.MerchantRequestID,
        checkout_request_id: familyBankResult.CheckoutRequestID,
        status_code: familyBankResult.ResponseCode,
        response_description: familyBankResult.ResponseDescription,
        customer_message: familyBankResult.CustomerMessage,
        callback_raw: familyBankResult
      })
      .eq('id', stkRequest.id)

    if (familyBankResult.ResponseCode === '0') {
      return new Response(JSON.stringify({
        success: true,
        message: 'STK push sent successfully',
        transaction_id: thirdPartyTransId,
        customer_message: familyBankResult.CustomerMessage
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: familyBankResult.ResponseDescription || 'STK push failed',
        error_code: familyBankResult.ResponseCode
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Family Bank STK Push error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
