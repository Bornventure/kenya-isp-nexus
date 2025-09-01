
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

    const { client_id, status, action, ec2_endpoint } = await req.json()

    if (!client_id || !status || !action) {
      throw new Error('client_id, status, and action are required')
    }

    console.log(`Processing webhook for client ${client_id}: ${action} (${status})`)

    // Get client details with RADIUS credentials
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select(`
        *,
        service_packages (
          name,
          download_speed,
          upload_speed,
          session_timeout,
          idle_timeout
        )
      `)
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
      throw new Error('Client not found')
    }

    // Prepare webhook data for EC2
    const webhookData = {
      client_id,
      username: client.radius_username,
      password: client.radius_password,
      status,
      action, // 'connect', 'disconnect', 'reconnect', 'update'
      
      // Bandwidth limits
      download_speed_kbps: client.service_packages?.download_speed ? client.service_packages.download_speed * 1024 : 5120,
      upload_speed_kbps: client.service_packages?.upload_speed ? client.service_packages.upload_speed * 1024 : 512,
      session_timeout: client.service_packages?.session_timeout || 86400,
      idle_timeout: client.service_packages?.idle_timeout || 1800,
      
      // Client info
      client_name: client.name,
      client_phone: client.phone,
      
      // Timestamps
      timestamp: new Date().toISOString(),
      priority: action === 'disconnect' ? 'high' : 'normal'
    }

    // Send webhook to EC2 endpoint if provided
    if (ec2_endpoint) {
      try {
        const webhookResponse = await fetch(ec2_endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('EC2_WEBHOOK_TOKEN') || 'default-token'}`
          },
          body: JSON.stringify(webhookData)
        })

        if (!webhookResponse.ok) {
          console.error('EC2 webhook failed:', await webhookResponse.text())
        } else {
          console.log('EC2 webhook sent successfully')
        }
      } catch (webhookError) {
        console.error('Error sending EC2 webhook:', webhookError)
      }
    }

    // Log the webhook event
    await supabaseClient
      .from('audit_logs')
      .insert({
        resource: 'radius_webhook',
        action: `webhook_${action}`,
        resource_id: client_id,
        changes: webhookData,
        user_id: null, // System action
        isp_company_id: client.isp_company_id,
        success: true
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: `Webhook processed for ${action} action`,
        data: webhookData
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
