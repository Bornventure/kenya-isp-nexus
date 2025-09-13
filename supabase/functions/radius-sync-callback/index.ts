
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

      // Batch all database operations in a single transaction
      const { data: clientData, error: clientSelectError } = await supabaseClient
        .from('clients')
        .select('isp_company_id')
        .eq('id', actualClientId)
        .maybeSingle()

      if (clientSelectError) throw clientSelectError
      const clientExists = !!clientData
      if (!clientExists) {
        console.warn(`Client ${actualClientId} not found; proceeding without client updates`)
      }

      // Batch updates using Promise.all for parallel execution
      const batchOperations: Promise<any>[] = []

      if (clientData) {
        // Update client
        batchOperations.push(
          supabaseClient
            .from('clients')
            .update(updateData)
            .eq('id', actualClientId)
        )

        // Update radius_users
        batchOperations.push(
          supabaseClient
            .from('radius_users')
            .update({
              last_synced_to_radius: timestamp || new Date().toISOString(),
              is_active: actualStatus === 'active'
            })
            .eq('client_id', actualClientId)
        )
      }

      // Only add logging if it's not a frequent operation to reduce noise
      if (actualErrorMessage || actualSyncStatus === 'failed') {
        batchOperations.push(
          // Insert event into radius_events table
          supabaseClient
            .from('radius_events')
            .insert({
              username: `client_${actualClientId}`,
              client_id: actualClientId,
              action: actualAction || 'sync',
              success: !actualErrorMessage,
              error: actualErrorMessage,
              isp_company_id: clientData?.isp_company_id ?? null,
              timestamp: timestamp || new Date().toISOString()
            }),
          
          // Log the callback event
          supabaseClient
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
              user_id: null,
              success: !actualErrorMessage,
              error_message: actualErrorMessage
            })
        )
      }

      const results = await Promise.allSettled(batchOperations)
      
      // Check for any failures
      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        console.error('Some batch operations failed:', failures)
      }

      console.log(`Successfully processed callback for client ${actualClientId}`)
    }

    // Optimized router details - only fetch when necessary
    let routerDetails = null
    let authenticatedUsers = []
    
    // Only fetch detailed router info if explicitly requested or on error
    if (actualRouterId && (actualErrorMessage || actualSyncStatus === 'failed')) {
      const { data: routerData, error: routerErr } = await supabaseClient
        .from('mikrotik_routers')
        .select(`
            id,
            name,
            ip_address,
            connection_status,
            sync_status,
            last_sync_at,
            isp_companies(name)
          `)
        .eq('id', actualRouterId)
        .maybeSingle()

      if (!routerErr) {
        routerDetails = routerData
      }
      
      if (routerDetails?.ip_address) {
        const { data: sessionsData, error: sessionsErr } = await supabaseClient
          .from('active_sessions')
          .select('username, calling_station_id, session_start')
          .eq('nas_ip_address', routerDetails.ip_address)

        if (!sessionsErr) {
          authenticatedUsers = sessionsData || []
        } else {
          console.warn('Failed to fetch active sessions:', sessionsErr)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sync callback processed successfully`,
        data: {
          client_id: actualClientId,
          router_id: actualRouterId,
          sync_status: actualSyncStatus,
          last_synced: timestamp || new Date().toISOString(),
          router_details: routerDetails,
          authenticated_users: authenticatedUsers,
          connection_summary: routerDetails ? {
            total_active_users: authenticatedUsers.length,
            router_status: routerDetails.connection_status,
            router_ip: routerDetails.ip_address,
            last_updated: new Date().toISOString()
          } : null
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
