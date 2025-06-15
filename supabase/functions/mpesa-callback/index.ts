
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

    const {
      TransID,
      TransAmount,
      MSISDN,
      FirstName,
      LastName,
      BillRefNumber,
    } = callbackData

    const amount = parseFloat(TransAmount)
    const phoneNumber = MSISDN
    const mpesaReceiptNumber = TransID
    const accountReference = BillRefNumber

    console.log(`M-Pesa payment received: ${amount} from ${phoneNumber}`)

    // Process the payment using the comprehensive payment processor
    const { data: processResult, error: processError } = await supabase.functions.invoke('process-payment', {
      body: {
        checkoutRequestId: TransID,
        clientIdNumber: accountReference,
        amount: amount,
        paymentMethod: 'mpesa',
        mpesaReceiptNumber: mpesaReceiptNumber,
        phoneNumber: phoneNumber
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
        data: processResult
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
