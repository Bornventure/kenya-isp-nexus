
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Get Invoice Details Request Started ===')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse query parameters
    const url = new URL(req.url)
    const client_email = url.searchParams.get('client_email')
    const client_id_number = url.searchParams.get('client_id_number')
    const invoice_id = url.searchParams.get('invoice_id')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    console.log('Invoice details request for:', client_email, invoice_id ? `Invoice ID: ${invoice_id}` : `Page: ${page}`)

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

    if (invoice_id) {
      // Get specific invoice details
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          amount,
          vat_amount,
          total_amount,
          due_date,
          service_period_start,
          service_period_end,
          status,
          notes,
          created_at
        `)
        .eq('id', invoice_id)
        .eq('client_id', client.id)
        .single()

      if (invoiceError || !invoice) {
        console.error('Invoice not found:', invoiceError)
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invoice not found or access denied',
            code: 'INVOICE_NOT_FOUND'
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          invoice
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // Get invoice list with pagination
      const offset = (page - 1) * limit

      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          amount,
          vat_amount,
          total_amount,
          due_date,
          service_period_start,
          service_period_end,
          status,
          created_at
        `)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError)
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to fetch invoices',
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
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / limit)

      console.log(`Invoices fetched: ${invoices?.length || 0} invoices`)

      return new Response(
        JSON.stringify({
          success: true,
          invoices: invoices || [],
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
    }

  } catch (error) {
    console.error('Get invoice details error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch invoice details',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
