
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteCompanyRequest {
  companyId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Company Deletion Request Started ===')

    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No authorization header provided',
          code: 'UNAUTHORIZED'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create authenticated client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            authorization: authHeader,
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User authentication failed',
          code: 'UNAUTHORIZED'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check user role
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch failed:', profileError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch user profile',
          code: 'PROFILE_ERROR'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (profile.role !== 'super_admin') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Only super administrators can delete companies',
          code: 'INSUFFICIENT_PERMISSIONS'
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use admin client for deletion
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

    const requestBody: DeleteCompanyRequest = await req.json()
    const { companyId } = requestBody

    if (!companyId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Company ID is required',
          code: 'MISSING_COMPANY_ID'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Deleting company:', companyId)

    // Call the database function to delete the company
    const { data, error } = await supabaseAdmin
      .rpc('delete_company_cascade', { company_id_param: companyId })

    if (error) {
      console.error('Company deletion error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to delete company: ${error.message}`,
          code: 'DELETION_ERROR'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Company deletion result:', data)

    // Check if the deletion was successful
    if (data && data.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Company deleted successfully',
          summary: data
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: data?.error || 'Unknown error occurred during deletion',
          code: 'DELETION_FAILED'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Company deletion error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: `Failed to delete company: ${error.message}`,
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
