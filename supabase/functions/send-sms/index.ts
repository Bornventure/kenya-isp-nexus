import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message, gateway = 'celcomafrica' } = await req.json();

    let response;
    
    if (gateway === 'celcomafrica') {
      // Use Celcomafrica SMS gateway
      console.log('Sending SMS via Celcomafrica:', { phone, message });

      // Format phone number (ensure it starts with 254)
      let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
        formattedPhone = '254' + formattedPhone;
      }

      // Prepare SMS payload
      const smsPayload = {
        apikey: '3230abd57d39aa89fc407618f3faaacc',
        partnerID: '800',
        message: message,
        shortcode: 'LAKELINK',
        mobile: formattedPhone
      };

      console.log('SMS payload:', smsPayload);

      const celcomafricaResponse = await fetch('https://isms.celcomafrica.com/api/services/sendsms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsPayload),
      });

      const result = await celcomafricaResponse.json();
      console.log('Celcomafrica API response:', result);

      // Check if SMS was sent successfully
      if (result.success || result.status === 'success' || celcomafricaResponse.ok) {
        response = {
          success: true,
          message: 'SMS sent successfully',
          messageId: result.messageId || result.id || `sms_${Date.now()}`,
          response: result
        };
      } else {
        throw new Error(result.message || 'Failed to send SMS');
      }
    } else {
      // Fallback to AfricasTalking for testing
      const africasTalkingResponse = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': Deno.env.get('AFRICASTALKING_API_KEY') || '',
        },
        body: new URLSearchParams({
          username: Deno.env.get('AFRICASTALKING_USERNAME') || '',
          to: phone,
          message: message,
          from: Deno.env.get('AFRICASTALKING_SENDER_ID') || '',
        }),
      });

      if (!africasTalkingResponse.ok) {
        throw new Error(`AfricasTalking API error: ${africasTalkingResponse.statusText}`);
      }

      response = await africasTalkingResponse.json();
    }

    console.log('SMS sent successfully via', gateway, ':', response);

    return new Response(
      JSON.stringify({ success: true, response }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error sending SMS:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});