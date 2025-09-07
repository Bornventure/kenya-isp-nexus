import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestMessageRequest {
  paymentMethod: 'mpesa' | 'family_bank';
  amount: number;
  message: string;
  phoneNumber: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-TEST-MESSAGE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user is super admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) throw new Error(`Profile error: ${profileError.message}`);
    if (profile.role !== 'super_admin') {
      throw new Error("Access denied: Super admin role required");
    }

    logStep("Super admin access verified", { userId: user.id });

    const { paymentMethod, amount, message, phoneNumber }: TestMessageRequest = await req.json();

    logStep("Test parameters received", { 
      paymentMethod, 
      amount, 
      phoneNumber: phoneNumber.substring(0, 6) + 'XXX' // Mask phone for security
    });

    // Format the test message with payment context
    const formattedMessage = `[TEST] ${paymentMethod.toUpperCase()} Payment Test - Amount: KES ${amount} - ${message}`;

    let testResult;

    if (paymentMethod === 'mpesa') {
      // Test M-Pesa message sending
      logStep("Testing M-Pesa message sending");
      
      const { data: mpesaData, error: mpesaError } = await supabaseClient.functions.invoke('send-sms', {
        body: {
          phone: phoneNumber,
          message: formattedMessage
        }
      });

      if (mpesaError) throw new Error(`M-Pesa SMS test failed: ${mpesaError.message}`);
      
      testResult = {
        success: true,
        provider: 'M-Pesa SMS',
        response: mpesaData,
        sentMessage: formattedMessage,
        phoneNumber: phoneNumber
      };

    } else if (paymentMethod === 'family_bank') {
      // Test Family Bank message sending
      logStep("Testing Family Bank message sending");
      
      const { data: familyBankData, error: familyBankError } = await supabaseClient.functions.invoke('send-sms', {
        body: {
          phone: phoneNumber,
          message: formattedMessage
        }
      });

      if (familyBankError) throw new Error(`Family Bank SMS test failed: ${familyBankError.message}`);
      
      testResult = {
        success: true,
        provider: 'Family Bank SMS',
        response: familyBankData,
        sentMessage: formattedMessage,
        phoneNumber: phoneNumber
      };

    } else {
      throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    logStep("Test message sent successfully", { provider: testResult.provider });

    return new Response(JSON.stringify({
      success: true,
      message: `Test message sent successfully via ${testResult.provider}`,
      data: testResult
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR in send-test-message", { message: error.message });
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});