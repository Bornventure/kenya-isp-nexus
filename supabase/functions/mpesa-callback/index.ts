
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== M-Pesa Callback Received ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the raw callback data
    const callbackData = await req.json()
    console.log('Raw M-Pesa callback data:', JSON.stringify(callbackData, null, 2))

    // Handle different callback structures
    let stkCallbackData = null
    let resultCode = null
    let resultDesc = null
    let callbackMetadata = null

    // Check for STK Push callback structure
    if (callbackData.Body?.stkCallback) {
      stkCallbackData = callbackData.Body.stkCallback
      resultCode = stkCallbackData.ResultCode
      resultDesc = stkCallbackData.ResultDesc
      callbackMetadata = stkCallbackData.CallbackMetadata
      console.log('STK Push callback detected:', {
        resultCode,
        resultDesc,
        hasMetadata: !!callbackMetadata
      })
    } else if (callbackData.stkCallback) {
      stkCallbackData = callbackData.stkCallback
      resultCode = stkCallbackData.ResultCode
      resultDesc = stkCallbackData.ResultDesc
      callbackMetadata = stkCallbackData.CallbackMetadata
    } else {
      console.log('Unknown callback structure, logging raw data for analysis')
      return new Response(JSON.stringify({
        success: false,
        error: 'Unknown callback structure',
        rawData: callbackData
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Handle failed transactions
    if (resultCode !== 0) {
      console.log('Transaction failed:', resultDesc)
      return new Response(JSON.stringify({
        success: false,
        error: 'Transaction failed',
        resultCode,
        resultDesc
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Extract payment details from successful transaction
    if (!callbackMetadata || !callbackMetadata.Item) {
      console.error('No callback metadata found')
      return new Response(JSON.stringify({
        success: false,
        error: 'No transaction metadata found'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse metadata items
    const metadata = {}
    callbackMetadata.Item.forEach(item => {
      if (item.Name && item.Value !== undefined) {
        metadata[item.Name] = item.Value
      }
    })

    const amount = metadata['Amount'] || 0
    const mpesaReceiptNumber = metadata['MpesaReceiptNumber'] || ''
    const phoneNumber = metadata['PhoneNumber'] || ''
    const transactionDate = metadata['TransactionDate'] || ''

    console.log('Extracted payment details:', {
      amount,
      mpesaReceiptNumber,
      phoneNumber,
      transactionDate
    })

    if (!amount || !mpesaReceiptNumber || !phoneNumber) {
      console.error('Missing required payment details')
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required payment details',
        metadata
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Find the pending payment record by phone number or checkout request ID
    console.log('Looking for pending payment record...')
    
    // Clean phone number for search
    let cleanPhone = phoneNumber.toString()
    if (cleanPhone.startsWith('254')) {
      cleanPhone = '0' + cleanPhone.substring(3)
    }

    const { data: pendingPayments, error: searchError } = await supabase
      .from('payments')
      .select(`
        *,
        clients!inner (*)
      `)
      .eq('payment_method', 'mpesa')
      .ilike('notes', '%PENDING%')
      .or(`reference_number.ilike.%${cleanPhone}%,clients.phone.eq.${cleanPhone},clients.mpesa_number.eq.${phoneNumber}`)

    if (searchError) {
      console.error('Error searching for pending payments:', searchError)
    }

    console.log('Found pending payments:', pendingPayments?.length || 0)

    let client = null
    let paymentRecord = null

    if (pendingPayments && pendingPayments.length > 0) {
      // Find the best matching payment record
      paymentRecord = pendingPayments.find(p => 
        Math.abs(parseFloat(p.amount) - parseFloat(amount)) < 0.01
      ) || pendingPayments[0]
      
      client = paymentRecord.clients
      console.log('Found matching payment record:', paymentRecord.id, 'for client:', client?.name)
    } else {
      // Try to find client by phone number directly
      console.log('No pending payment found, searching for client by phone...')
      
      const phoneVariations = [
        phoneNumber.toString(),
        cleanPhone,
        phoneNumber.toString().startsWith('254') ? '0' + phoneNumber.toString().substring(3) : '254' + phoneNumber.toString().substring(1)
      ]

      for (const phone of phoneVariations) {
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .or(`phone.eq.${phone},mpesa_number.eq.${phone}`)
          .limit(1)

        if (clients && clients.length > 0) {
          client = clients[0]
          console.log('Found client by phone:', client.name)
          break
        }
      }
    }

    if (!client) {
      console.log('No client found for phone:', phoneNumber)
      return new Response(JSON.stringify({
        success: false,
        error: 'Client not found',
        phoneNumber,
        amount
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Process the payment confirmation
    console.log('Processing payment confirmation for client:', client.name)

    if (paymentRecord) {
      // Update existing payment record
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          mpesa_receipt_number: mpesaReceiptNumber,
          notes: `Payment confirmed via M-Pesa - Receipt: ${mpesaReceiptNumber}`,
          payment_date: new Date().toISOString()
        })
        .eq('id', paymentRecord.id)

      if (updateError) {
        console.error('Error updating payment record:', updateError)
      } else {
        console.log('Payment record updated successfully')
      }
    } else {
      // Create new payment record
      const { data: newPayment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          client_id: client.id,
          amount: parseFloat(amount),
          payment_method: 'mpesa',
          payment_date: new Date().toISOString(),
          reference_number: phoneNumber.toString(),
          mpesa_receipt_number: mpesaReceiptNumber,
          notes: `Wallet top-up via M-Pesa - Receipt: ${mpesaReceiptNumber}`,
          isp_company_id: client.isp_company_id
        })
        .select()
        .single()

      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
      } else {
        paymentRecord = newPayment
        console.log('New payment record created:', paymentRecord.id)
      }
    }

    // Update client's wallet balance
    const currentBalance = parseFloat(client.wallet_balance || 0)
    const newBalance = currentBalance + parseFloat(amount)
    
    console.log('Updating wallet balance from', currentBalance, 'to', newBalance)

    const { error: balanceUpdateError } = await supabase
      .from('clients')
      .update({ 
        wallet_balance: newBalance,
        balance: newBalance // Also update the balance field for consistency
      })
      .eq('id', client.id)

    if (balanceUpdateError) {
      console.error('Error updating client balance:', balanceUpdateError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to update wallet balance',
        details: balanceUpdateError
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Client balance updated successfully to:', newBalance)

    // Record wallet transaction
    const { data: walletTransaction, error: walletError } = await supabase
      .from('wallet_transactions')
      .insert({
        client_id: client.id,
        transaction_type: 'credit',
        amount: parseFloat(amount),
        description: `M-Pesa payment received - Receipt: ${mpesaReceiptNumber}`,
        reference_number: mpesaReceiptNumber,
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

    console.log('M-Pesa callback processed successfully')

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment processed successfully',
      data: {
        client_name: client.name,
        amount: parseFloat(amount),
        new_balance: newBalance,
        mpesa_receipt: mpesaReceiptNumber
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('M-Pesa callback processing error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Callback processing failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
