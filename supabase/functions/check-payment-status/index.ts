
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

    // Check if we have an invoice with this ID
    console.log('Looking for invoice with ID:', paymentId)
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (invoiceError || !invoice) {
      console.log('Invoice not found, returning payment not found error')
      return new Response(
        JSON.stringify({
          success: false,
          status: 'unknown',
          message: 'Payment not found'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Found invoice:', invoice)

    // If invoice is already paid, return success immediately
    if (invoice.status === 'paid') {
      console.log('Invoice already marked as paid')
      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          message: 'Payment already processed'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Query M-Pesa payment status
    console.log('Querying M-Pesa status for checkout request:', checkoutRequestId)
    
    const { data: mpesaStatus, error: mpesaError } = await supabase.functions.invoke('mpesa-query-status', {
      body: { checkoutRequestID: checkoutRequestId },
    })

    if (mpesaError) {
      console.error('M-Pesa query error:', mpesaError)
      return new Response(
        JSON.stringify({
          success: false,
          status: 'error',
          message: 'Failed to query payment status'
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
    const isPaymentFailed = mpesaStatus?.ResultCode && mpesaStatus.ResultCode !== '0'
    
    let status = 'pending'
    let message = 'Payment is still pending'

    if (isPaymentSuccessful) {
      status = 'completed'
      message = 'Payment completed successfully - credited to wallet'
      
      console.log('Payment successful, crediting wallet...')
      
      // Credit the client's wallet instead of direct payment processing
      const { data: walletCredit, error: walletError } = await supabase.functions.invoke('wallet-credit', {
        body: {
          client_id: invoice.client_id,
          amount: invoice.total_amount,
          payment_method: 'mpesa',
          reference_number: checkoutRequestId,
          mpesa_receipt_number: mpesaStatus?.MpesaReceiptNumber || 'TEST_RECEIPT',
          description: 'Wallet credit via M-Pesa payment'
        }
      })

      if (walletError) {
        console.error('Error crediting wallet:', walletError)
      } else {
        console.log('Wallet credited successfully:', walletCredit)
      }
      
      // Update invoice status to paid
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', paymentId)

      if (updateError) {
        console.error('Error updating invoice status:', updateError)
      } else {
        console.log('Invoice status updated to paid')
      }

      // Send wallet credit notification
      try {
        await supabase.functions.invoke('send-notifications', {
          body: {
            client_id: invoice.client_id,
            type: 'wallet_credit',
            data: {
              amount: invoice.total_amount,
              new_balance: walletCredit?.data?.new_balance,
              auto_renewed: walletCredit?.data?.auto_renewed,
              receipt_number: mpesaStatus?.MpesaReceiptNumber || 'TEST_RECEIPT'
            }
          }
        })
        console.log('Wallet credit notification sent')
      } catch (notificationError) {
        console.error('Error sending wallet credit notification:', notificationError)
      }
    } else if (isPaymentFailed) {
      status = 'failed'
      message = mpesaStatus?.ResultDesc || 'Payment failed'
      console.log('Payment failed with message:', message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: status,
        message: message,
        mpesaResponse: mpesaStatus
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
        status: 'error',
        message: 'Payment status check failed'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
