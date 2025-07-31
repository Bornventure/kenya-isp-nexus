
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  checkoutRequestId: string;
  clientId: string;
  amount: number;
  paymentMethod: 'mpesa' | 'bank' | 'cash';
  mpesaReceiptNumber?: string;
  phoneNumber?: string;
  ispCompanyId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Payment Processing Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody: PaymentRequest = await req.json()
    console.log('Processing payment:', requestBody)

    const { checkoutRequestId, clientId, amount, paymentMethod, mpesaReceiptNumber, phoneNumber } = requestBody

    if (!clientId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Valid client ID and amount are required',
          code: 'INVALID_REQUEST'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, wallet_balance, balance, monthly_rate, isp_company_id, email, phone, id_number, status, subscription_end_date')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      console.error('Client not found:', clientError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client not found',
          code: 'CLIENT_NOT_FOUND'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Client found:', client.name, 'Current wallet balance:', client.wallet_balance)

    // Generate invoice for the payment
    const invoiceNumber = `INV-${Date.now()}-${client.id.substring(0, 8)}`
    const dueDate = new Date()
    const serviceStartDate = new Date()
    const serviceEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        client_id: clientId,
        amount: amount,
        vat_amount: 0,
        total_amount: amount,
        due_date: dueDate.toISOString(),
        service_period_start: serviceStartDate.toISOString(),
        service_period_end: serviceEndDate.toISOString(),
        status: 'paid',
        notes: `Wallet top-up payment via ${paymentMethod} - Receipt: ${mpesaReceiptNumber || checkoutRequestId}`,
        isp_company_id: client.isp_company_id
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
    } else {
      console.log('Invoice created successfully:', invoice.id)
    }

    // Create payment record - Remove all fields that don't exist in the payments table
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        client_id: clientId,
        invoice_id: invoice?.id,
        amount: amount,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        reference_number: checkoutRequestId,
        mpesa_receipt_number: mpesaReceiptNumber,
        notes: `Payment via ${paymentMethod} - Receipt: ${mpesaReceiptNumber || checkoutRequestId}`,
        isp_company_id: client.isp_company_id
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to record payment',
          code: 'PAYMENT_RECORD_ERROR',
          details: paymentError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.log('Payment record created successfully:', paymentRecord.id)
    }

    // Update client's wallet balance
    const currentBalance = parseFloat(client.wallet_balance || 0)
    const newBalance = currentBalance + amount
    
    console.log('Updating wallet balance from', currentBalance, 'to', newBalance)

    const { error: balanceUpdateError } = await supabase
      .from('clients')
      .update({ 
        wallet_balance: newBalance,
        balance: newBalance
      })
      .eq('id', clientId)

    if (balanceUpdateError) {
      console.error('Error updating client balance:', balanceUpdateError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to update wallet balance',
          code: 'BALANCE_UPDATE_ERROR'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Client balance updated successfully to:', newBalance)

    // Record wallet transaction
    const { data: walletTransaction, error: walletError } = await supabase
      .from('wallet_transactions')
      .insert({
        client_id: clientId,
        transaction_type: 'credit',
        amount: amount,
        description: `Payment received via ${paymentMethod} - Receipt: ${mpesaReceiptNumber || checkoutRequestId}`,
        reference_number: checkoutRequestId,
        mpesa_receipt_number: mpesaReceiptNumber,
        isp_company_id: client.isp_company_id
      })
      .select()
      .single()

    if (walletError) {
      console.error('Error recording wallet transaction:', walletError)
    } else {
      console.log('Wallet transaction recorded:', walletTransaction.id)
    }

    // Check if balance is sufficient for auto-renewal and service is not already active
    let autoRenewed = false
    const currentDate = new Date()
    const serviceExpired = !client.subscription_end_date || new Date(client.subscription_end_date) <= currentDate
    
    if (newBalance >= client.monthly_rate && (client.status === 'suspended' || serviceExpired)) {
      console.log('Attempting automatic renewal...')
      try {
        const { data: renewalResult } = await supabase.rpc('process_subscription_renewal', {
          p_client_id: clientId
        })
        
        if (renewalResult?.success) {
          console.log('Auto-renewal successful')
          autoRenewed = true
          
          // Send renewal notification
          await supabase.functions.invoke('send-notifications', {
            body: {
              client_id: clientId,
              type: 'service_renewal',
              data: {
                amount: client.monthly_rate,
                service_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                remaining_balance: newBalance - client.monthly_rate
              }
            }
          })
        }
      } catch (renewalError) {
        console.error('Auto-renewal failed:', renewalError)
      }
    }

    // Send payment success notification
    try {
      await supabase.functions.invoke('send-notifications', {
        body: {
          client_id: clientId,
          type: 'payment_success',
          data: {
            amount: amount,
            receipt_number: mpesaReceiptNumber || checkoutRequestId,
            payment_method: paymentMethod,
            new_balance: autoRenewed ? newBalance - client.monthly_rate : newBalance,
            auto_renewed: autoRenewed
          }
        }
      })
      console.log('Payment success notification sent')
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError)
    }

    console.log('Payment processing completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          payment_id: paymentRecord.id,
          invoice_id: invoice?.id,
          client_name: client.name,
          amount: amount,
          new_balance: autoRenewed ? newBalance - client.monthly_rate : newBalance,
          payment_method: paymentMethod,
          wallet_transaction_id: walletTransaction?.id,
          auto_renewed: autoRenewed
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Payment processing failed',
        code: 'INTERNAL_ERROR',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
