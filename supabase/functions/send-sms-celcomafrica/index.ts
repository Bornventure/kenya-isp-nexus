
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSRequest {
  phone: string
  message: string
  client_id?: string
  type?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, message, client_id, type }: SMSRequest = await req.json()

    console.log('Sending SMS via Celcomafrica:', { phone, message, type })

    // Celcomafrica SMS API configuration
    const apiKey = Deno.env.get('CELCOMAFRICA_API_KEY') || '3230abd57d39aa89fc407618f3faaacc'
    const partnerId = Deno.env.get('CELCOMAFRICA_PARTNER_ID') || '800'
    const shortcode = Deno.env.get('CELCOMAFRICA_SHORTCODE') || 'LAKELINK'
    const apiUrl = 'https://isms.celcomafrica.com/api/services/sendsms'

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phone.replace(/\D/g, '') // Remove non-digits
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone
    }

    // Prepare SMS payload
    const smsPayload = {
      apikey: apiKey,
      partnerID: partnerId,
      message: message,
      shortcode: shortcode,
      mobile: formattedPhone
    }

    console.log('SMS payload:', smsPayload)

    // Send SMS via Celcomafrica API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smsPayload),
    })

    const result = await response.json()
    console.log('Celcomafrica API response:', result)

    // Check if SMS was sent successfully
    if (result.success || result.status === 'success' || response.ok) {
      console.log('SMS sent successfully')
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'SMS sent successfully',
          messageId: result.messageId || result.id,
          response: result
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('SMS sending failed:', result)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: result.message || 'Failed to send SMS',
          response: result
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error sending SMS:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
