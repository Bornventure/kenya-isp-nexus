
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
    console.log('=== Service Packages Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all active service packages
    const { data: packages, error: packagesError } = await supabase
      .from('service_packages')
      .select('*')
      .eq('is_active', true)
      .order('monthly_rate', { ascending: true })

    if (packagesError) {
      console.error('Error fetching service packages:', packagesError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch service packages',
          code: 'FETCH_ERROR'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Service packages fetched, count:', packages?.length || 0)

    return new Response(
      JSON.stringify({
        success: true,
        data: packages || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Service packages error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch service packages',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
