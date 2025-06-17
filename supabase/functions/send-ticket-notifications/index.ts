
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  type: 'ticket_assigned' | 'ticket_status_changed' | 'ticket_escalated' | 'sla_warning'
  recipients: string[]
  ticket_id: string
  message: string
  channels: ('email' | 'sms' | 'whatsapp')[]
  priority: 'low' | 'medium' | 'high'
  metadata?: Record<string, any>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: NotificationPayload = await req.json()
    
    // Get ticket details
    const { data: ticket } = await supabaseClient
      .from('support_tickets')
      .select(`
        *,
        clients(name, email, phone),
        assigned_profile:profiles!support_tickets_assigned_to_fkey(first_name, last_name, email, phone),
        departments(name)
      `)
      .eq('id', payload.ticket_id)
      .single()

    if (!ticket) {
      throw new Error('Ticket not found')
    }

    // Determine recipients if not provided
    let recipients = payload.recipients
    if (recipients.length === 0) {
      recipients = []
      
      if (ticket.assigned_profile?.email) {
        recipients.push(ticket.assigned_profile.email)
      }
      
      if (ticket.clients?.email) {
        recipients.push(ticket.clients.email)
      }
    }

    // Send email notifications
    if (payload.channels.includes('email')) {
      for (const email of recipients) {
        const emailPayload = {
          to: [email],
          subject: `Ticket Update: ${ticket.title}`,
          html: generateEmailTemplate(ticket, payload),
        }

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'support@yourcompany.com',
            ...emailPayload,
          }),
        })
      }
    }

    // Send SMS notifications (using Africa's Talking)
    if (payload.channels.includes('sms')) {
      const phoneNumbers = []
      
      if (ticket.assigned_profile?.phone) {
        phoneNumbers.push(ticket.assigned_profile.phone)
      }
      
      if (ticket.clients?.phone) {
        phoneNumbers.push(ticket.clients.phone)
      }

      for (const phone of phoneNumbers) {
        const smsPayload = {
          username: Deno.env.get('AFRICASTALKING_USERNAME'),
          to: phone,
          message: generateSMSMessage(ticket, payload),
          from: Deno.env.get('AFRICASTALKING_SENDER_ID'),
        }

        await fetch('https://api.africastalking.com/version1/messaging', {
          method: 'POST',
          headers: {
            'apiKey': Deno.env.get('AFRICASTALKING_API_KEY') || '',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(smsPayload),
        })
      }
    }

    // Log notification
    await supabaseClient
      .from('notification_logs')
      .insert({
        ticket_id: payload.ticket_id,
        type: payload.type,
        channels: payload.channels,
        recipients,
        status: 'sent',
        metadata: payload.metadata,
      })

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function generateEmailTemplate(ticket: any, payload: NotificationPayload): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">Ticket Update</h2>
        
        <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #555; margin-bottom: 15px;">${ticket.title}</h3>
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Status:</strong> ${ticket.status}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Department:</strong> ${ticket.departments?.name || 'Unassigned'}</p>
          ${ticket.assigned_profile ? `<p><strong>Assigned to:</strong> ${ticket.assigned_profile.first_name} ${ticket.assigned_profile.last_name}</p>` : ''}
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; border-left: 4px solid #2196f3;">
          <p style="margin: 0; color: #1976d2;"><strong>Update:</strong> ${payload.message}</p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://yourcompany.com/support/tickets/${ticket.id}" 
             style="background: #2196f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Ticket
          </a>
        </div>
      </div>
    </div>
  `
}

function generateSMSMessage(ticket: any, payload: NotificationPayload): string {
  return `Ticket Update: ${ticket.title} (ID: ${ticket.id.slice(0, 8)}...) - ${payload.message}. Status: ${ticket.status}. View: https://yourcompany.com/support/tickets/${ticket.id}`
}
