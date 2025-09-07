
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
    console.log('=== STK Push Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody = await req.json()
    console.log('STK Push request body:', requestBody)

    const { phone, amount, account_reference, transaction_description } = requestBody

    if (!phone || !amount) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Phone and amount are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Find the client making this payment
    let cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('254')) {
      cleanPhone = '0' + cleanPhone.substring(3)
    } else if (!cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone
    }

    console.log('Looking for client with phone:', cleanPhone)

    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .or(`phone.eq.${cleanPhone},mpesa_number.eq.${phone}`)
      .limit(1)

    let client = null
    if (clients && clients.length > 0) {
      client = clients[0]
      console.log('Found client:', client.name)
    }

    // Get M-Pesa credentials
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')
    const passkey = Deno.env.get('MPESA_PASSKEY')
    const shortcode = Deno.env.get('MPESA_SHORTCODE') || '174379'

    if (!consumerKey || !consumerSecret || !passkey) {
      throw new Error('Missing M-Pesa credentials')
    }

    console.log('M-Pesa credentials loaded, shortcode:', shortcode)

    // Generate access token
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    console.log('Requesting M-Pesa access token...')

    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      console.error('Token request failed:', tokenError)
      throw new Error(`Token request failed: ${tokenError}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('Access token obtained successfully')

    // Generate timestamp in the correct format: YYYYMMDDHHMMSS
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`
    console.log('Generated timestamp:', timestamp)
    
    const password = btoa(`${shortcode}${passkey}${timestamp}`)

    // Format phone number for M-Pesa (254XXXXXXXXX)
    let mpesaPhone = phone.replace(/[^0-9]/g, '')
    if (mpesaPhone.startsWith('0')) {
      mpesaPhone = '254' + mpesaPhone.substring(1)
    } else if (!mpesaPhone.startsWith('254')) {
      mpesaPhone = '254' + mpesaPhone
    }

    // Sanitize transaction description
    let sanitizedDescription = (transaction_description || 'Wallet TopUp').replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 13)
    if (sanitizedDescription.length === 0) {
      sanitizedDescription = 'Payment'
    }

    console.log('Original description:', transaction_description)
    console.log('Sanitized description:', sanitizedDescription)
    console.log('Timestamp format:', timestamp)

    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(parseFloat(amount)),
      PartyA: mpesaPhone,
      PartyB: shortcode,
      PhoneNumber: mpesaPhone,
      CallBackURL: 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/mpesa-callback',
      AccountReference: account_reference || mpesaPhone,
      TransactionDesc: sanitizedDescription
    }

    console.log('STK Push payload:', JSON.stringify(stkPushPayload, null, 2))

    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPushPayload)
    })

    const stkData = await stkResponse.json()
    console.log('STK Push response:', JSON.stringify(stkData, null, 2))

    if (!stkResponse.ok || stkData.errorCode) {
      const errorMessage = stkData.errorMessage || stkData.ResultDesc || 'STK Push failed'
      console.error('STK Push failed:', errorMessage)
      
      return new Response(JSON.stringify({
        success: false,
        error: `STK Push request failed: ${JSON.stringify(stkData, null, 2)}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create pending payment record if client exists
    if (client && stkData.CheckoutRequestID) {
      console.log('Creating pending payment record...')
      
      const { data: pendingPayment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          client_id: client.id,
          amount: parseFloat(amount),
          payment_method: 'mpesa',
          payment_date: new Date().toISOString(),
          reference_number: stkData.CheckoutRequestID,
          notes: JSON.stringify({
            status: 'pending',
            checkout_request_id: stkData.CheckoutRequestID,
            phone: mpesaPhone,
            initiated_at: new Date().toISOString()
          }),
          isp_company_id: client.isp_company_id
        })
        .select()
        .single()

      if (paymentError) {
        console.error('Error creating pending payment record:', paymentError)
      } else {
        console.log('Pending payment record created:', pendingPayment.id)
      }
    }

    console.log('STK Push initiated successfully')

    return new Response(JSON.stringify({
      success: true,
      ...stkData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('STK Push error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
