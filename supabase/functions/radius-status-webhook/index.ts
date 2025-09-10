
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle EC2 CoA event callback
    const { username, action, success, error, timestamp } = await req.json()

    if (!username || !action) {
      throw new Error('username and action are required for CoA events')
    }

    console.log(`Processing CoA event for user ${username}: ${action} (success: ${success})`)

    // Get client by RADIUS username
    const { data: radiusUser, error: radiusUserError } = await supabaseClient
      .from('radius_users')
      .select(`
        *,
        clients (
          id,
          name,
          phone,
          email,
          status,
          isp_company_id
        )
      `)
      .eq('username', username)
      .single()

    if (radiusUserError || !radiusUser) {
      throw new Error('RADIUS user not found')
    }

    const client = radiusUser.clients

    // Log the CoA event
    const coaData = {
      username,
      action,
      success,
      error,
      timestamp: timestamp || new Date().toISOString(),
      client_id: client.id
    }

    // Update client status based on CoA action if it was successful
    if (success && action === 'disconnect') {
      await supabaseClient
        .from('clients')
        .update({ 
          status: 'suspended',
          disconnection_scheduled_at: null 
        })
        .eq('id', client.id)
    }

    // Log the CoA event
    await supabaseClient
      .from('audit_logs')
      .insert({
        resource: 'radius_coa',
        action: `coa_${action}`,
        resource_id: client.id,
        changes: coaData,
        user_id: null, // System action
        isp_company_id: client.isp_company_id,
        success: success,
        error_message: success ? null : error
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: `CoA event processed for ${action} action`,
        data: coaData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing RADIUS webhook:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
