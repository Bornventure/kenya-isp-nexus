
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentProcessRequest {
  checkoutRequestId: string;
  clientId?: string;
  clientEmail?: string;
  clientIdNumber?: string;
  amount: number;
  paymentMethod: 'mpesa' | 'card' | 'bank';
  mpesaReceiptNumber?: string;
  phoneNumber?: string;
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

    const requestBody: PaymentProcessRequest = await req.json()
    console.log('Processing payment:', requestBody)

    const { 
      checkoutRequestId, 
      clientId, 
      clientEmail, 
      clientIdNumber, 
      amount, 
      paymentMethod, 
      mpesaReceiptNumber, 
      phoneNumber 
    } = requestBody

    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid payment amount',
          code: 'INVALID_AMOUNT'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 1: Find the client using multiple strategies
    let client = null
    console.log('Searching for client with:', { clientId, clientEmail, clientIdNumber, phoneNumber })
    
    if (clientId) {
      console.log('Searching by client ID:', clientId)
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()
      client = data
      console.log('Client found by ID:', client?.name)
    } 
    
    if (!client && clientEmail) {
      console.log('Searching by email:', clientEmail)
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('email', clientEmail)
        .single()
      client = data
      console.log('Client found by email:', client?.name)
    }
    
    if (!client && clientIdNumber) {
      console.log('Searching by ID number:', clientIdNumber)
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id_number', clientIdNumber)
        .single()
      client = data
      console.log('Client found by ID number:', client?.name)
    }
    
    if (!client && phoneNumber) {
      console.log('Searching by phone number:', phoneNumber)
      // Clean phone number for comparison - remove country code variations
      let cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
      
      // Try different phone number formats
      const phoneVariations = []
      
      if (cleanPhone.startsWith('254')) {
        phoneVariations.push(cleanPhone) // 254700431426
        phoneVariations.push(cleanPhone.substring(3)) // 700431426
        phoneVariations.push('+' + cleanPhone) // +254700431426
        phoneVariations.push('0' + cleanPhone.substring(3)) // 0700431426
      } else if (cleanPhone.startsWith('0')) {
        phoneVariations.push(cleanPhone) // 0700431426
        phoneVariations.push(cleanPhone.substring(1)) // 700431426
        phoneVariations.push('254' + cleanPhone.substring(1)) // 254700431426
        phoneVariations.push('+254' + cleanPhone.substring(1)) // +254700431426
      } else if (cleanPhone.length === 9) {
        phoneVariations.push(cleanPhone) // 700431426
        phoneVariations.push('0' + cleanPhone) // 0700431426
        phoneVariations.push('254' + cleanPhone) // 254700431426
        phoneVariations.push('+254' + cleanPhone) // +254700431426
      }
      
      console.log('Trying phone variations:', phoneVariations)
      
      for (const phoneVar of phoneVariations) {
        const { data: phoneClients } = await supabase
          .from('clients')
          .select('*')
          .or(`phone.eq.${phoneVar},mpesa_number.eq.${phoneVar}`)
        
        if (phoneClients && phoneClients.length > 0) {
          client = phoneClients[0]
          console.log('Client found by phone variation:', phoneVar, 'Client:', client?.name)
          break
        }
      }
      
      // If still not found, try partial matching on the last 9 digits
      if (!client && cleanPhone.length >= 9) {
        const lastNineDigits = cleanPhone.slice(-9)
        const { data: phoneClients } = await supabase
          .from('clients')
          .select('*')
          .or(`phone.like.%${lastNineDigits},mpesa_number.like.%${lastNineDigits}`)
        
        if (phoneClients && phoneClients.length > 0) {
          client = phoneClients[0]
          console.log('Client found by partial phone match:', client?.name)
        }
      }
    }

    if (!client) {
      console.error('Client not found with any of the provided identifiers')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client not found',
          code: 'CLIENT_NOT_FOUND',
          details: { clientId, clientEmail, clientIdNumber, phoneNumber }
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Found client:', client.name, 'ID:', client.id)

    // Step 2: Update client's wallet balance
    const currentBalance = client.wallet_balance || 0
    const newWalletBalance = currentBalance + amount
    
    console.log('Updating wallet balance from', currentBalance, 'to', newWalletBalance)
    
    const { error: walletUpdateError } = await supabase
      .from('clients')
      .update({ 
        wallet_balance: newWalletBalance,
        mpesa_number: phoneNumber || client.mpesa_number
      })
      .eq('id', client.id)

    if (walletUpdateError) {
      console.error('Error updating wallet:', walletUpdateError)
      throw new Error(`Failed to update client wallet: ${walletUpdateError.message}`)
    }

    console.log('Wallet updated successfully. New balance:', newWalletBalance)

    // Step 3: Record wallet transaction
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        client_id: client.id,
        transaction_type: 'credit',
        amount: amount,
        description: `Payment received via ${paymentMethod.toUpperCase()}`,
        reference_number: checkoutRequestId,
        mpesa_receipt_number: mpesaReceiptNumber,
        isp_company_id: client.isp_company_id
      })

    if (transactionError) {
      console.error('Error recording wallet transaction:', transactionError)
    } else {
      console.log('Wallet transaction recorded successfully')
    }

    // Step 4: Record payment
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        client_id: client.id,
        amount: amount,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        reference_number: checkoutRequestId,
        mpesa_receipt_number: mpesaReceiptNumber,
        notes: `Payment processed via ${paymentMethod.toUpperCase()}`,
        isp_company_id: client.isp_company_id
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
    } else {
      console.log('Payment recorded successfully:', paymentRecord?.id)
    }

    // Step 5: Check if subscription renewal is needed and possible
    let renewalPerformed = false
    let invoiceGenerated = null
    
    const isSubscriptionExpired = !client.subscription_end_date || new Date(client.subscription_end_date) <= new Date()
    const isSuspended = client.status === 'suspended'
    const hasEnoughBalance = newWalletBalance >= client.monthly_rate

    console.log('Renewal check:', { 
      isSubscriptionExpired, 
      isSuspended, 
      hasEnoughBalance, 
      monthlyRate: client.monthly_rate,
      currentStatus: client.status
    })

    if ((isSubscriptionExpired || isSuspended) && hasEnoughBalance) {
      console.log('Starting automatic renewal process...')
      
      const renewalAmount = client.monthly_rate
      const newStartDate = new Date()
      const newEndDate = new Date()
      
      if (client.subscription_type === 'weekly') {
        newEndDate.setDate(newEndDate.getDate() + 7)
      } else {
        newEndDate.setDate(newEndDate.getDate() + 30)
      }

      console.log('Renewal period:', newStartDate.toISOString(), 'to', newEndDate.toISOString())

      // Deduct renewal amount from wallet
      const postRenewalBalance = newWalletBalance - renewalAmount

      const { error: renewalError } = await supabase
        .from('clients')
        .update({
          subscription_start_date: newStartDate.toISOString(),
          subscription_end_date: newEndDate.toISOString(),
          status: 'active',
          wallet_balance: postRenewalBalance
        })
        .eq('id', client.id)

      if (!renewalError) {
        renewalPerformed = true
        console.log('Subscription renewed successfully. New balance:', postRenewalBalance)

        // Record debit transaction for renewal
        await supabase
          .from('wallet_transactions')
          .insert({
            client_id: client.id,
            transaction_type: 'debit',
            amount: renewalAmount,
            description: 'Subscription renewal',
            reference_number: `RENEWAL-${Date.now()}`,
            isp_company_id: client.isp_company_id
          })

        // Generate invoice for the renewal
        const invoiceNumber = `INV-${Date.now()}`
        const vatAmount = renewalAmount * 0.16
        const totalAmount = renewalAmount + vatAmount

        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            client_id: client.id,
            invoice_number: invoiceNumber,
            amount: renewalAmount,
            vat_amount: vatAmount,
            total_amount: totalAmount,
            status: 'paid',
            service_period_start: newStartDate.toISOString().split('T')[0],
            service_period_end: newEndDate.toISOString().split('T')[0],
            due_date: newEndDate.toISOString().split('T')[0],
            notes: 'Auto-generated invoice for subscription renewal',
            isp_company_id: client.isp_company_id
          })
          .select()
          .single()

        if (!invoiceError && invoice) {
          invoiceGenerated = invoice
          console.log('Invoice generated:', invoice.invoice_number)

          // Link payment to invoice
          if (paymentRecord) {
            await supabase
              .from('payments')
              .update({ invoice_id: invoice.id })
              .eq('id', paymentRecord.id)
          }
        } else {
          console.error('Error generating invoice:', invoiceError)
        }
      } else {
        console.error('Error during renewal:', renewalError)
      }
    }

    // Step 6: Send notifications
    try {
      console.log('Sending payment success notification...')
      await supabase.functions.invoke('send-notifications', {
        body: {
          client_id: client.id,
          type: 'payment_success',
          data: {
            amount: amount,
            receipt_number: mpesaReceiptNumber || checkoutRequestId,
            payment_method: paymentMethod.toUpperCase(),
            new_balance: renewalPerformed ? newWalletBalance - client.monthly_rate : newWalletBalance,
            auto_renewed: renewalPerformed
          }
        }
      })

      // Renewal notification if subscription was renewed
      if (renewalPerformed) {
        console.log('Sending renewal notification...')
        await supabase.functions.invoke('send-notifications', {
          body: {
            client_id: client.id,
            type: 'service_renewal',
            data: {
              invoice_number: invoiceGenerated?.invoice_number,
              service_period_start: client.subscription_start_date,
              service_period_end: client.subscription_end_date
            }
          }
        })
      }

      console.log('Notifications sent successfully')
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError)
    }

    console.log('Payment processing completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          client_id: client.id,
          client_name: client.name,
          payment_amount: amount,
          new_wallet_balance: renewalPerformed ? newWalletBalance - client.monthly_rate : newWalletBalance,
          subscription_renewed: renewalPerformed,
          invoice_generated: !!invoiceGenerated,
          invoice: invoiceGenerated,
          client_status: renewalPerformed ? 'active' : client.status
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
        details: error.message,
        code: 'PROCESSING_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
