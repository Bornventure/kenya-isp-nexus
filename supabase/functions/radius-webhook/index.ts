import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()

    console.log('Processing radius webhook for record:', record)

    const res = await fetch("https://radius.lakelink.co.ke/radius-webhook", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 7be15e5c7e40e658bac7ff64eab3bae6841b5f3224939b088f14635e67769984",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: record.id,
        username: record.username,
        password: record.password,
        action: "connect",
      }),
    })

    const responseText = await res.text()
    console.log('Radius API response:', responseText)

    return new Response(responseText, { 
      status: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in radius-webhook function:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})