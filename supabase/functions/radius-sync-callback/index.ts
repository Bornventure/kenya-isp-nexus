
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
    
    // Handle both old format and new EC2 format
    const { 
      client_id, 
      router_id,
      sync_status, 
      error_message, 
      sync_details,
      ec2_instance_id,
      mikrotik_router_id,
      radius_config,
      // New EC2 format
      data
    } = requestBody
    
    // Extract values from EC2 format if present
    const actualClientId = client_id || data?.client_id
    const actualRouterId = router_id || data?.router_id
    const actualSyncStatus = sync_status || data?.sync_status
    const actualErrorMessage = error_message || (data?.sync_status === 'failed' ? 'Sync failed' : null)
    const actualEc2InstanceId = ec2_instance_id || data?.connection_summary?.sync_details?.ec2_instance_id
    const actualMikrotikRouterId = mikrotik_router_id || data?.connection_summary?.sync_details?.mikrotik_router_id
    const actualRadiusConfig = radius_config || data?.connection_summary?.sync_details?.radius_config

    console.log('Processing sync callback:', { 
      client_id: actualClientId, 
      router_id: actualRouterId, 
      sync_status: actualSyncStatus, 
      error_message: actualErrorMessage 
    })

    // Handle router status updates
    if (actualRouterId) {
      const routerUpdateData = {
        connection_status: actualSyncStatus === 'synced' ? 'connected' : 'configuration_failed',
        last_test_results: actualRadiusConfig ? 
          JSON.stringify({ 
            message: actualErrorMessage || 'RADIUS configuration completed successfully',
            config: actualRadiusConfig,
            timestamp: new Date().toISOString()
          }) : 
          JSON.stringify({ 
            message: actualErrorMessage || 'RADIUS configuration completed successfully',
            timestamp: new Date().toISOString()
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

    // Handle client status updates
    if (!actualClientId && !actualRouterId) {
      throw new Error('Either client_id or router_id is required')
    }

    if (actualClientId) {
      console.log(`Processing sync callback for client ${actualClientId}: ${actualSyncStatus}`)

      // Update client sync status
      const updateData: any = {
        radius_sync_status: actualSyncStatus, // 'synced', 'failed', 'pending'
        last_radius_sync_at: new Date().toISOString()
      }

      // Note: disconnection_scheduled_at column handling removed as it doesn't exist in current schema

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
          last_synced_to_radius: new Date().toISOString(),
          is_active: actualSyncStatus === 'synced'
        })
        .eq('client_id', actualClientId)

      // Log the sync result
      await supabaseClient
        .from('audit_logs')
        .insert({
          resource: 'radius_sync',
          action: `sync_${actualSyncStatus}`,
          resource_id: actualClientId,
          changes: {
            sync_status: actualSyncStatus,
            error_message: actualErrorMessage,
            sync_details,
            ec2_instance_id: actualEc2InstanceId,
            mikrotik_router_id: actualMikrotikRouterId,
            timestamp: new Date().toISOString()
          },
          user_id: null, // System action
          success: actualSyncStatus === 'synced',
          error_message: actualSyncStatus === 'failed' ? actualErrorMessage : null
        })

      // If sync failed, optionally retry or alert
      if (actualSyncStatus === 'failed') {
        console.error(`RADIUS sync failed for client ${actualClientId}:`, actualErrorMessage)
        
        // Could implement retry logic here or send alert
        // For now, just log it
      }

      // Get updated client data to return
      const { data: updatedClient } = await supabaseClient
        .from('clients')
        .select('id, name, radius_sync_status, last_radius_sync_at')
        .eq('id', actualClientId)
        .single()
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
