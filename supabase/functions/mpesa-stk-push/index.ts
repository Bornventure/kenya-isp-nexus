import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  metadata?: {
    client_email?: string;
    client_id?: string;
    invoice_id?: string;
    currency?: string;
    description?: string;
  };
}

interface MpesaTokenResponse {
  access_token: string;
  expires_in: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

const getMpesaToken = async (): Promise<string> => {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
  
  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa credentials not configured");
  }

  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  
  const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    method: "GET",
    headers: {
      "Authorization": `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get M-Pesa token");
  }

  const data: MpesaTokenResponse = await response.json();
  return data.access_token;
};

const generateTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
};

const generatePassword = (shortcode: string, passkey: string, timestamp: string): string => {
  const data = shortcode + passkey + timestamp;
  return btoa(data);
};

const generateInvoiceNumber = (): string => {
  const timestamp = Date.now();
  return `INV-${timestamp}`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== M-Pesa STK Push Started ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestBody: STKPushRequest = await req.json();
    console.log('STK Push request:', requestBody);

    const { phoneNumber, amount, accountReference, transactionDesc, metadata } = requestBody;

    // Get M-Pesa configuration
    const shortcode = Deno.env.get("MPESA_SHORTCODE");
    const passkey = Deno.env.get("MPESA_PASSKEY");

    if (!shortcode || !passkey) {
      throw new Error("M-Pesa configuration not complete");
    }

    // Get access token
    const accessToken = await getMpesaToken();

    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generatePassword(shortcode, passkey, timestamp);

    // Format phone number (remove + and ensure it starts with 254)
    let formattedPhone = phoneNumber.replace(/\+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Find client by ID number or email
    let client_record = null;
    if (metadata?.client_id) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id_number', metadata.client_id)
        .single();
      
      if (clientData) {
        client_record = clientData;
      }
    }

    if (!client_record && metadata?.client_email) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('email', metadata.client_email)
        .single();
      
      if (clientData) {
        client_record = clientData;
      }
    }

    if (!client_record) {
      throw new Error("Client not found for wallet top-up");
    }

    // STK Push request payload
    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: "https://your-callback-url.com/mpesa/callback", // Replace with actual callback URL
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    console.log('Making STK Push request to M-Pesa...');

    // Make STK Push request
    const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPushPayload),
    });

    if (!stkResponse.ok) {
      throw new Error("STK Push request failed");
    }

    const stkData: STKPushResponse = await stkResponse.json();
    console.log("STK Push response:", stkData);

    // Check if STK Push was successful
    if (stkData.ResponseCode === '0') {
      console.log('STK Push successful, creating initial records...');

      // Generate invoice number
      const invoiceNumber = generateInvoiceNumber();
      const vatAmount = amount * 0.16; // 16% VAT
      const totalAmount = amount + vatAmount;

      // Create invoice for wallet top-up - PENDING until payment confirmed
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          client_id: client_record.id,
          amount: amount,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          status: 'pending', // Keep as pending until payment confirmed
          due_date: new Date().toISOString().split('T')[0], // Today
          service_period_start: new Date().toISOString().split('T')[0],
          service_period_end: new Date().toISOString().split('T')[0],
          notes: `Wallet top-up via M-Pesa - ${transactionDesc} (PENDING CONFIRMATION)`,
          isp_company_id: client_record.isp_company_id
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        throw new Error('Failed to create invoice');
      }

      console.log('Invoice created:', invoiceData);

      // Create initial payment record - PENDING until confirmed
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          client_id: client_record.id,
          invoice_id: invoiceData.id,
          amount: totalAmount, // Full amount including VAT
          payment_method: 'mpesa',
          payment_date: new Date().toISOString(),
          reference_number: stkData.CheckoutRequestID, // CRITICAL: Use CheckoutRequestID for verification
          mpesa_receipt_number: null, // Will be set when confirmed
          notes: JSON.stringify({
            checkout_request_id: stkData.CheckoutRequestID,
            merchant_request_id: stkData.MerchantRequestID,
            account_reference: accountReference,
            phone_number: formattedPhone,
            transaction_desc: transactionDesc,
            status: 'pending', // CRITICAL: Mark as pending until confirmed
            payment_type: 'wallet_topup',
            metadata: metadata,
            stk_push_response: stkData,
            initiated_at: new Date().toISOString()
          }),
          isp_company_id: client_record.isp_company_id
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Don't fail the request, just log the error
      } else {
        console.log('Payment record created (PENDING):', paymentData);
      }

      // DO NOT update wallet balance or create wallet transactions yet
      // These will be done by process-payment function when payment is confirmed
      console.log('STK Push initiated successfully. Awaiting payment confirmation...');
    }

    return new Response(JSON.stringify(stkData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in mpesa-stk-push function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
