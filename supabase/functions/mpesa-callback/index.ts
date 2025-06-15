
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
  InvoiceNumber: string;
  OrgAccountBalance: string;
  ThirdPartyTransID: string;
  MSISDN: string;
  FirstName: string;
  MiddleName: string;
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
    console.log('M-Pesa callback data:', callbackData)

    // Extract payment details
    const {
      TransID,
      TransAmount,
      MSISDN,
      FirstName,
      LastName,
      BillRefNumber,
      TransTime
    } = callbackData

    const amount = parseFloat(TransAmount)
    const phoneNumber = MSISDN
    const mpesaReceiptNumber = TransID
    const customerName = `${FirstName} ${LastName}`.trim()
    const accountReference = BillRefNumber // This should be the client's ID number

    console.log(`Payment received: ${amount} from ${phoneNumber} (${customerName})`)
    console.log(`Account reference: ${accountReference}`)

    // Find client by ID number (account reference)
    let client = null
    
    if (accountReference) {
      const { data: clientByIdNumber } = await supabase
        .from('clients')
        .select('*')
        .eq('id_number', accountReference)
        .single()

      if (clientByIdNumber) {
        client = clientByIdNumber
        console.log('Client found by ID number:', client.name)
        
        // Update M-Pesa number if not set or different
        if (!client.mpesa_number || client.mpesa_number !== phoneNumber) {
          await supabase
            .from('clients')
            .update({ mpesa_number: phoneNumber })
            .eq('id', client.id)
          console.log('Updated M-Pesa number for client:', client.name)
        }
      }
    }

    // Fallback: try to find by phone number if ID number lookup failed
    if (!client) {
      console.log('Client not found by ID number, trying phone number...')
      
      const { data: clientByPhone } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', phoneNumber)
        .single()

      if (clientByPhone) {
        client = clientByPhone
        console.log('Client found by phone number (fallback):', client.name)
      } else {
        // Try M-Pesa number as well
        const { data: clientByMpesa } = await supabase
          .from('clients')
          .select('*')
          .eq('mpesa_number', phoneNumber)
          .single()

        if (clientByMpesa) {
          client = clientByMpesa
          console.log('Client found by M-Pesa number (fallback):', client.name)
        }
      }
    }

    if (!client) {
      console.error('No client found for account reference or phone number:', accountReference, phoneNumber)
      
      // Log unmatched payment for manual review
      await supabase
        .from('wallet_transactions')
        .insert({
          transaction_type: 'credit',
          amount: amount,
          description: `Unmatched M-Pesa payment - Account: ${accountReference || 'N/A'}, Phone: ${phoneNumber}, Name: ${customerName}`,
          reference_number: BillRefNumber || TransID,
          mpesa_receipt_number: mpesaReceiptNumber,
          isp_company_id: null // Will need manual assignment
        })

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Client not found for this account reference or phone number',
          account_reference: accountReference,
          phone_number: phoneNumber
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Credit the client's wallet
    console.log('Crediting wallet for client:', client.name, 'Amount:', amount)
    
    const { data: creditResult, error: creditError } = await supabase.functions.invoke('wallet-credit', {
      body: {
        client_id: client.id,
        amount: amount,
        payment_method: 'mpesa',
        reference_number: BillRefNumber || TransID,
        mpesa_receipt_number: mpesaReceiptNumber,
        description: `Direct M-Pesa payment - Account: ${accountReference || client.id_number}, Phone: ${phoneNumber}`
      }
    })

    if (creditError) {
      console.error('Error crediting wallet:', creditError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to credit wallet',
          details: creditError
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Wallet credited successfully:', creditResult)

    // Send payment confirmation notification
    try {
      await supabase.functions.invoke('send-notifications', {
        body: {
          client_id: client.id,
          type: 'payment_success',
          data: {
            amount: amount,
            receipt_number: mpesaReceiptNumber,
            payment_method: 'Direct M-Pesa Payment',
            account_reference: accountReference || client.id_number,
            new_balance: creditResult?.data?.new_balance,
            auto_renewed: creditResult?.data?.auto_renewed
          }
        }
      })
      console.log('Payment confirmation notification sent')
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError)
    }

    // Return success response to M-Pesa
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment processed successfully',
        client_name: client.name,
        amount_credited: amount,
        account_reference: accountReference || client.id_number,
        new_balance: creditResult?.data?.new_balance
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
