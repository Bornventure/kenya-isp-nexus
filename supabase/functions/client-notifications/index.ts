
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
    console.log('=== Client Notifications Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle both GET and POST requests
    let client_email: string;
    let client_id_number: string | undefined;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      client_email = url.searchParams.get('client_email') || '';
      client_id_number = url.searchParams.get('client_id_number') || undefined;
    } else {
      const requestBody = await req.json()
      client_email = requestBody.client_email;
      client_id_number = requestBody.client_id_number;
    }

    console.log('Received notifications request for:', client_email)

    if (!client_email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email is required',
          code: 'MISSING_EMAIL'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find client first
    let clientQuery = supabase
      .from('clients')
      .select('id, name, email')
      .eq('email', client_email)

    if (client_id_number) {
      clientQuery = clientQuery.eq('id_number', client_id_number)
    }

    const { data: client, error: clientError } = await clientQuery.single()

    if (clientError || !client) {
      console.error('Client not found:', clientError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client not found',
          code: 'CLIENT_NOT_FOUND'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get notifications for the client
    const { data: notifications, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (notificationError) {
      console.error('Error fetching notifications:', notificationError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch notifications',
          code: 'FETCH_ERROR'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Notifications fetched for:', client.name, 'Count:', notifications?.length || 0)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          notifications: notifications || [],
          unread_count: notifications?.filter(n => !n.read_at).length || 0
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Client notifications error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch notifications',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
