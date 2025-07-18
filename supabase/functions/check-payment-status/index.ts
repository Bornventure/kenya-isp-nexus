
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentStatusRequest {
  paymentId?: string;
  checkoutRequestId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Payment Status Check Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody = await req.json()
    console.log('Payment status check request:', requestBody)

    const { paymentId, checkoutRequestId }: PaymentStatusRequest = requestBody

    if (!checkoutRequestId) {
      console.error('Missing checkoutRequestId parameter')
      return new Response(
        JSON.stringify({
          success: false,
          status: 'error',
          message: 'Missing checkoutRequestId parameter'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Checking payment status for checkout request:', checkoutRequestId)

    // First check if payment is already confirmed in our database
    const { data: existingPayments, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('reference_number', checkoutRequestId)

    if (paymentError) {
      console.error('Error fetching payments:', paymentError)
      return new Response(
        JSON.stringify({
          success: false,
          status: 'error',
          message: 'Error checking payment records'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (existingPayments && existingPayments.length > 0) {
      const payment = existingPayments[0]
      console.log('Found existing payment:', payment.id)
      
      // Check if payment is confirmed by looking at notes content
      let isConfirmed = false
      let paymentNotes = {}
      
      try {
        if (payment.notes) {
          // Try to parse as JSON first
          if (payment.notes.startsWith('{') || payment.notes.startsWith('[')) {
            paymentNotes = JSON.parse(payment.notes)
            isConfirmed = paymentNotes.status === 'confirmed'
          } else {
            // Handle plain text notes
            isConfirmed = payment.notes.includes('confirmed') || 
                         payment.notes.includes('Payment received') ||
                         payment.mpesa_receipt_number !== null
          }
        }
      } catch (parseError) {
        console.log('Notes parsing error (using fallback):', parseError)
        // Fallback: check if payment looks confirmed
        isConfirmed = payment.notes?.includes('confirmed') || 
                     payment.notes?.includes('Payment received') ||
                     payment.mpesa_receipt_number !== null
      }

      if (isConfirmed) {
        console.log('Payment already confirmed in database')
        return new Response(
          JSON.stringify({
            success: true,
            status: 'completed',
            message: 'Payment already confirmed',
            data: {
              payment_id: payment.id,
              amount: payment.amount,
              mpesa_receipt: payment.mpesa_receipt_number
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Payment exists but not confirmed, check if it's still pending
      if (payment.notes?.includes('PENDING')) {
        console.log('Payment still pending in database')
        return new Response(
          JSON.stringify({
            success: true,
            status: 'pending',
            message: 'Payment is still being processed'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // If no payment record or status unclear, query M-Pesa API
    console.log('Querying M-Pesa API for payment status...')
    
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY")
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET")
    const shortcode = Deno.env.get("MPESA_SHORTCODE")
    const passkey = Deno.env.get("MPESA_PASSKEY")
    
    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      throw new Error("M-Pesa credentials not configured")
    }

    // Get M-Pesa access token
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
      },
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to get M-Pesa access token")
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Generate timestamp and password for query
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`
    const password = btoa(shortcode + passkey + timestamp)

    // Query M-Pesa transaction status
    const queryPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    }

    const queryResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryPayload),
    })

    if (!queryResponse.ok) {
      console.log('M-Pesa query failed, payment likely still pending')
      return new Response(
        JSON.stringify({
          success: true,
          status: 'pending',
          message: 'Payment is still being processed'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const mpesaStatus = await queryResponse.json()
    console.log('M-Pesa query response:', mpesaStatus)

    // Handle different M-Pesa response scenarios
    if (mpesaStatus.ResponseCode === '0' && mpesaStatus.ResultCode === '0') {
      // Payment successful
      console.log('Payment confirmed successful by M-Pesa!')
      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          message: 'Payment completed successfully',
          mpesaResponse: mpesaStatus
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else if (mpesaStatus.ResponseCode === '0' && mpesaStatus.ResultCode !== '0') {
      // Payment failed
      console.log('Payment failed with result code:', mpesaStatus.ResultCode)
      return new Response(
        JSON.stringify({
          success: false,
          status: 'failed',
          message: mpesaStatus.ResultDesc || 'Payment failed',
          mpesaResponse: mpesaStatus
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // Payment still pending
      console.log('Payment still pending')
      return new Response(
        JSON.stringify({
          success: true,
          status: 'pending',
          message: 'Payment is still being processed',
          mpesaResponse: mpesaStatus
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Payment status check error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        status: 'error',
        message: 'Failed to check payment status',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
