
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

    const { checkoutRequestId, clientId, amount, paymentMethod, mpesaReceiptNumber } = requestBody

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
      .select('id, name, wallet_balance, monthly_rate, isp_company_id')
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

    console.log('Client found:', client.name)

    // Record the payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        client_id: clientId,
        amount: amount,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        reference_number: checkoutRequestId,
        mpesa_receipt_number: mpesaReceiptNumber,
        isp_company_id: client.isp_company_id
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to record payment',
          code: 'PAYMENT_RECORD_ERROR'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Payment recorded successfully:', payment.id)

    // Update client's wallet balance
    const newBalance = (client.wallet_balance || 0) + amount
    const { error: balanceUpdateError } = await supabase
      .from('clients')
      .update({ 
        wallet_balance: newBalance,
        balance: newBalance // Also update the balance field
      })
      .eq('id', clientId)

    if (balanceUpdateError) {
      console.error('Error updating client balance:', balanceUpdateError)
    } else {
      console.log('Client balance updated to:', newBalance)
    }

    // Record wallet transaction
    const { error: walletError } = await supabase
      .from('wallet_transactions')
      .insert({
        client_id: clientId,
        transaction_type: 'credit',
        amount: amount,
        description: `Payment received via ${paymentMethod}`,
        reference_number: checkoutRequestId,
        mpesa_receipt_number: mpesaReceiptNumber,
        isp_company_id: client.isp_company_id
      })

    if (walletError) {
      console.error('Error recording wallet transaction:', walletError)
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

    // Send success notification
    console.log('Payment processing completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          payment_id: payment.id,
          client_name: client.name,
          amount: amount,
          new_balance: newBalance,
          payment_method: paymentMethod
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
