
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClientDataRequest {
  client_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { client_id }: ClientDataRequest = await req.json()

    console.log(`Fetching enhanced client data for: ${client_id}`)

    // Get comprehensive client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        *,
        service_packages (
          id,
          name,
          monthly_rate,
          setup_fee,
          bandwidth_limit
        )
      `)
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client not found'
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get latest wallet transactions
    const { data: walletTransactions } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get active session info
    const { data: activeSessions } = await supabase
      .from('active_sessions')
      .select('*')
      .eq('client_id', client_id)
      .order('session_start', { ascending: false })
      .limit(1)

    // Get recent payments
    const { data: recentPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', client_id)
      .order('payment_date', { ascending: false })
      .limit(5)

    // Get bandwidth usage data
    const { data: bandwidthStats } = await supabase
      .from('bandwidth_statistics')
      .select('*')
      .eq('client_id', client_id)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('timestamp', { ascending: false })

    const enhancedClient = {
      ...client,
      wallet_transactions: walletTransactions || [],
      active_session: activeSessions?.[0] || null,
      recent_payments: recentPayments || [],
      bandwidth_usage: bandwidthStats || []
    }

    return new Response(
      JSON.stringify({
        success: true,
        client: enhancedClient
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Enhanced client data error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch client data'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
