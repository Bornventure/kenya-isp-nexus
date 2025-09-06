
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
        last_test_results: error_message || 'RADIUS configuration completed successfully',
        updated_at: new Date().toISOString()
      }

      if (radius_config) {
        routerUpdateData.radius_config = radius_config
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

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sync callback processed successfully`,
        data: {
          client_id,
          sync_status,
          last_synced: updateData.last_radius_sync_at,
          client_info: updatedClient
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
