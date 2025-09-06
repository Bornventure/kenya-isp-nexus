
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

    const { 
      client_id, 
      router_id,
      sync_status, 
      error_message, 
      sync_details,
      ec2_instance_id,
      mikrotik_router_id,
      radius_config 
    } = await req.json()

    console.log('Processing sync callback:', { client_id, router_id, sync_status, error_message })

    // Handle router status updates
    if (router_id) {
      const routerUpdateData = {
        connection_status: sync_status === 'synced' ? 'connected' : 'configuration_failed',
        last_test_results: radius_config ? 
          JSON.stringify({ 
            message: error_message || 'RADIUS configuration completed successfully',
            config: radius_config,
            timestamp: new Date().toISOString()
          }) : 
          JSON.stringify({ 
            message: error_message || 'RADIUS configuration completed successfully',
            timestamp: new Date().toISOString()
          }),
        updated_at: new Date().toISOString()
      }

      const { error: routerError } = await supabaseClient
        .from('mikrotik_routers')
        .update(routerUpdateData)
        .eq('id', router_id)

      if (routerError) {
        console.error('Error updating router status:', routerError)
        throw routerError
      }

      console.log('Successfully updated router status:', router_id, 'to', routerUpdateData.connection_status)
    }

    // Handle client status updates
    if (!client_id && !router_id) {
      throw new Error('Either client_id or router_id is required')
    }

    if (client_id) {
      console.log(`Processing sync callback for client ${client_id}: ${sync_status}`)

      // Update client sync status
      const updateData: any = {
        radius_sync_status: sync_status, // 'synced', 'failed', 'pending'
        last_radius_sync_at: new Date().toISOString()
      }

      // Clear disconnection schedule if successfully synced and active
      if (sync_status === 'synced') {
        updateData.disconnection_scheduled_at = null
      }

      const { error: updateError } = await supabaseClient
        .from('clients')
        .update(updateData)
        .eq('id', client_id)

      if (updateError) {
        throw updateError
      }

      // Update radius_users table
      await supabaseClient
        .from('radius_users')
        .update({
          last_synced_to_radius: new Date().toISOString(),
          is_active: sync_status === 'synced'
        })
        .eq('client_id', client_id)

      // Log the sync result
      await supabaseClient
        .from('audit_logs')
        .insert({
          resource: 'radius_sync',
          action: `sync_${sync_status}`,
          resource_id: client_id,
          changes: {
            sync_status,
            error_message,
            sync_details,
            ec2_instance_id,
            mikrotik_router_id,
            timestamp: new Date().toISOString()
          },
          user_id: null, // System action
          success: sync_status === 'synced',
          error_message: sync_status === 'failed' ? error_message : null
        })

      // If sync failed, optionally retry or alert
      if (sync_status === 'failed') {
        console.error(`RADIUS sync failed for client ${client_id}:`, error_message)
        
        // Could implement retry logic here or send alert
        // For now, just log it
      }

      // Get updated client data to return
      const { data: updatedClient } = await supabaseClient
        .from('clients')
        .select('id, name, radius_sync_status, last_radius_sync_at')
        .eq('id', client_id)
        .single()
    }

    // Get comprehensive router details if router_id is provided
    let routerDetails = null
    let authenticatedUsers = []
    let radiusServerInfo = null

    if (router_id) {
      // Get detailed router information
      const { data: router } = await supabaseClient
        .from('mikrotik_routers')
        .select(`
          *,
          isp_companies(name)
        `)
        .eq('id', router_id)
        .single()

      routerDetails = router

      // Get RADIUS server configuration for this router
      const { data: radiusServers } = await supabaseClient
        .from('radius_servers')
        .select('*')
        .eq('router_id', router_id)

      radiusServerInfo = radiusServers

      // Get authenticated users/clients connected to this router
      const { data: activeSessions } = await supabaseClient
        .from('active_sessions')
        .select(`
          *,
          clients(id, name, email, phone, status)
        `)
        .eq('nas_ip_address', router?.ip_address)

      authenticatedUsers = activeSessions || []

      // Get RADIUS users associated with this router's network
      const { data: radiusUsers } = await supabaseClient
        .from('radius_users')
        .select(`
          *,
          clients(id, name, email, phone, status, monthly_rate)
        `)
        .eq('isp_company_id', router?.isp_company_id)
        .eq('is_active', true)

      // Combine session data with user data for comprehensive view
      const userSummary = radiusUsers?.map(user => ({
        ...user,
        has_active_session: activeSessions?.some(session => 
          session.username === user.username
        ) || false,
        session_details: activeSessions?.find(session => 
          session.username === user.username
        )
      })) || []

      authenticatedUsers = userSummary
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sync callback processed successfully`,
        data: {
          client_id,
          router_id,
          sync_status,
          last_synced: client_id ? updateData?.last_radius_sync_at : new Date().toISOString(),
          client_info: client_id ? updatedClient : null,
          router_details: routerDetails,
          radius_servers: radiusServerInfo,
          authenticated_users: authenticatedUsers,
          connection_summary: {
            total_active_users: authenticatedUsers.length,
            router_status: routerDetails?.connection_status,
            router_ip: routerDetails?.ip_address,
            last_updated: new Date().toISOString(),
            sync_details: {
              ec2_instance_id,
              mikrotik_router_id,
              radius_config: radius_config ? 'provided' : 'not_provided'
            }
          }
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing sync callback:', error)
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
