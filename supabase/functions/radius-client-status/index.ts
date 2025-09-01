
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

    const { company_id } = await req.json()

    if (!company_id) {
      throw new Error('company_id is required')
    }

    console.log('Fetching RADIUS client status for company:', company_id)

    // Get all clients with RADIUS credentials and their current status
    const { data: clients, error: clientsError } = await supabaseClient
      .from('clients')
      .select(`
        id,
        name,
        phone,
        email,
        status,
        radius_username,
        radius_password,
        radius_sync_status,
        last_radius_sync_at,
        disconnection_scheduled_at,
        subscription_end_date,
        wallet_balance,
        monthly_rate,
        service_packages (
          name,
          download_speed,
          upload_speed,
          session_timeout,
          idle_timeout
        )
      `)
      .eq('isp_company_id', company_id)
      .not('radius_username', 'is', null)

    if (clientsError) throw clientsError

    // Get RADIUS users data
    const { data: radiusUsers, error: radiusError } = await supabaseClient
      .from('radius_users')
      .select('*')
      .eq('isp_company_id', company_id)

    if (radiusError) throw radiusError

    // Combine data for comprehensive client status
    const clientStatus = clients.map(client => {
      const radiusUser = radiusUsers.find(ru => ru.client_id === client.id)
      
      return {
        client_id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        status: client.status,
        
        // RADIUS credentials
        username: client.radius_username,
        password: client.radius_password,
        bandwidth_profile: radiusUser?.bandwidth_profile || 'default',
        
        // Bandwidth limits from service package
        download_speed_kbps: client.service_packages?.download_speed ? client.service_packages.download_speed * 1024 : 5120,
        upload_speed_kbps: client.service_packages?.upload_speed ? client.service_packages.upload_speed * 1024 : 512,
        session_timeout: client.service_packages?.session_timeout || 86400,
        idle_timeout: client.service_packages?.idle_timeout || 1800,
        
        // Sync status
        sync_status: client.radius_sync_status,
        last_synced: client.last_radius_sync_at,
        needs_sync: client.radius_sync_status === 'pending',
        
        // Billing info
        subscription_end_date: client.subscription_end_date,
        wallet_balance: client.wallet_balance,
        monthly_rate: client.monthly_rate,
        scheduled_for_disconnection: !!client.disconnection_scheduled_at,
        
        // Action required
        action: client.status === 'active' ? 'ensure_connected' : 'disconnect',
        
        last_updated: new Date().toISOString()
      }
    })

    console.log(`Retrieved status for ${clientStatus.length} RADIUS clients`)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          clients: clientStatus,
          total_clients: clientStatus.length,
          pending_sync: clientStatus.filter(c => c.needs_sync).length,
          active_clients: clientStatus.filter(c => c.status === 'active').length,
          suspended_clients: clientStatus.filter(c => c.status === 'suspended').length,
          last_updated: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error fetching RADIUS client status:', error)
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
