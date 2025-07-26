
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Get Client Wallet Transactions Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody = await req.json()
    console.log('Received request:', requestBody)

    const { client_email, client_id_number, client_id } = requestBody

    if (!client_email && !client_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client email or client ID is required'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find client - use client_id if provided, otherwise find by email/id_number
    let client
    if (client_id) {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name, email, phone, isp_company_id')
        .eq('id', client_id)
        .single()

      if (clientError || !clientData) {
        console.error('Client not found by ID:', clientError)
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
      client = clientData
    } else {
      // Find by email and optionally id_number
      let clientQuery = supabase
        .from('clients')
        .select('id, name, email, phone, isp_company_id')
        .eq('email', client_email)

      if (client_id_number) {
        clientQuery = clientQuery.eq('id_number', client_id_number)
      }

      const { data: clientData, error: clientError } = await clientQuery.single()

      if (clientError || !clientData) {
        console.error('Client not found:', clientError)
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
      client = clientData
    }

    console.log('Client found:', client.name, 'ID:', client.id)

    // Fetch wallet transactions for this client using service role
    const { data: transactions, error: transactionsError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (transactionsError) {
      console.error('Error fetching wallet transactions:', transactionsError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch transactions'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Found', transactions?.length || 0, 'transactions for client:', client.name)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          client: {
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone
          },
          transactions: transactions || []
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Get client wallet transactions error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch wallet transactions'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
