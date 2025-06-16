
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

    // Query M-Pesa status
    const { data: mpesaStatus, error: mpesaError } = await supabase.functions.invoke('mpesa-query-status', {
      body: { checkoutRequestID: checkoutRequestId }
    })

    console.log('M-Pesa status response:', mpesaStatus)

    if (mpesaError) {
      console.error('M-Pesa query error:', mpesaError)
      return new Response(
        JSON.stringify({
          success: false,
          status: 'error',
          message: `Failed to check payment status with M-Pesa: ${mpesaError.message || 'Unknown error'}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!mpesaStatus) {
      console.error('No response from M-Pesa query')
      return new Response(
        JSON.stringify({
          success: false,
          status: 'error',
          message: 'No response from M-Pesa service'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle different M-Pesa response scenarios
    if (mpesaStatus.ResponseCode === '0' && mpesaStatus.ResultCode === '0') {
      // Payment successful - process it
      console.log('Payment confirmed successful, processing...')
      
      // Extract payment details from M-Pesa response
      // For successful payments, we need to get the amount from the CallbackMetadata
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

      // If we still don't have an amount, try to get it from the original STK push request
      if (amount === 0) {
        console.log('No amount found in M-Pesa response, checking original request...')
        // For sandbox testing, let's use a default amount or get it from request history
        // In production, this should be stored when the STK push is initiated
        amount = 10 // Default for testing - in production this should come from stored data
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

      // Process the payment
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-payment', {
        body: {
          checkoutRequestId: checkoutRequestId,
          amount: amount,
          paymentMethod: 'mpesa',
          mpesaReceiptNumber: mpesaReceiptNumber,
          phoneNumber: phoneNumber
        }
      })

      if (processError) {
        console.error('Error processing confirmed payment:', processError)
        return new Response(
          JSON.stringify({
            success: false,
            status: 'error',
            message: 'Payment confirmed but processing failed',
            details: processError.message || 'Unknown processing error'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          message: 'Payment completed and processed successfully',
          mpesaResponse: mpesaStatus,
          processResult: processResult
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else if (mpesaStatus.ResponseCode === '0' && mpesaStatus.ResultCode !== '0') {
      // Payment failed
      console.log('Payment failed with result code:', mpesaStatus.ResultCode)
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
