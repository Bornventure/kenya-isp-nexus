
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClientDataRequest {
  client_email: string;
  client_id_number?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Client Dashboard Data Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle both GET and POST requests
    let client_email: string;
    let client_id_number: string | undefined;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      client_email = url.searchParams.get('client_email') || '';
      client_id_number = url.searchParams.get('client_id_number') || undefined;
    } else {
      const requestBody: ClientDataRequest = await req.json()
      client_email = requestBody.client_email;
      client_id_number = requestBody.client_id_number;
    }

    console.log('Received dashboard data request for:', client_email)

    if (!client_email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email is required',
          code: 'MISSING_EMAIL'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find client with all related data
    let clientQuery = supabase
      .from('clients')
      .select(`
        *,
        service_packages (
          id,
          name,
          monthly_rate,
          speed,
          description
        )
      `)
      .eq('email', client_email)

    if (client_id_number) {
      clientQuery = clientQuery.eq('id_number', client_id_number)
    }

    const { data: client, error: clientError } = await clientQuery.single()

    if (clientError || !client) {
      console.error('Client not found:', clientError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client not found',
          code: 'CLIENT_NOT_FOUND'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get recent payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', client.id)
      .order('payment_date', { ascending: false })
      .limit(10)

    // Get recent wallet transactions
    const { data: walletTransactions } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Get pending invoices
    const { data: pendingInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', client.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    // Get recent invoices
    const { data: recentInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get support tickets
    const { data: supportTickets } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get M-Pesa settings for payments
    const { data: mpesaSettings } = await supabase
      .from('mpesa_settings')
      .select('paybill_number')
      .eq('isp_company_id', client.isp_company_id)
      .eq('is_active', true)
      .single()

    console.log('Dashboard data compiled for:', client.name)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          client: {
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            mpesa_number: client.mpesa_number,
            id_number: client.id_number,
            status: client.status,
            wallet_balance: client.wallet_balance || 0,
            monthly_rate: client.monthly_rate,
            subscription_start_date: client.subscription_start_date,
            subscription_end_date: client.subscription_end_date,
            subscription_type: client.subscription_type || 'monthly',
            installation_date: client.installation_date,
            location: {
              address: client.address,
              county: client.county,
              sub_county: client.sub_county,
              latitude: client.latitude,
              longitude: client.longitude
            },
            service_package: client.service_packages,
            payment_settings: {
              paybill_number: mpesaSettings?.paybill_number || '174379',
              account_number: client.id_number
            }
          },
          payments: payments || [],
          wallet_transactions: walletTransactions || [],
          pending_invoices: pendingInvoices || [],
          recent_invoices: recentInvoices || [],
          support_tickets: supportTickets || [],
          summary: {
            total_payments: payments?.length || 0,
            pending_invoices_count: pendingInvoices?.length || 0,
            open_tickets: supportTickets?.filter(t => t.status === 'open').length || 0,
            current_balance: client.wallet_balance || 0,
            monthly_rate: client.monthly_rate
          }
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Client dashboard data error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch dashboard data',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
