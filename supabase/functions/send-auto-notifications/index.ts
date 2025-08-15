
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { client_id, trigger_event, data } = await req.json()

    // Get client information
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select(`
        *,
        isp_companies (
          name,
          phone,
          email
        )
      `)
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
      throw new Error('Client not found')
    }

    // Get SMS template
    const { data: template, error: templateError } = await supabaseClient
      .from('sms_templates')
      .select('*')
      .eq('template_key', trigger_event)
      .eq('isp_company_id', client.isp_company_id)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      console.log(`No active template found for event: ${trigger_event}`)
      return new Response(
        JSON.stringify({ success: false, message: 'No active template found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get payment settings for paybill number
    const { data: mpesaSettings } = await supabaseClient
      .from('mpesa_settings')
      .select('paybill_number')
      .eq('isp_company_id', client.isp_company_id)
      .eq('is_active', true)
      .single()

    // Prepare template variables
    const templateVariables = {
      client_name: client.name,
      phone: client.phone,
      balance: client.wallet_balance || 0,
      required_amount: client.monthly_rate || 0,
      package_name: data.package_name || 'Internet Service',
      paybill: mpesaSettings?.paybill_number || '123456',
      expiry_date: data.expiry_date || new Date().toLocaleDateString(),
      invoice_number: data.invoice_number || '',
      amount: data.amount || client.monthly_rate || 0,
      eta: data.eta || '30 minutes',
      message: data.message || '',
      ...data // Include any additional data passed
    }

    // Replace template variables
    let messageContent = template.template_content
    for (const [key, value] of Object.entries(templateVariables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      messageContent = messageContent.replace(regex, String(value))
    }

    // Send SMS using Africa's Talking
    const AT_API_KEY = Deno.env.get('AFRICASTALKING_API_KEY')
    const AT_USERNAME = Deno.env.get('AFRICASTALKING_USERNAME')
    const AT_SENDER_ID = Deno.env.get('AFRICASTALKING_SENDER_ID')

    if (!AT_API_KEY || !AT_USERNAME) {
      console.log('SMS service not configured')
      return new Response(
        JSON.stringify({ success: false, message: 'SMS service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const smsResponse = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'ApiKey': AT_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        username: AT_USERNAME,
        to: client.phone,
        message: messageContent,
        ...(AT_SENDER_ID && { from: AT_SENDER_ID })
      })
    })

    const smsResult = await smsResponse.json()
    
    // Log notification
    await supabaseClient
      .from('notification_logs')
      .insert({
        client_id: client_id,
        trigger_event,
        type: 'auto',
        channels: ['sms'],
        recipients: [client.phone],
        message_content: messageContent,
        status: smsResult.SMSMessageData?.Recipients?.[0]?.status === 'Success' ? 'sent' : 'failed',
        provider_response: smsResult,
        isp_company_id: client.isp_company_id
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        sms_status: smsResult.SMSMessageData?.Recipients?.[0]?.status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-auto-notifications:', error)
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
