
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== Family Bank C2B Callback Received ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log("Family Bank C2B Callback RECEIVED:", JSON.stringify(body, null, 2));

    // Extract key fields from the callback
    const resultCode = body.ResultCode;
    const resultDesc = body.ResultDesc;
    const transactionType = body.TransactionType;
    const transID = body.TransID;
    const transTime = body.TransTime;
    const transAmount = parseFloat(body.TransAmount || 0);
    const businessShortCode = body.BusinessShortCode;
    const billRefNumber = body.BillRefNumber;
    const invoiceNumber = body.InvoiceNumber;
    const orgAccountBalance = body.OrgAccountBalance ? parseFloat(body.OrgAccountBalance) : null;
    const msisdn = body.MSISDN;
    const kycName = body.KYCName;
    const checkoutRequestId = body.CheckoutRequestID;

    console.log('Extracted callback data:', {
      resultCode,
      resultDesc,
      transID,
      transAmount,
      msisdn,
      checkoutRequestId
    });

    // Store the C2B payment callback in database for audit trail
    const { error: insertError } = await supabase
      .from('family_bank_payments')
      .insert({
        trans_id: transID,
        trans_time: transTime,
        transaction_type: transactionType,
        trans_amount: transAmount,
        business_shortcode: businessShortCode,
        bill_ref_number: billRefNumber,
        invoice_number: invoiceNumber,
        org_account_balance: orgAccountBalance,
        third_party_trans_id: checkoutRequestId,
        msisdn: msisdn,
        kyc_info: kycName,
        callback_raw: body,
        status: resultCode === '0' ? 'completed' : 'failed'
      });

    if (insertError) {
      console.error('Error storing Family Bank payment:', insertError);
    } else {
      console.log('Family Bank payment callback stored successfully');
    }

    // Process successful payments
    if (resultCode === '0' && transAmount > 0) {
      console.log('Processing successful payment of KES', transAmount);
      
      // Try to find matching client by phone number
      let client = null;
      
      // Clean phone number for search
      let cleanPhone = msisdn.toString();
      if (cleanPhone.startsWith('254')) {
        cleanPhone = '0' + cleanPhone.substring(3);
      }

      console.log('Searching for client with phone:', cleanPhone, 'or', msisdn);

      const { data: clients } = await supabase
        .from('clients')
        .select('id, isp_company_id, name, wallet_balance, monthly_rate')
        .or(`phone.eq.${cleanPhone},phone.eq.${msisdn},mpesa_number.eq.${msisdn}`)
        .limit(1);

      if (clients && clients.length > 0) {
        client = clients[0];
        console.log('Found matching client:', client.name, 'ID:', client.id);

        // Process payment through the payment processor
        try {
          const { data: processResult, error: processError } = await supabase.functions.invoke('process-payment', {
            body: {
              checkoutRequestId: checkoutRequestId,
              clientId: client.id,
              amount: transAmount,
              paymentMethod: 'family_bank',
              familyBankReceiptNumber: transID,
              phoneNumber: msisdn
            }
          });

          if (processError) {
            console.error('Error processing payment:', processError);
          } else if (processResult?.success) {
            console.log('Payment processed successfully:', processResult);
          } else {
            console.log('Payment processing completed with warnings:', processResult);
          }
        } catch (processError) {
          console.error('Exception during payment processing:', processError);
        }
      } else {
        console.log('No matching client found for phone number:', msisdn);
      }
    } else if (resultCode !== '0') {
      console.log('Payment failed or cancelled. ResultCode:', resultCode, 'Description:', resultDesc);
    } else {
      console.log('Zero amount transaction, skipping payment processing');
    }

    // Return success acknowledgment to Family Bank
    const acknowledgment = {
      "ResultCode": "0",
      "ResultDesc": "Success. Transaction received and processed",
      "TransactionID": transID,
      "ConversationID": checkoutRequestId,
      "OriginatorConversationID": invoiceNumber
    };

    console.log('Sending acknowledgment to Family Bank:', acknowledgment);

    return new Response(
      JSON.stringify(acknowledgment),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Family Bank C2B callback processing error:', error);
    
    // Return error acknowledgment
    const errorAck = {
      "ResultCode": "1",
      "ResultDesc": "Error processing transaction: " + error.message
    };

    return new Response(
      JSON.stringify(errorAck),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
