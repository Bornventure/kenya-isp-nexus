
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

    const requestBody = await req.json()
    
    // Handle EC2 callback format for client status
    const { 
      client_id, 
      router_id,
      status,
      action,
      sync_status, 
      connection_status,
      error_message,
      timestamp
    } = requestBody
    
    console.log('Processing EC2 callback:', requestBody)
    
    let actualClientId = client_id
    let actualRouterId = router_id
    let actualStatus = status
    let actualAction = action
    let actualSyncStatus = sync_status
    let actualConnectionStatus = connection_status
    let actualErrorMessage = error_message

    // Validate UUID format for client_id and router_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    
    if (actualClientId && (actualClientId === 'uuid' || !uuidRegex.test(actualClientId))) {
      console.warn(`Invalid client_id format: ${actualClientId}. Skipping client operations.`)
      actualClientId = null
    }
    
    if (actualRouterId && (actualRouterId === 'uuid' || !uuidRegex.test(actualRouterId))) {
      console.warn(`Invalid router_id format: ${actualRouterId}. Skipping router operations.`)
      actualRouterId = null
    }

    console.log('Processing sync callback:', { 
      client_id: actualClientId, 
      router_id: actualRouterId, 
      sync_status: actualSyncStatus, 
      error_message: actualErrorMessage 
    })

    // Handle router status updates from EC2
    if (actualRouterId) {
      const routerUpdateData = {
        connection_status: actualConnectionStatus || (actualSyncStatus === 'synced' ? 'connected' : 'configuration_failed'),
        sync_status: actualSyncStatus || 'synced',
        last_sync_at: timestamp || new Date().toISOString(),
        last_error: actualErrorMessage,
        last_test_results: JSON.stringify({ 
          message: actualErrorMessage || 'RADIUS configuration completed successfully',
          timestamp: timestamp || new Date().toISOString()
        }),
        updated_at: new Date().toISOString()
      }

      const { error: routerError } = await supabaseClient
        .from('mikrotik_routers')
        .update(routerUpdateData)
        .eq('id', actualRouterId)

      if (routerError) {
        console.error('Error updating router status:', routerError)
        throw routerError
      }

      console.log('Successfully updated router status:', actualRouterId, 'to', routerUpdateData.connection_status)
    }

    // Handle client status updates from EC2
    if (actualClientId) {
      console.log(`Processing EC2 callback for client ${actualClientId}: ${actualAction} (${actualStatus})`)

      // Update client based on EC2 callback
      const updateData: any = {
        radius_sync_status: actualSyncStatus || 'synced',
        last_sync_at: timestamp || new Date().toISOString(),
        radius_status: actualStatus || 'active',
        last_error: actualErrorMessage
      }

      // Update client status based on action
      if (actualAction === 'disconnect' || actualStatus === 'inactive') {
        updateData.status = 'suspended'
        updateData.radius_status = 'suspended'
      } else if (actualAction === 'connect' || actualStatus === 'active') {
        updateData.status = 'active'
        updateData.radius_status = 'active'
        updateData.disconnection_scheduled_at = null
      }

      const { error: updateError } = await supabaseClient
        .from('clients')
        .update(updateData)
        .eq('id', actualClientId)

      if (updateError) {
        throw updateError
      }

      // Update radius_users table
      await supabaseClient
        .from('radius_users')
        .update({
          last_synced_to_radius: timestamp || new Date().toISOString(),
          is_active: actualStatus === 'active'
        })
        .eq('client_id', actualClientId)

      // Insert event into radius_events table
      const { data: clientData } = await supabaseClient
        .from('clients')
        .select('isp_company_id')
        .eq('id', actualClientId)
        .single()

      if (clientData) {
        await supabaseClient
          .from('radius_events')
          .insert({
            username: `client_${actualClientId}`,
            client_id: actualClientId,
            action: actualAction || 'sync',
            success: !actualErrorMessage,
            error: actualErrorMessage,
            isp_company_id: clientData.isp_company_id,
            timestamp: timestamp || new Date().toISOString()
          })
      }

      // Log the callback event
      await supabaseClient
        .from('audit_logs')
        .insert({
          resource: 'radius_callback',
          action: `callback_${actualAction}`,
          resource_id: actualClientId,
          changes: {
            status: actualStatus,
            action: actualAction,
            sync_status: actualSyncStatus,
            error_message: actualErrorMessage,
            timestamp: timestamp || new Date().toISOString()
          },
          user_id: null, // System action
          success: !actualErrorMessage,
          error_message: actualErrorMessage
        })

      console.log(`Successfully processed callback for client ${actualClientId}`)
    }

    // Get comprehensive router details if router_id is provided
    let routerDetails = null
    let authenticatedUsers = []
    let radiusServerInfo = null

    if (actualRouterId) {
      // Get detailed router information
      const { data: router } = await supabaseClient
        .from('mikrotik_routers')
        .select(`
          *,
          isp_companies(name)
        `)
        .eq('id', actualRouterId)
        .single()

      routerDetails = router

      // Get RADIUS server configuration for this router
      const { data: radiusServers } = await supabaseClient
        .from('radius_servers')
        .select('*')
        .eq('router_id', actualRouterId)

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
          client_id: actualClientId,
          router_id: actualRouterId,
          sync_status: actualSyncStatus,
          last_synced: actualClientId ? updateData?.last_radius_sync_at : new Date().toISOString(),
          client_info: actualClientId ? updatedClient : null,
          router_details: routerDetails,
          radius_servers: radiusServerInfo,
          authenticated_users: authenticatedUsers,
          connection_summary: {
            total_active_users: authenticatedUsers.length,
            router_status: routerDetails?.connection_status,
            router_ip: routerDetails?.ip_address,
            last_updated: new Date().toISOString(),
            sync_details: {
              ec2_instance_id: actualEc2InstanceId,
              mikrotik_router_id: actualMikrotikRouterId,
              radius_config: actualRadiusConfig ? 'provided' : 'not_provided'
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
