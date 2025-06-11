
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SupportTicketRequest {
  client_email: string;
  client_id_number: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Submit Support Ticket Request Started ===')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const requestBody: SupportTicketRequest = await req.json()
    console.log('Received support ticket request for:', requestBody.client_email)

    const { client_email, client_id_number, title, description, priority = 'medium' } = requestBody

    // Validate required fields
    if (!client_email || !client_id_number || !title || !description) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email, ID number, title, and description are required',
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
      .select('id, name, isp_company_id, status')
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

    // Create support ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        client_id: client.id,
        isp_company_id: client.isp_company_id,
        title,
        description,
        priority,
        status: 'open',
        created_by: client.id
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Error creating support ticket:', ticketError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create support ticket',
          code: 'TICKET_CREATION_FAILED'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Support ticket created successfully:', ticket.id)

    return new Response(
      JSON.stringify({
        success: true,
        ticket: {
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          status: ticket.status,
          created_at: ticket.created_at
        },
        message: 'Support ticket submitted successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Submit support ticket error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to submit support ticket',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
