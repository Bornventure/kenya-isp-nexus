
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

    const { client_id, bulk_generate } = await req.json()

    if (!client_id && !bulk_generate) {
      throw new Error('client_id is required, or set bulk_generate to true')
    }

    console.log('Generating RADIUS credentials for client:', client_id || 'bulk generation')

    if (bulk_generate) {
      // Generate credentials for all clients without RADIUS credentials
      const { data: clientsWithoutRadius } = await supabaseClient
        .from('clients')
        .select('id, name')
        .is('radius_username', null)
        .eq('status', 'active')

      const results = []
      
      for (const client of clientsWithoutRadius || []) {
        const { data: result, error } = await supabaseClient
          .rpc('generate_radius_credentials', { p_client_id: client.id })

        results.push({
          client_id: client.id,
          client_name: client.name,
          success: !error,
          credentials: result,
          error: error?.message
        })
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Bulk generation completed for ${results.length} clients`,
          data: results
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      // Generate credentials for specific client
      const { data: result, error } = await supabaseClient
        .rpc('generate_radius_credentials', { p_client_id: client_id })

      if (error) throw error

      if (!result.success) {
        throw new Error(result.message)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'RADIUS credentials generated successfully',
          data: {
            client_id,
            username: result.username,
            password: result.password,
            bandwidth_profile: result.bandwidth_profile
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

  } catch (error) {
    console.error('Error generating RADIUS credentials:', error)
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
