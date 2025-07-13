
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
      .select('id, name, wallet_balance, balance, monthly_rate, isp_company_id')
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

    // Check if there's a pending payment record to update
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .or(`reference_number.eq.${checkoutRequestId},reference_number.eq.${mpesaReceiptNumber}`)
      .contains('notes', 'PENDING CONFIRMATION')

    let paymentRecord = null

    if (existingPayments && existingPayments.length > 0) {
      // Update existing pending payment
      const existingPayment = existingPayments[0]
      console.log('Updating existing pending payment:', existingPayment.id)

      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          mpesa_receipt_number: mpesaReceiptNumber || checkoutRequestId,
          notes: `Payment confirmed via ${paymentMethod} - Receipt: ${mpesaReceiptNumber || checkoutRequestId}`,
          payment_date: new Date().toISOString()
        })
        .eq('id', existingPayment.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating payment record:', updateError)
      } else {
        paymentRecord = updatedPayment
        console.log('Payment record updated successfully:', paymentRecord.id)
      }

      // Also update the corresponding invoice status
      if (existingPayment.invoice_id) {
        await supabase
          .from('invoices')
          .update({ status: 'paid' })
          .eq('id', existingPayment.invoice_id)
        console.log('Invoice marked as paid:', existingPayment.invoice_id)
      }
    } else {
      // Create new payment record
      const { data: newPayment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          client_id: clientId,
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
      } else {
        paymentRecord = newPayment
        console.log('Payment record created successfully:', paymentRecord.id)
      }
    }

    // Update client's wallet balance - CRITICAL: Update both wallet_balance and balance fields
    const currentBalance = parseFloat(client.wallet_balance || 0)
    const newBalance = currentBalance + amount
    
    console.log('Updating wallet balance from', currentBalance, 'to', newBalance)

    const { error: balanceUpdateError } = await supabase
      .from('clients')
      .update({ 
        wallet_balance: newBalance,
        balance: newBalance // Also update the balance field for consistency
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
      // Don't fail the entire operation, just log the error
    } else {
      console.log('Wallet transaction recorded:', walletTransaction.id)
    }

    // Try automatic subscription renewal if balance is sufficient
    if (newBalance >= client.monthly_rate) {
      console.log('Attempting automatic renewal...')
      try {
        const { data: renewalResult } = await supabase.rpc('process_subscription_renewal', {
          p_client_id: clientId
        })
        
        if (renewalResult?.success) {
          console.log('Auto-renewal successful')
        }
      } catch (renewalError) {
        console.error('Auto-renewal failed:', renewalError)
      }
    }

    console.log('Payment processing completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          payment_id: paymentRecord?.id,
          client_name: client.name,
          amount: amount,
          new_balance: newBalance,
          payment_method: paymentMethod,
          auto_renewed: false // Will be updated if auto-renewal happens
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
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
