
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
    
    let result: any = {}

    switch (action.type) {
      case 'escalate':
        result = await handleEscalation(supabaseClient, action)
        break
      case 'auto_assign':
        result = await handleAutoAssignment(supabaseClient, action)
        break
      case 'sla_check':
        result = await handleSLACheck(supabaseClient, action)
        break
      case 'close_resolved':
        result = await handleCloseResolved(supabaseClient, action)
        break
      default:
        throw new Error(`Unknown workflow action: ${action.type}`)
    }

    return new Response(
      JSON.stringify({ success: true, result }),
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

async function handleEscalation(supabaseClient: any, action: WorkflowAction) {
  const { data: ticket } = await supabaseClient
    .from('support_tickets')
    .select('*')
    .eq('id', action.ticket_id)
    .single()

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  const newEscalationLevel = (ticket.escalation_level || 1) + 1
  
  // Update ticket
  await supabaseClient
    .from('support_tickets')
    .update({
      escalation_level: newEscalationLevel,
      priority: newEscalationLevel > 2 ? 'high' : ticket.priority,
      updated_at: new Date().toISOString(),
    })
    .eq('id', action.ticket_id)

  // Add escalation comment
  await supabaseClient
    .from('ticket_comments')
    .insert({
      ticket_id: action.ticket_id,
      author_id: ticket.created_by,
      content: `Ticket escalated to level ${newEscalationLevel}. Reason: ${action.parameters?.reason || 'Not specified'}`,
      is_internal: true,
      isp_company_id: ticket.isp_company_id,
    })

  // Send escalation notification
  await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-ticket-notifications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'ticket_escalated',
      ticket_id: action.ticket_id,
      message: `Ticket has been escalated to level ${newEscalationLevel}`,
      channels: ['email', 'sms'],
      priority: 'high',
      recipients: [],
    }),
  })

  return { escalation_level: newEscalationLevel }
}

async function handleAutoAssignment(supabaseClient: any, action: WorkflowAction) {
  const departmentId = action.parameters?.department_id
  
  if (!departmentId) {
    throw new Error('Department ID required for auto assignment')
  }

  // Find available technicians in the department
  const { data: technicians } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('role', 'technician')
    .eq('is_active', true)
    .limit(10)

  if (!technicians || technicians.length === 0) {
    throw new Error('No available technicians found')
  }

  // Simple round-robin assignment (you could implement more sophisticated logic)
  const assignedTechnician = technicians[Math.floor(Math.random() * technicians.length)]

  // Update ticket
  await supabaseClient
    .from('support_tickets')
    .update({
      assigned_to: assignedTechnician.id,
      department_id: departmentId,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', action.ticket_id)

  // Create assignment record
  await supabaseClient
    .from('ticket_assignments')
    .insert({
      ticket_id: action.ticket_id,
      assigned_to: assignedTechnician.id,
      department_id: departmentId,
      assignment_reason: 'Auto-assigned based on department workload',
      status: 'active',
    })

  return { assigned_to: assignedTechnician.id }
}

async function handleSLACheck(supabaseClient: any, action: WorkflowAction) {
  const { data: ticket } = await supabaseClient
    .from('support_tickets')
    .select('*')
    .eq('id', action.ticket_id)
    .single()

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  const now = new Date()
  const createdAt = new Date(ticket.created_at)
  const hoursOpen = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

  let slaStatus = 'on_time'
  let slaThreshold = 24 // Default 24 hours

  // Adjust SLA based on priority
  switch (ticket.priority) {
    case 'high':
      slaThreshold = 4
      break
    case 'medium':
      slaThreshold = 12
      break
    case 'low':
      slaThreshold = 48
      break
  }

  if (hoursOpen > slaThreshold) {
    slaStatus = 'overdue'
  } else if (hoursOpen > slaThreshold * 0.8) {
    slaStatus = 'at_risk'
  }

  // Update SLA due date if not set
  if (!ticket.sla_due_date) {
    const slaDueDate = new Date(createdAt)
    slaDueDate.setHours(slaDueDate.getHours() + slaThreshold)
    
    await supabaseClient
      .from('support_tickets')
      .update({ sla_due_date: slaDueDate.toISOString() })
      .eq('id', action.ticket_id)
  }

  return { sla_status: slaStatus, hours_open: hoursOpen, sla_threshold: slaThreshold }
}

async function handleCloseResolved(supabaseClient: any, action: WorkflowAction) {
  const { data: ticket } = await supabaseClient
    .from('support_tickets')
    .select('*')
    .eq('id', action.ticket_id)
    .single()

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  if (ticket.status !== 'resolved') {
    throw new Error('Only resolved tickets can be closed')
  }

  // Check if resolved for more than specified time (default 24 hours)
  const resolvedAt = new Date(ticket.resolved_at || ticket.updated_at)
  const now = new Date()
  const hoursResolved = (now.getTime() - resolvedAt.getTime()) / (1000 * 60 * 60)
  const autoCloseHours = action.parameters?.auto_close_hours || 24

  if (hoursResolved >= autoCloseHours) {
    await supabaseClient
      .from('support_tickets')
      .update({
        status: 'closed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', action.ticket_id)

    return { closed: true, auto_closed: true }
  }

  return { closed: false, hours_until_auto_close: autoCloseHours - hoursResolved }
}
