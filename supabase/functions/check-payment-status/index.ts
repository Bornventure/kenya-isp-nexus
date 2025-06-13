
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
    console.log('=== Payment Status Check Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody: PaymentStatusRequest = await req.json()
    console.log('Payment status check for:', requestBody)

    const { paymentId, checkoutRequestId } = requestBody

    if (!paymentId || !checkoutRequestId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment ID and Checkout Request ID are required',
          code: 'MISSING_FIELDS'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Query M-Pesa payment status using existing mpesa-query-status function
    console.log('Querying M-Pesa status for checkout request:', checkoutRequestId)
    
    const { data: mpesaStatus, error: mpesaError } = await supabase.functions.invoke('mpesa-query-status', {
      body: { checkoutRequestID: checkoutRequestId },
    })

    if (mpesaError) {
      console.error('M-Pesa query error:', mpesaError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to query payment status',
          code: 'MPESA_QUERY_ERROR'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('M-Pesa status response:', mpesaStatus)

    // Check if payment was successful
    const isPaymentSuccessful = mpesaStatus?.ResultCode === '0'
    const paymentStatus = isPaymentSuccessful ? 'completed' : 
                         mpesaStatus?.ResultCode ? 'failed' : 'pending'

    // If payment is successful, update invoice status
    if (isPaymentSuccessful) {
      console.log('Payment successful, updating invoice status...')
      
      // Find and update the invoice
      const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', paymentId)
        .single()

      if (!invoiceError && invoices) {
        // Update invoice status to paid
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ status: 'paid' })
          .eq('id', paymentId)

        if (updateError) {
          console.error('Error updating invoice status:', updateError)
        } else {
          console.log('Invoice status updated to paid')
          
          // Update client status to active if suspended
          const { error: clientUpdateError } = await supabase
            .from('clients')
            .update({ status: 'active' })
            .eq('id', invoices.client_id)

          if (clientUpdateError) {
            console.error('Error updating client status:', clientUpdateError)
          } else {
            console.log('Client status updated to active')
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          paymentId,
          checkoutRequestId,
          status: paymentStatus,
          mpesaResponse: mpesaStatus,
          resultCode: mpesaStatus?.ResultCode,
          resultDesc: mpesaStatus?.ResultDesc
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Payment status check error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Payment status check failed',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
