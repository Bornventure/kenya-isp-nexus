
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
    console.log('=== Wallet Credit Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody: WalletCreditRequest = await req.json()
    console.log('Wallet credit request:', requestBody)

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
      .select('id, name, wallet_balance, monthly_rate, isp_company_id, subscription_end_date')
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

    // Credit the wallet
    const newBalance = (client.wallet_balance || 0) + amount

    const { error: updateError } = await supabase
      .from('clients')
      .update({ wallet_balance: newBalance })
      .eq('id', client_id)

    if (updateError) {
      console.error('Error updating wallet balance:', updateError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to update wallet balance',
          code: 'UPDATE_ERROR'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Record the wallet transaction
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        client_id: client_id,
        transaction_type: 'credit',
        amount: amount,
        description: description || `Wallet credit via ${payment_method}`,
        reference_number: reference_number,
        mpesa_receipt_number: mpesa_receipt_number,
        isp_company_id: client.isp_company_id
      })

    if (transactionError) {
      console.error('Error recording transaction:', transactionError)
    }

    // Check if client can now be auto-renewed
    const canAutoRenew = newBalance >= client.monthly_rate
    let renewalResult = null

    if (canAutoRenew && client.subscription_end_date && new Date(client.subscription_end_date) <= new Date()) {
      // Attempt automatic renewal
      const { data: renewal, error: renewalError } = await supabase.rpc('process_subscription_renewal', {
        p_client_id: client_id
      })

      if (!renewalError && renewal?.success) {
        renewalResult = renewal
        console.log('Auto-renewal successful:', renewal)
      }
    }

    console.log('Wallet credited successfully for:', client.name)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          client_name: client.name,
          previous_balance: client.wallet_balance || 0,
          credit_amount: amount,
          new_balance: newBalance,
          auto_renewed: !!renewalResult,
          renewal_details: renewalResult
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Wallet credit error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Wallet credit failed',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
