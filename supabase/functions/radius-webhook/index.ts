import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map client status to proper group names
function getGroupNameFromStatus(status: string, servicePackage?: any): string {
  if (status === 'suspended') return 'suspended'
  
  // Use service package groupname if available, otherwise fallback to bronze
  return servicePackage?.groupname || 'bronze'
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

    const { record, table_name, action } = await req.json()

    console.log('Processing optimized radius webhook for table:', table_name, 'action:', action)

    // Skip processing for irrelevant changes
    if (!record || !table_name) {
      return new Response(JSON.stringify({ status: 'skipped', reason: 'missing data' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let webhookData
    if (table_name === 'mikrotik_routers') {
      // Handle MikroTik router data - map to EC2 format
      webhookData = {
        type: "router",
        action: action || "router_connect", 
        router_id: record.id,
        ip_address: record.ip_address,
        secret: record.radius_secret || "RouterSQLSecret123",
        coa_secret: record.coa_secret || "CoASecret123",
        client_id: record.isp_company_id // Use company ID as client reference
      }
    } else if (table_name === 'clients') {
      // Get client with service package details
      const { data: clientData } = await supabaseClient
        .from('clients')
        .select(`
          *,
          service_packages (
            name,
            download_speed,
            upload_speed,
            groupname
          )
        `)
        .eq('id', record.id)
        .single()
      
      if (!clientData) {
        throw new Error('Client not found')
      }

      // Determine action based on status or explicit action
      let clientAction = action || "client_connect"
      if (record.status === 'suspended') {
        clientAction = "client_suspend"
      } else if (record.status === 'active') {
        clientAction = "client_connect"
      }

      // Handle client data - map to EC2 format
      webhookData = {
        type: "client",
        action: clientAction,
        client_id: record.id,
        username: record.radius_username || record.phone || record.email,
        password: record.radius_password || 'default_password',
        groupname: getGroupNameFromStatus(record.status, clientData.service_packages),
        download_speed_kbps: clientData.service_packages?.download_speed ? clientData.service_packages.download_speed * 1024 : 2048,
        upload_speed_kbps: clientData.service_packages?.upload_speed ? clientData.service_packages.upload_speed * 1024 : 1024,
        full_name: record.name,
        service_plan: clientData.service_packages?.name || "Default Plan"
      }
    } else {
      throw new Error(`Unsupported table: ${table_name}`)
    }

    // Send to EC2 RADIUS API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
    
    let res, responseText
    try {
      res = await fetch("https://radius.lakelink.co.ke/radius-webhook", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 7be15e5c7e40e658bac7ff64eab3bae6841b5f3224939b088f14635e67769984",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
        signal: controller.signal
      })
      responseText = await res.text()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        console.warn('EC2 RADIUS API request timed out')
        responseText = 'Request timed out'
        res = { ok: false, status: 408 }
      } else {
        throw error
      }
    }
    clearTimeout(timeoutId)

    console.log('EC2 RADIUS API response:', responseText)

    // Only log significant events to audit logs (not every webhook call)
    if (!res.ok || ['INSERT', 'DELETE'].includes(action)) {
      await supabaseClient
        .from('audit_logs')
        .insert({
          resource: 'radius_webhook',
          action: `webhook_${webhookData.action}`,
          resource_id: webhookData.client_id || webhookData.router_id,
          changes: webhookData,
          user_id: null, // System action
          success: res.ok,
          error_message: res.ok ? null : responseText
        })
    }

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