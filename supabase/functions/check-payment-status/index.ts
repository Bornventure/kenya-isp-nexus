import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentStatusRequest {
  paymentId?: string;
  checkoutRequestId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Payment Status Check Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody = await req.json()
    console.log('Payment status check request:', requestBody)

    const { paymentId, checkoutRequestId }: PaymentStatusRequest = requestBody

    if (!checkoutRequestId) {
      console.error('Missing checkoutRequestId parameter')
      return new Response(
        JSON.stringify({
          success: false,
          status: 'error',
          message: 'Missing checkoutRequestId parameter'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Querying M-Pesa status for checkout request:', checkoutRequestId)

    // First check if payment is already confirmed in our database
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('reference_number', checkoutRequestId)
      .single()

    if (existingPayment) {
      const paymentNotes = existingPayment.notes ? JSON.parse(existingPayment.notes) : {}
      if (paymentNotes.status === 'confirmed') {
        console.log('Payment already confirmed in database')
        return new Response(
          JSON.stringify({
            success: true,
            status: 'completed',
            message: 'Payment already confirmed',
            data: existingPayment
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Query M-Pesa API for actual payment status
    console.log('Querying M-Pesa API for payment status...')
    
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY")
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET")
    const shortcode = Deno.env.get("MPESA_SHORTCODE")
    const passkey = Deno.env.get("MPESA_PASSKEY")
    
    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      throw new Error("M-Pesa credentials not configured")
    }

    // Get M-Pesa access token
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    const tokenResponse = await fetch("https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
      },
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to get M-Pesa access token")
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Generate timestamp and password for query
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)
    const password = btoa(shortcode + passkey + timestamp)

    // Query M-Pesa transaction status
    const queryPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    }

    const queryResponse = await fetch("https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryPayload),
    })

    if (!queryResponse.ok) {
      console.log('M-Pesa query failed, payment likely still pending')
      return new Response(
        JSON.stringify({
          success: true,
          status: 'pending',
          message: 'Payment is still being processed'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const mpesaStatus = await queryResponse.json()
    console.log('M-Pesa query response:', mpesaStatus)

    // Handle different M-Pesa response scenarios
    if (mpesaStatus.ResponseCode === '0' && mpesaStatus.ResultCode === '0') {
      // Payment successful - process it
      console.log('Payment confirmed successful, processing...')
      
      // Extract payment details from M-Pesa response
      let amount = 0
      let phoneNumber = ''
      let mpesaReceiptNumber = mpesaStatus.MpesaReceiptNumber || checkoutRequestId

      // Try to extract amount from different possible fields in the response
      if (mpesaStatus.CallbackMetadata && mpesaStatus.CallbackMetadata.Item) {
        const items = mpesaStatus.CallbackMetadata.Item
        const amountItem = items.find((item: any) => item.Name === 'Amount')
        if (amountItem) {
          amount = parseFloat(amountItem.Value || '0')
        }
        
        const phoneItem = items.find((item: any) => item.Name === 'PhoneNumber')
        if (phoneItem) {
          phoneNumber = phoneItem.Value
        }

        const receiptItem = items.find((item: any) => item.Name === 'MpesaReceiptNumber')
        if (receiptItem) {
          mpesaReceiptNumber = receiptItem.Value
        }
      } else if (mpesaStatus.TransAmount) {
        // Fallback to TransAmount if available
        amount = parseFloat(mpesaStatus.TransAmount)
      } else if (mpesaStatus.Amount) {
        // Another fallback
        amount = parseFloat(mpesaStatus.Amount)
      }

      // If we still don't have an amount, get it from the existing payment record
      if (amount === 0 && existingPayment) {
        amount = existingPayment.amount
        console.log('Using amount from existing payment record:', amount)
      }

      if (mpesaStatus.PhoneNumber) {
        phoneNumber = mpesaStatus.PhoneNumber
      }

      console.log('Processing payment with details:', {
        amount,
        phoneNumber,
        mpesaReceiptNumber,
        checkoutRequestId
      })

      if (amount <= 0) {
        console.error('Invalid amount detected:', amount)
        return new Response(
          JSON.stringify({
            success: false,
            status: 'error',
            message: 'Invalid payment amount detected'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Process the payment directly
      try {
        // Step 1: Find the client using multiple strategies
        let client = null
        console.log('Searching for client with phoneNumber:', phoneNumber)
        
        if (phoneNumber) {
          // Clean phone number for comparison
          let cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
          
          // Try different phone number formats
          const phoneVariations = []
          
          if (cleanPhone.startsWith('254')) {
            phoneVariations.push(cleanPhone)
            phoneVariations.push(cleanPhone.substring(3))
            phoneVariations.push('+' + cleanPhone)
            phoneVariations.push('0' + cleanPhone.substring(3))
          } else if (cleanPhone.startsWith('0')) {
            phoneVariations.push(cleanPhone)
            phoneVariations.push(cleanPhone.substring(1))
            phoneVariations.push('254' + cleanPhone.substring(1))
            phoneVariations.push('+254' + cleanPhone.substring(1))
          } else if (cleanPhone.length === 9) {
            phoneVariations.push(cleanPhone)
            phoneVariations.push('0' + cleanPhone)
            phoneVariations.push('254' + cleanPhone)
            phoneVariations.push('+254' + cleanPhone)
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
        }

        if (!client) {
          console.error('Client not found with phone number:', phoneNumber)
          return new Response(
            JSON.stringify({
              success: false,
              status: 'error',
              message: 'Client not found for payment processing',
              details: { phoneNumber }
            }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log('Found client:', client.name, 'ID:', client.id)

        // Step 2: Update payment record with confirmation details
        const { error: paymentUpdateError } = await supabase
          .from('payments')
          .update({
            mpesa_receipt_number: mpesaReceiptNumber,
            notes: JSON.stringify({
              ...JSON.parse(existingPayment.notes || '{}'),
              status: 'confirmed',
              confirmed_at: new Date().toISOString(),
              mpesa_receipt: mpesaReceiptNumber
            })
          })
          .eq('id', existingPayment.id)

        if (paymentUpdateError) {
          console.error('Error updating payment record:', paymentUpdateError)
        }

        // Step 3: Update client's wallet balance
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

        // Step 4: Record wallet transaction
        const { error: transactionError } = await supabase
          .from('wallet_transactions')
          .insert({
            client_id: client.id,
            transaction_type: 'credit',
            amount: amount,
            description: `Payment received via MPESA - Confirmed`,
            reference_number: checkoutRequestId,
            mpesa_receipt_number: mpesaReceiptNumber,
            isp_company_id: client.isp_company_id
          })

        if (transactionError) {
          console.error('Error recording wallet transaction:', transactionError)
        } else {
          console.log('Wallet transaction recorded successfully')
        }

        // Step 5: Update invoice status to paid if it exists
        if (existingPayment.invoice_id) {
          const { error: invoiceUpdateError } = await supabase
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', existingPayment.invoice_id)

          if (invoiceUpdateError) {
            console.error('Error updating invoice status:', invoiceUpdateError)
          } else {
            console.log('Invoice marked as paid')
          }
        }

        console.log('Payment processing completed successfully')

        return new Response(
          JSON.stringify({
            success: true,
            status: 'completed',
            message: 'Payment completed and processed successfully',
            mpesaResponse: mpesaStatus,
            data: {
              client_id: client.id,
              client_name: client.name,
              payment_amount: amount,
              new_wallet_balance: newWalletBalance,
              client_status: client.status
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } catch (error) {
        console.error('Error processing confirmed payment:', error)
        return new Response(
          JSON.stringify({
            success: false,
            status: 'error',
            message: 'Payment confirmed but processing failed',
            details: error.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else if (mpesaStatus.ResponseCode === '0' && mpesaStatus.ResultCode !== '0') {
      // Payment failed
      console.log('Payment failed with result code:', mpesaStatus.ResultCode)
      
      // Mark payment as failed in database
      if (existingPayment) {
        await supabase
          .from('payments')
          .update({
            notes: JSON.stringify({
              ...JSON.parse(existingPayment.notes || '{}'),
              status: 'failed',
              failed_at: new Date().toISOString(),
              failure_reason: mpesaStatus.ResultDesc
            })
          })
          .eq('id', existingPayment.id)
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          status: 'failed',
          message: mpesaStatus.ResultDesc || 'Payment failed',
          mpesaResponse: mpesaStatus
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // Payment still pending
      console.log('Payment still pending')
      return new Response(
        JSON.stringify({
          success: true,
          status: 'pending',
          message: 'Payment is still being processed',
          mpesaResponse: mpesaStatus
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Payment status check error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        status: 'error',
        message: 'Failed to check payment status',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
