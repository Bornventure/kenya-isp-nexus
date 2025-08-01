
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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('=== Payment Processing Started ===')

    const requestBody: PaymentRequest = await req.json()
    console.log('Processing payment request:', requestBody)

    const { checkoutRequestId, clientId, amount, paymentMethod, mpesaReceiptNumber, phoneNumber } = requestBody

    if (!clientId || !amount || amount <= 0) {
      console.error('Invalid request data:', { clientId, amount })
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

    // Get client details with proper error handling
    console.log('Fetching client details for:', clientId)
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, wallet_balance, balance, monthly_rate, isp_company_id, email, phone, id_number, subscription_end_date')
      .eq('id', clientId)
      .single()

    if (clientError) {
      console.error('Error fetching client:', clientError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch client details',
          code: 'CLIENT_FETCH_ERROR',
          details: clientError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!client) {
      console.error('Client not found:', clientId)
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

    console.log('Creating invoice:', invoiceNumber)
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
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create invoice',
          code: 'INVOICE_ERROR',
          details: invoiceError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Invoice created successfully:', invoice.id)

    // Create payment record
    console.log('Creating payment record...')
    const paymentInsertData = {
      client_id: clientId,
      invoice_id: invoice.id,
      amount: amount,
      payment_method: paymentMethod,
      payment_date: new Date().toISOString(),
      reference_number: checkoutRequestId,
      mpesa_receipt_number: mpesaReceiptNumber || null,
      notes: `Payment via ${paymentMethod} - Receipt: ${mpesaReceiptNumber || checkoutRequestId}`,
      isp_company_id: client.isp_company_id
    }

    console.log('Payment insert data:', paymentInsertData)

    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentInsertData)
      .select()
      .single()

    if (paymentError) {
      console.error('Payment record creation failed:', paymentError)
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
    }

    console.log('Payment record created successfully:', paymentRecord.id)

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
          code: 'BALANCE_UPDATE_ERROR',
          details: balanceUpdateError.message
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
      // Don't fail the entire payment for wallet transaction error
    } else {
      console.log('Wallet transaction recorded:', walletTransaction.id)
    }

    // Check if balance is sufficient for auto-renewal and service is not already active
    let autoRenewed = false
    const currentDate = new Date()
    const serviceExpired = !client.subscription_end_date || new Date(client.subscription_end_date) <= currentDate
    
    if (newBalance >= client.monthly_rate && serviceExpired) {
      console.log('Attempting automatic renewal...')
      try {
        const { data: renewalResult, error: renewalError } = await supabase.rpc('process_subscription_renewal', {
          p_client_id: clientId
        })
        
        if (!renewalError && renewalResult?.success) {
          console.log('Auto-renewal successful')
          autoRenewed = true
        } else {
          console.log('Auto-renewal failed or not applicable:', renewalError?.message || renewalResult?.message)
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
          payment_id: paymentRecord.id,
          invoice_id: invoice.id,
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
