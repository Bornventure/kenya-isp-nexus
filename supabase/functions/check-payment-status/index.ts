
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentStatusRequest {
  paymentId?: string;
  checkoutRequestId?: string;
  invoice_id?: string;
  third_party_trans_id?: string; // For Family Bank
  paymentMethod?: string;
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

    const { 
      paymentId, 
      checkoutRequestId, 
      invoice_id, 
      third_party_trans_id,
      paymentMethod 
    }: PaymentStatusRequest = requestBody

    // Handle Family Bank payments
    if (third_party_trans_id || paymentMethod === 'family_bank') {
      console.log('Checking Family Bank payment status for:', third_party_trans_id);
      
      if (!third_party_trans_id) {
        return new Response(
          JSON.stringify({
            success: false,
            status: 'error',
            message: 'Missing third_party_trans_id for Family Bank payment'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check Family Bank STK requests table
      const { data: familyBankSTK, error: fbStkError } = await supabase
        .from('family_bank_stk_requests')
        .select('*')
        .eq('third_party_trans_id', third_party_trans_id)
        .maybeSingle()

      if (fbStkError) {
        console.error('Error fetching Family Bank STK request:', fbStkError)
        return new Response(
          JSON.stringify({
            success: false,
            status: 'error',
            message: 'Error checking Family Bank payment records'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (!familyBankSTK) {
        console.log('Family Bank STK request not found:', third_party_trans_id);
        return new Response(
          JSON.stringify({
            success: false,
            status: 'error',
            message: 'Family Bank payment request not found'
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Found Family Bank STK request with status:', familyBankSTK.status);

      if (familyBankSTK.status === 'success') {
        // Check if payment record exists
        const { data: fbPayment } = await supabase
          .from('family_bank_payments')
          .select('*')
          .eq('third_party_trans_id', third_party_trans_id)
          .maybeSingle()

        console.log('Family Bank payment confirmed');
        return new Response(
          JSON.stringify({
            success: true,
            status: 'completed',
            message: 'Payment completed successfully',
            data: {
              payment_id: fbPayment?.id,
              amount: familyBankSTK.amount,
              transaction_id: third_party_trans_id,
              client_id: familyBankSTK.client_id,
              payment_method: 'family_bank'
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else if (familyBankSTK.status === 'failed') {
        console.log('Family Bank payment failed');
        return new Response(
          JSON.stringify({
            success: false,
            status: 'failed',
            message: familyBankSTK.response_description || 'Payment failed'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        console.log('Family Bank payment still pending');
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

    // Handle M-Pesa payments (existing logic)
    if (!checkoutRequestId && !paymentId) {
      console.error('Missing required parameters for M-Pesa payment check')
      return new Response(
        JSON.stringify({
          success: false,
          status: 'error',
          message: 'Missing required parameters (checkoutRequestId or paymentId)'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const searchId = checkoutRequestId || paymentId;
    console.log('Checking M-Pesa payment status for:', searchId);

    // First check if payment is already confirmed in our database
    const { data: existingPayments, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('reference_number', searchId)
      .maybeSingle()

    if (paymentError) {
      console.error('Error fetching M-Pesa payments:', paymentError)
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

    if (existingPayments) {
      console.log('Found existing M-Pesa payment:', existingPayments.id)
      
      // Check if payment is confirmed by looking at notes content or mpesa receipt
      let isConfirmed = false
      
      try {
        if (existingPayments.mpesa_receipt_number) {
          isConfirmed = true
        } else if (existingPayments.notes) {
          // Try to parse as JSON first
          if (existingPayments.notes.startsWith('{') || existingPayments.notes.startsWith('[')) {
            const paymentNotes = JSON.parse(existingPayments.notes)
            isConfirmed = paymentNotes.status === 'confirmed'
          } else {
            // Handle plain text notes
            isConfirmed = existingPayments.notes.includes('confirmed') || 
                         existingPayments.notes.includes('Payment received')
          }
        }
      } catch (parseError) {
        console.log('Notes parsing error (using fallback):', parseError)
        // Fallback: check if payment looks confirmed
        isConfirmed = existingPayments.notes?.includes('confirmed') || 
                     existingPayments.notes?.includes('Payment received') ||
                     existingPayments.mpesa_receipt_number !== null
      }

      if (isConfirmed) {
        console.log('M-Pesa payment already confirmed in database')
        return new Response(
          JSON.stringify({
            success: true,
            status: 'completed',
            message: 'Payment already confirmed',
            data: {
              payment_id: existingPayments.id,
              amount: existingPayments.amount,
              mpesa_receipt: existingPayments.mpesa_receipt_number,
              client_id: existingPayments.client_id,
              payment_method: 'mpesa'
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Payment exists but not confirmed, check if it's still pending
      if (existingPayments.notes?.includes('PENDING')) {
        console.log('M-Pesa payment still pending in database')
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
      console.log('M-Pesa credentials not configured, treating as pending')
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

    try {
      // Get M-Pesa access token
      const auth = btoa(`${consumerKey}:${consumerSecret}`)
      const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`,
        },
      })

      if (!tokenResponse.ok) {
        console.log('Failed to get M-Pesa access token, treating as pending')
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
        CheckoutRequestID: searchId
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
            mpesaResponse: mpesaStatus,
            data: {
              payment_method: 'mpesa'
            }
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
    } catch (mpesaError) {
      console.error('M-Pesa API error:', mpesaError)
      // Fallback to pending status if M-Pesa API fails
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
