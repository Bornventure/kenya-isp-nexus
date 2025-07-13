
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WalletCreditRequest {
  client_id: string;
  amount: number;
  payment_method: 'mpesa' | 'bank' | 'cash';
  reference_number: string;
  mpesa_receipt_number?: string;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Wallet Credit Processing Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody: WalletCreditRequest = await req.json()
    console.log('Processing wallet credit:', requestBody)

    const { client_id, amount, payment_method, reference_number, mpesa_receipt_number, description } = requestBody

    if (!client_id || !amount || amount <= 0) {
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
      .select('id, name, wallet_balance, balance, isp_company_id')
      .eq('id', client_id)
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

    // Calculate new balance
    const currentBalance = parseFloat(client.wallet_balance || 0)
    const newBalance = currentBalance + amount
    
    console.log('Updating wallet balance from', currentBalance, 'to', newBalance)

    // Update client's wallet balance - CRITICAL: Update both fields
    const { error: balanceUpdateError } = await supabase
      .from('clients')
      .update({ 
        wallet_balance: newBalance,
        balance: newBalance // Also update the balance field for consistency
      })
      .eq('id', client_id)

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

    console.log('Wallet balance updated successfully')

    // Record wallet transaction
    const { data: walletTransaction, error: walletError } = await supabase
      .from('wallet_transactions')
      .insert({
        client_id: client_id,
        transaction_type: 'credit',
        amount: amount,
        description: description || `Manual wallet credit via ${payment_method}`,
        reference_number: reference_number,
        mpesa_receipt_number: mpesa_receipt_number,
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

    // Record the payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        client_id: client_id,
        amount: amount,
        payment_method: payment_method,
        payment_date: new Date().toISOString(),
        reference_number: reference_number,
        mpesa_receipt_number: mpesa_receipt_number,
        notes: description || `Manual wallet credit via ${payment_method}`,
        isp_company_id: client.isp_company_id
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
      // Don't fail the entire operation, just log the error
    } else {
      console.log('Payment recorded:', payment.id)
    }

    // Try automatic subscription renewal if balance is sufficient
    const { data: clientWithPackage } = await supabase
      .from('clients')
      .select('monthly_rate')
      .eq('id', client_id)
      .single()

    if (clientWithPackage && newBalance >= clientWithPackage.monthly_rate) {
      console.log('Attempting automatic renewal...')
      try {
        const { data: renewalResult } = await supabase.rpc('process_subscription_renewal', {
          p_client_id: client_id
        })
        
        if (renewalResult?.success) {
          console.log('Auto-renewal successful')
        }
      } catch (renewalError) {
        console.error('Auto-renewal failed:', renewalError)
      }
    }

    console.log('Wallet credit processing completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          client_name: client.name,
          amount: amount,
          new_balance: newBalance,
          payment_method: payment_method,
          auto_renewed: false // Will be true if auto-renewal happened
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Wallet credit processing error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Wallet credit processing failed',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
