
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentStatusRequest {
  paymentId: string;
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
    console.log('Raw request body:', requestBody)

    const { paymentId, checkoutRequestId }: PaymentStatusRequest = requestBody
    console.log('Parsed parameters:', { paymentId, checkoutRequestId })

    // Validate required parameters
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

    if (!paymentId) {
      console.error('Missing paymentId parameter')
      return new Response(
        JSON.stringify({
          success: false,
          status: 'error',
          message: 'Missing paymentId parameter'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Checking payment status for:', { paymentId, checkoutRequestId })

    // Query M-Pesa status
    const { data: mpesaStatus, error: mpesaError } = await supabase.functions.invoke('mpesa-query-status', {
      body: { checkoutRequestID: checkoutRequestId }
    })

    if (mpesaError) {
      console.error('M-Pesa query error:', mpesaError)
      return new Response(
        JSON.stringify({
          success: false,
          status: 'error',
          message: 'Failed to check payment status with M-Pesa'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('M-Pesa status response:', mpesaStatus)

    // Handle case where M-Pesa returns error response
    if (!mpesaStatus || mpesaStatus.error) {
      console.error('M-Pesa returned error:', mpesaStatus)
      return new Response(
        JSON.stringify({
          success: false,
          status: 'error',
          message: mpesaStatus?.error || 'M-Pesa query failed'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if payment was successful
    if (mpesaStatus.ResponseCode === '0' && mpesaStatus.ResultCode === '0') {
      // Payment successful - find the invoice/payment record
      let paymentRecord = null
      
      // Try to find invoice first
      if (paymentId.startsWith('INV-') || paymentId.includes('-')) {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', paymentId)
          .single()

        if (invoice) {
          paymentRecord = invoice
          
          // Update invoice status
          await supabase
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', paymentId)

          // Credit client wallet and process renewal
          const { data: creditResult } = await supabase.functions.invoke('wallet-credit', {
            body: {
              client_id: invoice.client_id,
              amount: invoice.total_amount,
              payment_method: 'mpesa',
              reference_number: checkoutRequestId,
              mpesa_receipt_number: mpesaStatus.MpesaReceiptNumber || checkoutRequestId,
              description: `Payment for invoice ${invoice.invoice_number}`
            }
          })

          console.log('Wallet credited for invoice payment:', creditResult)
        }
      }

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
        message: 'Failed to check payment status'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
