
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
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone,
          status,
          wallet_balance,
          monthly_rate,
          subscription_end_date,
          isp_company_id,
          id_number
        )
      `)
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

    console.log('Found invoice:', invoice.invoice_number, 'for client:', invoice.clients?.name)

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
      message = 'Payment completed successfully'
      
      console.log('Payment successful, processing...')
      
      // 1. Update invoice status to paid
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      if (updateError) {
        console.error('Error updating invoice status:', updateError)
      } else {
        console.log('Invoice status updated to paid')
      }

      // 2. Create payment record
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payments')
        .insert({
          client_id: invoice.client_id,
          invoice_id: invoice.id,
          amount: invoice.total_amount,
          payment_method: 'mpesa',
          payment_date: new Date().toISOString(),
          reference_number: checkoutRequestId,
          mpesa_receipt_number: mpesaStatus?.MpesaReceiptNumber || checkoutRequestId,
          notes: `M-Pesa payment for ${invoice.invoice_number}`,
          isp_company_id: invoice.clients?.isp_company_id
        })
        .select()
        .single()

      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
      } else {
        console.log('Payment record created successfully:', paymentRecord.id)
      }

      // 3. Credit the client's wallet
      console.log('Crediting wallet with amount:', invoice.total_amount)
      const { data: walletCredit, error: walletError } = await supabase.functions.invoke('wallet-credit', {
        body: {
          client_id: invoice.client_id,
          amount: invoice.total_amount,
          payment_method: 'mpesa',
          reference_number: checkoutRequestId,
          mpesa_receipt_number: mpesaStatus?.MpesaReceiptNumber || checkoutRequestId,
          description: `Payment for invoice ${invoice.invoice_number}`
        }
      })

      if (walletError) {
        console.error('Error crediting wallet:', walletError)
      } else {
        console.log('Wallet credited successfully:', walletCredit)
      }

      // 4. Process subscription renewal
      console.log('Processing subscription renewal for client:', invoice.client_id)
      const { data: renewalResult, error: renewalError } = await supabase.rpc('process_subscription_renewal', {
        p_client_id: invoice.client_id
      })

      if (!renewalError && renewalResult?.success) {
        console.log('Subscription renewed successfully:', renewalResult)
        message = 'Payment successful and subscription renewed!'
      } else {
        console.log('Renewal failed, but payment processed:', renewalResult)
        
        // If renewal failed but they paid, at least reactivate them temporarily
        await supabase
          .from('clients')
          .update({ 
            status: 'active',
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          })
          .eq('id', invoice.client_id)
        
        message = 'Payment successful and account activated!'
      }

      // 5. Send payment success notification
      try {
        await supabase.functions.invoke('send-notifications', {
          body: {
            client_id: invoice.client_id,
            type: 'payment_success',
            data: {
              amount: invoice.total_amount,
              receipt_number: mpesaStatus?.MpesaReceiptNumber || checkoutRequestId,
              invoice_number: invoice.invoice_number,
              new_balance: walletCredit?.data?.new_balance,
              auto_renewed: walletCredit?.data?.auto_renewed || renewalResult?.success
            }
          }
        })
        console.log('Payment success notification sent')
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError)
      }

      // 6. Generate receipt
      try {
        const { data: receiptData, error: receiptError } = await supabase.functions.invoke('generate-receipt', {
          body: {
            client_email: invoice.clients?.email,
            client_id_number: invoice.clients?.id_number,
            payment_id: paymentRecord?.id,
            invoice_id: invoice.id
          }
        })
        
        if (!receiptError) {
          console.log('Receipt generated successfully')
        }
      } catch (receiptError) {
        console.error('Error generating receipt:', receiptError)
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
