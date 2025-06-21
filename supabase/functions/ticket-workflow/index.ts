
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorkflowAction {
  type: 'escalate' | 'auto_assign' | 'sla_check' | 'close_resolved'
  ticket_id: string
  parameters?: Record<string, any>
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

    const action: WorkflowAction = await req.json()
    
    switch (action.type) {
      case 'escalate':
        return await escalateTicket(supabaseClient, action)
      case 'auto_assign':
        return await autoAssignTicket(supabaseClient, action)
      case 'sla_check':
        return await checkSLA(supabaseClient, action)
      case 'close_resolved':
        return await closeResolvedTicket(supabaseClient, action)
      default:
        throw new Error(`Unknown workflow action: ${action.type}`)
    }

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

async function escalateTicket(supabase: any, action: WorkflowAction) {
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*, departments(name)')
    .eq('id', action.ticket_id)
    .single()

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  // Increase escalation level
  const newEscalationLevel = (ticket.escalation_level || 1) + 1
  
  // Update ticket
  await supabase
    .from('support_tickets')
    .update({
      escalation_level: newEscalationLevel,
      priority: newEscalationLevel >= 3 ? 'high' : ticket.priority,
      updated_at: new Date().toISOString()
    })
    .eq('id', action.ticket_id)

  // Log the escalation
  await supabase
    .from('ticket_comments')
    .insert({
      ticket_id: action.ticket_id,
      author_id: null, // System comment
      content: `Ticket escalated to level ${newEscalationLevel}. Reason: ${action.parameters?.reason || 'Automatic escalation'}`,
      is_internal: true,
      is_resolution: false
    })

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Ticket escalated to level ${newEscalationLevel}`,
      escalation_level: newEscalationLevel
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function autoAssignTicket(supabase: any, action: WorkflowAction) {
  // Find available users in the department
  const { data: availableUsers } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('department_id', action.parameters?.department_id)
    .eq('is_active', true)

  if (!availableUsers || availableUsers.length === 0) {
    throw new Error('No available users in the specified department')
  }

  // Simple round-robin assignment (in production, you might want more sophisticated logic)
  const assignedUser = availableUsers[Math.floor(Math.random() * availableUsers.length)]

  // Update ticket
  await supabase
    .from('support_tickets')
    .update({
      assigned_to: assignedUser.id,
      status: 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', action.ticket_id)

  // Create assignment record
  await supabase
    .from('ticket_assignments')
    .insert({
      ticket_id: action.ticket_id,
      assigned_to: assignedUser.id,
      department_id: action.parameters?.department_id,
      assignment_reason: 'Auto-assigned by system'
    })

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Ticket auto-assigned to ${assignedUser.first_name} ${assignedUser.last_name}`,
      assigned_to: assignedUser
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function checkSLA(supabase: any, action: WorkflowAction) {
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', action.ticket_id)
    .single()

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  const now = new Date()
  const slaTime = new Date(ticket.sla_due_date)
  const timeUntilSLA = slaTime.getTime() - now.getTime()
  const hoursUntilSLA = timeUntilSLA / (1000 * 60 * 60)

  let action_taken = false

  // If SLA is breached
  if (timeUntilSLA <= 0) {
    await supabase
      .from('support_tickets')
      .update({
        escalation_level: (ticket.escalation_level || 1) + 1,
        priority: 'high'
      })
      .eq('id', action.ticket_id)
    
    action_taken = true
  }
  // If SLA is within 2 hours, send warning
  else if (hoursUntilSLA <= 2) {
    // Send notification (this would integrate with your notification system)
    console.log(`SLA Warning: Ticket ${ticket.id} SLA due in ${hoursUntilSLA.toFixed(1)} hours`)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      sla_status: timeUntilSLA <= 0 ? 'breached' : 'on_track',
      hours_until_sla: hoursUntilSLA,
      action_taken
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function closeResolvedTicket(supabase: any, action: WorkflowAction) {
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', action.ticket_id)
    .single()

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  if (ticket.status !== 'resolved') {
    throw new Error('Ticket must be in resolved status to close')
  }

  // Update ticket to closed
  await supabase
    .from('support_tickets')
    .update({
      status: 'closed',
      updated_at: new Date().toISOString()
    })
    .eq('id', action.ticket_id)

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Ticket closed successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
