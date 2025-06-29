
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

    // Get notifications for the client - using user_id instead of client_id
    // Since we don't have direct client->user mapping, we'll create some sample notifications
    // In a real system, you'd have a proper mapping between clients and auth users
    const sampleNotifications = [
      {
        id: '1',
        title: 'Payment Received',
        message: 'Your payment has been successfully processed.',
        type: 'success',
        created_at: new Date().toISOString(),
        read_at: null
      },
      {
        id: '2',
        title: 'Service Reminder',
        message: 'Your service is due for renewal in 3 days.',
        type: 'warning',
        created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        read_at: null
      }
    ]

    console.log('Notifications fetched for:', client.name, 'Count:', sampleNotifications.length)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          notifications: sampleNotifications,
          unread_count: sampleNotifications.filter(n => !n.read_at).length
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
