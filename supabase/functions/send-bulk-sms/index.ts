
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

    const { template_key, recipients, variables, isp_company_id } = await req.json()

    if (!template_key || !recipients || recipients.length === 0) {
      throw new Error('Template key and recipients are required')
    }

    // Get SMS template
    const { data: template, error: templateError } = await supabaseClient
      .from('sms_templates')
      .select('*')
      .eq('template_key', template_key)
      .eq('isp_company_id', isp_company_id)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      throw new Error('SMS template not found or inactive')
    }

    // Replace template variables
    let messageContent = template.template_content
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        messageContent = messageContent.replace(regex, String(value))
      }
    }

    // Send bulk SMS using Africa's Talking
    const AT_API_KEY = Deno.env.get('AFRICASTALKING_API_KEY')
    const AT_USERNAME = Deno.env.get('AFRICASTALKING_USERNAME')
    const AT_SENDER_ID = Deno.env.get('AFRICASTALKING_SENDER_ID')

    if (!AT_API_KEY || !AT_USERNAME) {
      throw new Error('SMS service not configured')
    }

    const recipientList = recipients.join(',')

    const smsResponse = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'ApiKey': AT_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        username: AT_USERNAME,
        to: recipientList,
        message: messageContent,
        ...(AT_SENDER_ID && { from: AT_SENDER_ID })
      })
    })

    const smsResult = await smsResponse.json()
    
    // Log bulk notification
    await supabaseClient
      .from('notification_logs')
      .insert({
        trigger_event: 'bulk_message',
        type: 'manual',
        channels: ['sms'],
        recipients: recipients,
        message_content: messageContent,
        status: smsResult.SMSMessageData?.Recipients?.every((r: any) => r.status === 'Success') ? 'sent' : 'partial',
        provider_response: smsResult,
        isp_company_id: isp_company_id
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bulk SMS sent successfully',
        results: smsResult.SMSMessageData?.Recipients || [],
        total_sent: recipients.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-bulk-sms:', error)
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
