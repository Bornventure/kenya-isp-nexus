
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateProfileRequest {
  client_email: string;
  client_id_number: string;
  updates: {
    phone?: string;
    mpesa_number?: string;
    address?: string;
    county?: string;
    sub_county?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Update Client Profile Request Started ===')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const requestBody: UpdateProfileRequest = await req.json()
    console.log('Received profile update request for:', requestBody.client_email)

    const { client_email, client_id_number, updates } = requestBody

    // Validate required fields
    if (!client_email || !client_id_number || !updates) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email, ID number, and updates are required',
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
      .select('id, name, status')
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

    // Update client profile
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', client.id)
      .select(`
        id,
        name,
        email,
        phone,
        mpesa_number,
        address,
        county,
        sub_county,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error('Error updating client profile:', updateError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to update profile',
          code: 'UPDATE_FAILED'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Client profile updated successfully:', client.id)

    return new Response(
      JSON.stringify({
        success: true,
        client: updatedClient,
        message: 'Profile updated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Update client profile error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to update profile',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
