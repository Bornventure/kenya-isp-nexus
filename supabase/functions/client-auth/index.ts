
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Client Authentication Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody: ClientAuthRequest = await req.json()
    console.log('Received auth request for email:', requestBody.email)

    const { email, id_number } = requestBody

    if (!email || !id_number) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email and ID number are required',
          code: 'MISSING_CREDENTIALS'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find client with full details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        *,
        service_packages (
          id,
          name,
          monthly_rate,
          speed,
          description
        ),
        invoices!client_id (
          id,
          invoice_number,
          amount,
          vat_amount,
          total_amount,
          due_date,
          status,
          created_at,
          service_period_start,
          service_period_end
        ),
        payments!client_id (
          id,
          amount,
          payment_method,
          payment_date,
          reference_number,
          mpesa_receipt_number
        )
      `)
      .eq('email', email)
      .eq('id_number', id_number)
      .single()

    if (clientError || !client) {
      console.error('Client not found:', clientError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid credentials',
          code: 'CLIENT_NOT_FOUND'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Client found:', client.name, 'Status:', client.status)

    // IMPORTANT: Allow suspended clients to log in so they can make payments
    // Only block completely disconnected or pending clients
    if (client.status === 'disconnected' || client.status === 'pending') {
      console.log('Client account is not accessible. Status:', client.status)
      return new Response(
        JSON.stringify({
          success: false,
          error: client.status === 'pending' 
            ? 'Account is pending activation. Please contact support.'
            : 'Account is disconnected. Please contact support.',
          code: 'ACCOUNT_NOT_ACCESSIBLE'
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Allow active and suspended clients to access the portal
    console.log('Client authentication successful for:', client.name)

    return new Response(
      JSON.stringify({
        success: true,
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          mpesa_number: client.mpesa_number,
          id_number: client.id_number,
          status: client.status,
          balance: client.balance || 0,
          monthly_rate: client.monthly_rate,
          installation_date: client.installation_date,
          location: {
            address: client.address,
            county: client.county,
            sub_county: client.sub_county
          },
          service_package: client.service_packages,
          invoices: client.invoices || [],
          payments: client.payments || []
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
        error: 'Authentication failed',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
