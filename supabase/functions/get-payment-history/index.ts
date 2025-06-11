
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentHistoryRequest {
  client_email: string;
  client_id_number: string;
  page?: number;
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Get Payment History Request Started ===')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse query parameters
    const url = new URL(req.url)
    const client_email = url.searchParams.get('client_email')
    const client_id_number = url.searchParams.get('client_id_number')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    console.log('Payment history request for:', client_email, 'Page:', page)

    // Validate required fields
    if (!client_email || !client_id_number) {
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

    // Verify client exists and is authenticated
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('email', client_email)
      .eq('id_number', client_id_number)
      .single()

    if (clientError || !client) {
      console.error('Client verification failed:', clientError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid client credentials',
          code: 'INVALID_CLIENT'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Get payment history with pagination
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        payment_method,
        payment_date,
        reference_number,
        mpesa_receipt_number,
        notes,
        created_at
      `)
      .eq('client_id', client.id)
      .order('payment_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (paymentsError) {
      console.error('Error fetching payment history:', paymentsError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch payment history',
          code: 'FETCH_FAILED'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id)

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    console.log(`Payment history fetched: ${payments?.length || 0} payments`)

    return new Response(
      JSON.stringify({
        success: true,
        payments: payments || [],
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Get payment history error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch payment history',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
