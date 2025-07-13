
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MpesaCallbackData {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber?: string;
  OrgAccountBalance: string;
  ThirdPartyTransID?: string;
  MSISDN: string;
  FirstName: string;
  MiddleName?: string;
  LastName: string;
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

    const callbackData: MpesaCallbackData = await req.json()
    console.log('M-Pesa callback data:', JSON.stringify(callbackData, null, 2))

    const {
      TransID,
      TransAmount,
      MSISDN,
      FirstName,
      LastName,
      BillRefNumber,
      BusinessShortCode,
    } = callbackData

    const amount = parseFloat(TransAmount)
    const phoneNumber = MSISDN
    const mpesaReceiptNumber = TransID
    const accountReference = BillRefNumber
    const paybillNumber = BusinessShortCode

    console.log(`M-Pesa payment received:`, {
      amount,
      phoneNumber,
      accountReference,
      paybillNumber,
      mpesaReceiptNumber
    })

    // Step 1: Check if this is a wallet top-up transaction by looking for existing pending payment
    let client = null
    
    // First, try to find a pending payment record with matching checkout request ID or account reference
    const { data: pendingPayments } = await supabase
      .from('payments')
      .select(`
        *,
        clients!inner (*)
      `)
      .or(`reference_number.eq.${mpesaReceiptNumber},reference_number.eq.${accountReference}`)
      .eq('payment_method', 'mpesa')
      .contains('notes', 'PENDING CONFIRMATION')

    if (pendingPayments && pendingPayments.length > 0) {
      const payment = pendingPayments[0]
      client = payment.clients
      console.log('Found pending payment for client:', client.name)
      
      // Process this as a wallet top-up confirmation
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-payment', {
        body: {
          checkoutRequestId: mpesaReceiptNumber,
          clientId: client.id,
          amount: amount,
          paymentMethod: 'mpesa',
          mpesaReceiptNumber: mpesaReceiptNumber,
          phoneNumber: phoneNumber
        }
      })

      if (processError) {
        console.error('Error processing wallet top-up confirmation:', processError)
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to process wallet top-up confirmation',
            details: processError
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Wallet top-up confirmed successfully:', processResult)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Wallet top-up confirmed successfully',
          data: {
            ...processResult,
            client_name: client.name,
            payment_type: 'wallet_topup'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 2: If no pending payment found, try to find client by various methods for paybill payments
    
    // Find the ISP company that owns this paybill number
    const { data: ispCompany, error: ispError } = await supabase
      .from('mpesa_settings')
      .select(`
        isp_company_id,
        paybill_number,
        isp_companies!inner (
          id,
          name,
          is_active
        )
      `)
      .eq('paybill_number', paybillNumber)
      .eq('is_active', true)
      .single()

    if (ispError || !ispCompany) {
      console.error('ISP company not found for paybill:', paybillNumber, ispError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Paybill number not registered',
          paybill: paybillNumber
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Found ISP company:', ispCompany.isp_companies.name, 'for paybill:', paybillNumber)

    // Try to find client by phone number (account reference) within this ISP company
    if (accountReference) {
      console.log('Searching for client with account reference:', accountReference)
      
      // Clean and format phone number variations
      let cleanAccountRef = accountReference.replace(/[^0-9]/g, '')
      const phoneVariations = []
      
      if (cleanAccountRef.startsWith('254')) {
        phoneVariations.push(cleanAccountRef) // 254700431426
        phoneVariations.push(cleanAccountRef.substring(3)) // 700431426
        phoneVariations.push('+' + cleanAccountRef) // +254700431426
        phoneVariations.push('0' + cleanAccountRef.substring(3)) // 0700431426
      } else if (cleanAccountRef.startsWith('0')) {
        phoneVariations.push(cleanAccountRef) // 0700431426
        phoneVariations.push(cleanAccountRef.substring(1)) // 700431426
        phoneVariations.push('254' + cleanAccountRef.substring(1)) // 254700431426
        phoneVariations.push('+254' + cleanAccountRef.substring(1)) // +254700431426
      } else if (cleanAccountRef.length === 9) {
        phoneVariations.push(cleanAccountRef) // 700431426
        phoneVariations.push('0' + cleanAccountRef) // 0700431426
        phoneVariations.push('254' + cleanAccountRef) // 254700431426
        phoneVariations.push('+254' + cleanAccountRef) // +254700431426
      }
      
      console.log('Trying phone variations:', phoneVariations)
      
      for (const phoneVar of phoneVariations) {
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .eq('isp_company_id', ispCompany.isp_company_id)
          .or(`phone.eq.${phoneVar},mpesa_number.eq.${phoneVar},id_number.eq.${phoneVar}`)
        
        if (clients && clients.length > 0) {
          client = clients[0]
          console.log('Client found by variation:', phoneVar, 'Client:', client.name)
          break
        }
      }
    }

    // Fallback: search by the M-Pesa sender phone number within ISP company
    if (!client && phoneNumber) {
      console.log('Fallback: searching by sender phone number:', phoneNumber)
      
      let cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
      const senderPhoneVariations = []
      
      if (cleanPhone.startsWith('254')) {
        senderPhoneVariations.push(cleanPhone)
        senderPhoneVariations.push(cleanPhone.substring(3))
        senderPhoneVariations.push('+' + cleanPhone)
        senderPhoneVariations.push('0' + cleanPhone.substring(3))
      } else if (cleanPhone.startsWith('0')) {
        senderPhoneVariations.push(cleanPhone)
        senderPhoneVariations.push(cleanPhone.substring(1))
        senderPhoneVariations.push('254' + cleanPhone.substring(1))
        senderPhoneVariations.push('+254' + cleanPhone.substring(1))
      }
      
      for (const phoneVar of senderPhoneVariations) {
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .eq('isp_company_id', ispCompany.isp_company_id)
          .or(`phone.eq.${phoneVar},mpesa_number.eq.${phoneVar}`)
        
        if (clients && clients.length > 0) {
          client = clients[0]
          console.log('Client found by sender phone:', phoneVar, 'Client:', client.name)
          break
        }
      }
    }

    if (!client) {
      console.error('Client not found for account reference:', accountReference, 'or phone:', phoneNumber, 'in ISP:', ispCompany.isp_companies.name)
      
      // Log the payment attempt for manual processing
      await supabase
        .from('wallet_transactions')
        .insert({
          client_id: null,
          transaction_type: 'credit_pending',
          amount: amount,
          description: `Unmatched payment - Account: ${accountReference}, Phone: ${phoneNumber}, Name: ${FirstName} ${LastName}`,
          reference_number: mpesaReceiptNumber,
          mpesa_receipt_number: mpesaReceiptNumber,
          isp_company_id: ispCompany.isp_company_id
        })
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client not found',
          message: 'Payment logged for manual processing',
          details: { 
            accountReference, 
            phoneNumber, 
            customerName: `${FirstName} ${LastName}`,
            ispCompany: ispCompany.isp_companies.name,
            amount
          }
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing payment for client:', client.name, 'in ISP:', ispCompany.isp_companies.name)

    // Process the payment using the enhanced payment processor
    const { data: processResult, error: processError } = await supabase.functions.invoke('process-payment', {
      body: {
        checkoutRequestId: mpesaReceiptNumber,
        clientId: client.id,
        amount: amount,
        paymentMethod: 'mpesa',
        mpesaReceiptNumber: mpesaReceiptNumber,
        phoneNumber: phoneNumber,
        ispCompanyId: ispCompany.isp_company_id
      }
    })

    if (processError) {
      console.error('Error processing M-Pesa payment:', processError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to process payment',
          details: processError
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('M-Pesa payment processed successfully:', processResult)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment processed successfully',
        data: {
          ...processResult,
          isp_company: ispCompany.isp_companies.name,
          client_name: client.name
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('M-Pesa callback processing error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Callback processing failed',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
