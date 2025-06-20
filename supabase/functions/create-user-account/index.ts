
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  isp_company_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== User Creation Request Started ===')

    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const requestBody: CreateUserRequest = await req.json()
    console.log('Creating user:', requestBody.email)

    const { email, password, first_name, last_name, phone, role, isp_company_id } = requestBody

    // Step 1: Create the auth user using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: {
        first_name: first_name,
        last_name: last_name,
      },
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to create auth user: ${authError.message}`,
          code: 'AUTH_ERROR'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No user returned from auth creation',
          code: 'NO_USER'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Auth user created successfully:', authData.user.id)

    // Step 2: Create/update the profile
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single()

    let profileData

    if (!existingProfile) {
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: first_name,
          last_name: last_name,
          phone: phone,
          role: role,
          isp_company_id: isp_company_id,
        })
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Cleanup: delete the auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to create user profile: ${profileError.message}`,
            code: 'PROFILE_ERROR'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      profileData = newProfile
    } else {
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          first_name: first_name,
          last_name: last_name,
          phone: phone,
          role: role,
          isp_company_id: isp_company_id,
        })
        .eq('id', authData.user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Profile update error:', updateError)
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to update user profile: ${updateError.message}`,
            code: 'PROFILE_UPDATE_ERROR'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      profileData = updatedProfile
    }

    // Step 3: Send credentials to user via email and SMS
    try {
      // Get the current site URL from the request headers
      const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://your-domain.com'
      
      await supabaseAdmin.functions.invoke('send-user-credentials', {
        body: {
          email: email,
          phone: phone,
          first_name: first_name,
          last_name: last_name,
          password: password, // Use the exact same password
          role: role,
          site_url: origin, // Pass the actual site URL
        },
      })
      console.log('Credentials sent successfully to user')
    } catch (credentialError) {
      console.warn('Failed to send credentials, but user was created successfully:', credentialError)
      // Don't fail the entire operation if credential delivery fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User created successfully',
        data: profileData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('User creation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to create user account',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
