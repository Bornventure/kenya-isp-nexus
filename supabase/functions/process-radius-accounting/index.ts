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
      username,
      session_id,
      nas_ip_address,
      session_time,
      input_octets,
      output_octets,
      terminate_cause,
      start_time,
      end_time
    } = await req.json()

    console.log('Processing RADIUS accounting record:', {
      username,
      session_id,
      nas_ip_address,
      session_time
    })

    // Get client and router info from username and NAS IP
    const { data: radiusUser } = await supabaseClient
      .from('radius_users')
      .select(`
        client_id,
        clients!inner(
          id,
          isp_company_id
        )
      `)
      .eq('username', username)
      .single()

    if (!radiusUser) {
      throw new Error(`RADIUS user not found: ${username}`)
    }

    // Find router by NAS IP
    const { data: router } = await supabaseClient
      .from('mikrotik_routers')
      .select('id')
      .eq('ip_address', nas_ip_address)
      .eq('isp_company_id', radiusUser.clients.isp_company_id)
      .single()

    // Insert or update session in radius_sessions
    const sessionData = {
      username,
      client_id: radiusUser.client_id,
      router_id: router?.id,
      session_id,
      nas_ip_address,
      start_time: start_time || new Date(Date.now() - (session_time * 1000)).toISOString(),
      end_time: end_time || new Date().toISOString(),
      session_time,
      input_octets: input_octets || 0,
      output_octets: output_octets || 0,
      terminate_cause,
      status: terminate_cause ? 'ended' : 'active',
      isp_company_id: radiusUser.clients.isp_company_id
    }

    const { error: sessionError } = await supabaseClient
      .from('radius_sessions')
      .upsert(sessionData, {
        onConflict: 'session_id'
      })

    if (sessionError) {
      throw sessionError
    }

    // Also insert into existing radius_accounting table for backward compatibility
    const { error: accountingError } = await supabaseClient
      .from('radius_accounting')
      .upsert({
        username,
        session_id,
        nas_ip_address,
        session_time,
        input_octets: input_octets || 0,
        output_octets: output_octets || 0,
        terminate_cause,
        client_id: radiusUser.client_id,
        isp_company_id: radiusUser.clients.isp_company_id
      }, {
        onConflict: 'session_id'
      })

    if (accountingError) {
      console.warn('Error inserting into radius_accounting:', accountingError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'RADIUS accounting record processed successfully',
        session_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing RADIUS accounting record:', error)
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