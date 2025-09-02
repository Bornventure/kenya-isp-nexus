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
    const { record, table_name } = await req.json()

    console.log('Processing radius webhook for table:', table_name, 'record:', record)

    let webhookData
    if (table_name === 'mikrotik_routers') {
      // Handle MikroTik router data
      webhookData = {
        router_id: record.id,
        router_name: record.name,
        ip_address: record.ip_address,
        admin_username: record.admin_username,
        admin_password: record.admin_password,
        action: "router_connect",
        type: "router"
      }
    } else if (table_name === 'clients') {
      // Handle client data - check if client has radius credentials
      webhookData = {
        client_id: record.id,
        username: record.radius_username || record.phone || record.email,
        password: record.radius_password || 'default_password',
        client_name: record.name,
        phone: record.phone,
        email: record.email,
        action: "client_connect",
        type: "client"
      }
    } else {
      throw new Error(`Unsupported table: ${table_name}`)
    }

    const res = await fetch("https://radius.lakelink.co.ke/radius-webhook", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 7be15e5c7e40e658bac7ff64eab3bae6841b5f3224939b088f14635e67769984",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
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