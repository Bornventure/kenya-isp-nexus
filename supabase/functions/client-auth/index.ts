
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClientAuthRequest {
  email: string;
  id_number: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Client Authentication Request Started ===')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const requestBody: ClientAuthRequest = await req.json()
    console.log('Received auth request for email:', requestBody.email)

    const { email, id_number } = requestBody

    // Validate required fields
    if (!email || !id_number) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email and ID number are required',
          code: 'MISSING_FIELDS'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find client by email and ID number
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        mpesa_number,
        id_number,
        client_type,
        status,
        connection_type,
        monthly_rate,
        installation_date,
        address,
        county,
        sub_county,
        balance,
        created_at,
        service_packages (
          id,
          name,
          speed,
          monthly_rate,
          description
        )
      `)
      .eq('email', email)
      .eq('id_number', id_number)
      .single()

    if (clientError || !client) {
      console.error('Client not found or authentication failed:', clientError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email or ID number. Please check your credentials.',
          code: 'INVALID_CREDENTIALS'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if client account is active
    if (client.status !== 'active') {
      console.log('Client account is not active:', client.status)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Your account is currently ${client.status}. Please contact support.`,
          code: 'ACCOUNT_INACTIVE'
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get recent payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', client.id)
      .order('payment_date', { ascending: false })
      .limit(10)

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
    }

    // Get recent invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError)
    }

    // Get support tickets
    const { data: supportTickets, error: ticketsError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (ticketsError) {
      console.error('Error fetching support tickets:', ticketsError)
    }

    console.log('Client authentication successful for:', client.name)

    // Return client data with related information
    return new Response(
      JSON.stringify({
        success: true,
        client: {
          ...client,
          payments: payments || [],
          invoices: invoices || [],
          support_tickets: supportTickets || []
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Client authentication error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Authentication failed. Please try again.',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
