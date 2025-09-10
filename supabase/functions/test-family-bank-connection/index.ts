import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[FAMILY-BANK-TEST] Testing Family Bank API connection...");
    
    const tokenUrl = Deno.env.get('FAMILY_BANK_TOKEN_URL') || "https://openbank.familybank.co.ke:8083/connect/token";
    const clientId = Deno.env.get('FAMILY_BANK_CLIENT_ID');
    const clientSecret = Deno.env.get('FAMILY_BANK_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Missing Family Bank credentials. Please configure FAMILY_BANK_CLIENT_ID and FAMILY_BANK_CLIENT_SECRET in Supabase secrets.');
    }

    console.log("[FAMILY-BANK-TEST] Making request to token endpoint...");
    
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        scope: "ESB_REST_API"
      }).toString()
    });

    console.log("[FAMILY-BANK-TEST] Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("[FAMILY-BANK-TEST] Error response:", errorText);
      throw new Error(`Token request failed: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json();
    console.log("[FAMILY-BANK-TEST] Token request successful");

    return new Response(JSON.stringify({
      success: true,
      message: "Family Bank API is online and accessible",
      status: response.status,
      hasAccessToken: !!tokenData.access_token
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.log("[FAMILY-BANK-TEST] ERROR:", error.message);
    
    return new Response(JSON.stringify({
      success: false,
      message: "Family Bank API appears to be offline or unreachable",
      error: error.message,
      isConnectionError: error.message.includes('Connection') || error.message.includes('timeout') || error.message.includes('network')
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 so the client can handle the error gracefully
    });
  }
});