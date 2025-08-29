
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PasswordUpdateRequest {
  client_id: string;
  new_password: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { client_id, new_password }: PasswordUpdateRequest = await req.json()

    console.log(`Password update request for client: ${client_id}`)

    // Validate password strength
    if (!new_password || new_password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Password must be at least 6 characters long'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update client password (in production, hash this password)
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        portal_password: new_password,
        portal_setup_required: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', client_id)

    if (updateError) {
      console.error('Password update error:', updateError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to update password'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Password updated successfully for client: ${client_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password updated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Password update service error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Password update service temporarily unavailable'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
