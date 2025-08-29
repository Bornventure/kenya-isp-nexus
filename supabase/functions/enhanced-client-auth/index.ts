
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthRequest {
  email: string;
  password?: string;
  id_number?: string;
  login_type: 'portal' | 'id_number';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { email, password, id_number, login_type }: AuthRequest = await req.json()

    console.log(`Enhanced client auth attempt - Type: ${login_type}, Email: ${email}`)

    let client;
    let clientError;

    if (login_type === 'portal' && password) {
      // Portal login with email and password
      const { data, error } = await supabase
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
        .eq('email', email)
        .eq('portal_password', password) // In production, hash this
        .single()

      client = data
      clientError = error
    } else if (login_type === 'id_number' && id_number) {
      // Legacy login with email and ID number
      const { data, error } = await supabase
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
        .eq('email', email)
        .eq('id_number', id_number)
        .single()

      client = data
      clientError = error
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid login method or missing credentials'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (clientError || !client) {
      console.log('Client auth failed:', clientError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid credentials or client not found'
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update last login time
    await supabase
      .from('clients')
      .update({ portal_last_login: new Date().toISOString() })
      .eq('id', client.id)

    // Check if client is active
    if (client.status !== 'active') {
      let access_message = 'Account not yet activated'
      if (client.status === 'pending') {
        access_message = 'Your account is pending approval. You will receive SMS notification once approved.'
      } else if (client.status === 'suspended') {
        access_message = 'Your account has been suspended. Please contact support.'
      } else if (client.status === 'approved') {
        access_message = 'Your account is approved but service not yet activated. Please ensure payment is completed.'
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: access_message,
          client_status: client.status
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Client ${client.name} authenticated successfully`)

    return new Response(
      JSON.stringify({
        success: true,
        client: client,
        access_message: client.portal_setup_required 
          ? 'Please change your temporary password for security'
          : 'Welcome back to your client portal'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Enhanced client auth error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Authentication service temporarily unavailable'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
