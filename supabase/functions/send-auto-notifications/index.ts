
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@4.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  client_id: string
  trigger_event: string
  data: Record<string, any>
  template_id?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Auto Notification Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { client_id, trigger_event, data, template_id }: NotificationRequest = await req.json()

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
      console.error('Client not found:', clientError)
      return new Response(
        JSON.stringify({ success: false, error: 'Client not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get notification templates for this trigger event
    const { data: templates, error: templatesError } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('trigger_event', trigger_event)
      .eq('is_active', true)
      .eq('auto_send', true)

    if (templatesError) {
      console.error('Error fetching templates:', templatesError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch templates' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results = []

    for (const template of templates || []) {
      try {
        // Replace variables in template content
        const processedTemplate = processTemplateVariables(template, client, data)

        // Send notifications based on channels
        if (template.channels.includes('email') && client.email) {
          const emailResult = await sendEmailNotification(processedTemplate, client.email, data)
          results.push({ type: 'email', template: template.name, success: emailResult.success })
        }

        if (template.channels.includes('sms') && client.phone) {
          const smsResult = await sendSMSNotification(processedTemplate, client.phone)
          results.push({ type: 'sms', template: template.name, success: smsResult.success })
        }

        // Log the notification
        await supabase
          .from('notification_logs')
          .insert({
            client_id: client_id,
            template_id: template.id,
            trigger_event: trigger_event,
            channels: template.channels,
            recipients: [client.email, client.phone].filter(Boolean),
            status: 'sent',
            isp_company_id: client.isp_company_id
          })

      } catch (error) {
        console.error('Error processing template:', template.name, error)
        results.push({ type: 'error', template: template.name, success: false, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Auto notification error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function processTemplateVariables(template: any, client: any, data: any) {
  const variables = {
    client_name: client.name,
    client_email: client.email,
    client_phone: client.phone,
    ...data
  }

  const processText = (text: string) => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] || match
    })
  }

  return {
    ...template,
    email_template: {
      subject: processText(template.email_template.subject),
      content: processText(template.email_template.content)
    },
    sms_template: {
      content: processText(template.sms_template.content)
    }
  }
}

async function sendEmailNotification(template: any, email: string, data: any) {
  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    const emailData: any = {
      from: 'Lake Link Communications <noreply@lakelink.co.ke>',
      to: [email],
      subject: template.email_template.subject,
      html: formatEmailHTML(template.email_template.content)
    }

    // Add PDF attachment if it's a payment confirmation
    if (template.trigger_event === 'payment_received' && data.receipt_html) {
      // In a real implementation, you would generate PDF here
      // For now, we'll just mention it in the email
      emailData.html += `<p><strong>Receipt:</strong> ${data.receipt_number}</p>`
    }

    const result = await resend.emails.send(emailData)
    console.log('Email sent:', result)
    return { success: true, result }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.message }
  }
}

async function sendSMSNotification(template: any, phone: string) {
  try {
    const apiKey = Deno.env.get('CELCOMAFRICA_API_KEY')
    const partnerId = Deno.env.get('CELCOMAFRICA_PARTNER_ID')
    const shortcode = Deno.env.get('CELCOMAFRICA_SHORTCODE')

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone
    }

    const smsPayload = {
      apikey: apiKey,
      partnerID: partnerId,
      message: template.sms_template.content,
      shortcode: shortcode,
      mobile: formattedPhone
    }

    const response = await fetch('https://isms.celcomafrica.com/api/services/sendsms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smsPayload)
    })

    const result = await response.json()
    console.log('SMS sent:', result)
    return { success: true, result }
  } catch (error) {
    console.error('SMS sending failed:', error)
    return { success: false, error: error.message }
  }
}

function formatEmailHTML(content: string) {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
          .content { margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Lake Link Communications</h2>
        </div>
        <div class="content">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
          <p>This is an automated message from Lake Link Communications</p>
          <p>For support: https://main.lakelink.co.ke/client-portal/</p>
        </div>
      </body>
    </html>
  `
}
