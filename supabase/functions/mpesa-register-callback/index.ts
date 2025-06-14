
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== M-Pesa Callback Registration ===')

    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')!
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')!
    const shortcode = Deno.env.get('MPESA_SHORTCODE') || '174379'

    // Get OAuth token
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      throw new Error('Failed to get access token')
    }

    console.log('Got access token successfully')

    // Register callback URLs
    const callbackUrl = 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/mpesa-callback'
    const validationUrl = callbackUrl // Same endpoint can handle both
    const confirmationUrl = callbackUrl

    const registerResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ShortCode: shortcode,
        ResponseType: 'Completed', // or 'Cancelled'
        ConfirmationURL: confirmationUrl,
        ValidationURL: validationUrl,
      }),
    })

    const registerData = await registerResponse.json()
    console.log('M-Pesa callback registration response:', registerData)

    if (registerData.ResponseCode === '0') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Callback URLs registered successfully',
          response: registerData,
          callback_url: callbackUrl
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      throw new Error(`Registration failed: ${registerData.ResponseDescription}`)
    }

  } catch (error) {
    console.error('M-Pesa callback registration error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Callback registration failed',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
