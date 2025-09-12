import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get OAuth2 access token from Family Bank
async function getAccessToken(config: any): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const tokenResponse = await fetch(config.token_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'client_id': config.client_id,
        'client_secret': config.client_secret,
        'grant_type': 'client_credentials',
        'scope': 'ESB_REST_API'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return {
        success: false,
        error: `Token request failed: ${tokenResponse.status} - ${errorText}`
      };
    }

    const tokenData = await tokenResponse.json();
    return {
      success: true,
      token: tokenData.access_token
    };
  } catch (error) {
    return {
      success: false,
      error: `Token request error: ${error.message}`
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[FAMILY-BANK-VALIDATION] Validating Family Bank configuration...");

    // Get the user's company ID from the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No authorization header provided'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user profile to find company ID
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid authorization token'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('isp_company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.isp_company_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No company ID found for user'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get Family Bank settings for this company
    const { data: settings, error: settingsError } = await supabase
      .from('family_bank_settings')
      .select('*')
      .eq('isp_company_id', profile.isp_company_id)
      .eq('is_active', true)
      .maybeSingle();

    if (settingsError) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Error fetching Family Bank settings',
        details: settingsError
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!settings) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No active Family Bank settings found. Please configure Family Bank settings first.'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate required configuration
    const requiredFields = ['client_id', 'client_secret', 'merchant_code', 'token_url', 'stk_url'];
    const missingFields = requiredFields.filter(field => !settings[field]);

    if (missingFields.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Missing required configuration: ${missingFields.join(', ')}`,
        missing_fields: missingFields
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Test the Family Bank API connection
    console.log("[FAMILY-BANK-VALIDATION] Testing API connection...");
    
    const tokenResult = await getAccessToken(settings);
    
    if (!tokenResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to authenticate with Family Bank API',
        details: tokenResult.error,
        configuration_status: 'invalid_credentials'
      }), {
        status: 200, // Return 200 so the client can handle this gracefully
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate callback URLs
    const expectedCallbackUrls = {
      stk_callback: `${supabaseUrl}/functions/v1/family-bank-stk-callback`,
      c2b_callback: `${supabaseUrl}/functions/v1/family-bank-c2b-callback`
    };

    console.log("[FAMILY-BANK-VALIDATION] Family Bank configuration validated successfully");

    return new Response(JSON.stringify({
      success: true,
      message: "Family Bank configuration is valid and API is accessible",
      configuration: {
        merchant_code: settings.merchant_code,
        paybill_number: settings.paybill_number,
        token_url: settings.token_url,
        stk_url: settings.stk_url,
        is_active: settings.is_active
      },
      callback_urls: expectedCallbackUrls,
      api_status: 'connected'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.log("[FAMILY-BANK-VALIDATION] ERROR:", error.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: "Validation failed",
      details: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});