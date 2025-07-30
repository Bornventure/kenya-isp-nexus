
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
      .select('id, name, wallet_balance, balance, monthly_rate, isp_company_id, status, subscription_end_date')
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

    // CRITICAL FIX: Record payment in main payments table
    const { data: paymentRecord, error: paymentError } = await supabase
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

    console.log('Payment recorded:', paymentRecord.id)

    // Update client's wallet balance
    const { error: balanceUpdateError } = await supabase
      .from('clients')
      .update({ 
        wallet_balance: newBalance,
        balance: newBalance
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
    } else {
      console.log('Wallet transaction recorded:', walletTransaction.id)
    }

    // Check for auto-renewal if service is expired or suspended
    let autoRenewed = false
    const currentDate = new Date()
    const serviceExpired = !client.subscription_end_date || new Date(client.subscription_end_date) <= currentDate
    
    if (newBalance >= client.monthly_rate && (client.status === 'suspended' || serviceExpired)) {
      console.log('Attempting automatic renewal...')
      try {
        const { data: renewalResult } = await supabase.rpc('process_subscription_renewal', {
          p_client_id: client_id
        })
        
        if (renewalResult?.success) {
          console.log('Auto-renewal successful')
          autoRenewed = true
          
          // Send renewal notification
          await supabase.functions.invoke('send-notifications', {
            body: {
              client_id: client_id,
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
          client_id: client_id,
          type: 'payment_success',
          data: {
            amount: amount,
            receipt_number: mpesa_receipt_number || reference_number,
            payment_method: payment_method,
            new_balance: autoRenewed ? newBalance - client.monthly_rate : newBalance,
            auto_renewed: autoRenewed
          }
        }
      })
      console.log('Wallet credit notification sent')
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError)
    }

    console.log('Wallet credit processing completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          payment_id: paymentRecord.id,
          client_name: client.name,
          amount: amount,
          new_balance: autoRenewed ? newBalance - client.monthly_rate : newBalance,
          payment_method: payment_method,
          auto_renewed: autoRenewed
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
