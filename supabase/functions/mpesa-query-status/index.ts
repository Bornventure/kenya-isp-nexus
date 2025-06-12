
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueryRequest {
  checkoutRequestID: string;
}

interface MpesaTokenResponse {
  access_token: string;
  expires_in: string;
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checkoutRequestID }: QueryRequest = await req.json();

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

    // Query request payload
    const queryPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };

    // Make query request
    const queryResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryPayload),
    });

    if (!queryResponse.ok) {
      throw new Error("Query request failed");
    }

    const queryData = await queryResponse.json();

    console.log("Query response:", queryData);

    return new Response(JSON.stringify(queryData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in mpesa-query-status function:", error);
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
