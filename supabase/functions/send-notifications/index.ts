
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

interface NotificationRequest {
  client_id: string;
  type: 'payment_reminder' | 'payment_success' | 'service_expiry' | 'service_activation';
  data?: any;
}

// Africa's Talking SMS function with sender ID
async function sendSMS(phoneNumber: string, message: string) {
  const apiKey = Deno.env.get('AFRICASTALKING_API_KEY')
  const username = Deno.env.get('AFRICASTALKING_USERNAME')
  const senderId = Deno.env.get('AFRICASTALKING_SENDER_ID') || 'AFRICASTKNG' // Default sender ID
  
  if (!apiKey || !username) {
    console.log('Africa\'s Talking credentials not configured')
    return { success: false, error: 'SMS service not configured' }
  }

  try {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('to', phoneNumber)
    formData.append('message', message)
    formData.append('from', senderId) // Add sender ID

    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'apiKey': apiKey,
        'Accept': 'application/json'
      },
      body: formData
    })

    const result = await response.json()
    console.log('SMS sent:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('SMS sending failed:', error)
    return { success: false, error: error.message }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { client_id, type, data }: NotificationRequest = await req.json()

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
      throw new Error('Client not found')
    }

    let emailSubject = ''
    let emailContent = ''
    let smsMessage = ''

    // Generate notification content based on type
    switch (type) {
      case 'payment_reminder':
        const daysUntilExpiry = data?.days_until_expiry || 1
        emailSubject = `Payment Reminder - ${daysUntilExpiry} day(s) remaining`
        emailContent = `
          <h2>Payment Reminder</h2>
          <p>Dear ${client.name},</p>
          <p>This is a friendly reminder that your internet service will expire in ${daysUntilExpiry} day(s).</p>
          <p>Please renew your package to avoid service interruption.</p>
          <p>Amount due: KES ${data?.amount || client.monthly_rate}</p>
          <p>Thank you for choosing our services!</p>
        `
        smsMessage = `Hi ${client.name}, your internet service expires in ${daysUntilExpiry} day(s). Renew now to avoid disconnection. Amount: KES ${data?.amount || client.monthly_rate}`
        break

      case 'payment_success':
        emailSubject = 'Payment Confirmation - Service Renewed'
        emailContent = `
          <h2>Payment Successful!</h2>
          <p>Dear ${client.name},</p>
          <p>Your payment of KES ${data?.amount} has been received successfully.</p>
          <p>Your internet service has been renewed and will remain active.</p>
          <p>Receipt Number: ${data?.receipt_number}</p>
          <p>Thank you for your payment!</p>
        `
        smsMessage = `Payment of KES ${data?.amount} received. Your internet service has been renewed. Receipt: ${data?.receipt_number}. Thank you!`
        break

      case 'service_expiry':
        emailSubject = 'Service Expired - Immediate Action Required'
        emailContent = `
          <h2>Service Expired</h2>
          <p>Dear ${client.name},</p>
          <p>Your internet service has expired and has been temporarily suspended.</p>
          <p>Please renew your package immediately to restore your connection.</p>
          <p>Contact support if you need assistance.</p>
        `
        smsMessage = `Your internet service has expired and is suspended. Please renew immediately to restore connection. Contact support for help.`
        break

      case 'service_activation':
        emailSubject = 'Service Activated - Welcome Back!'
        emailContent = `
          <h2>Service Activated</h2>
          <p>Dear ${client.name},</p>
          <p>Your internet service has been activated and is now fully operational.</p>
          <p>Enjoy your high-speed internet connection!</p>
        `
        smsMessage = `Your internet service is now active and operational. Enjoy your connection!`
        break
    }

    // Send email notification
    if (client.email) {
      try {
        await resend.emails.send({
          from: 'Qorion Innovations <noreply@qorion.co.ke>',
          to: [client.email],
          subject: emailSubject,
          html: emailContent,
        })
        console.log('Email sent to:', client.email)
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
      }
    }

    // Send SMS notification
    if (client.phone) {
      await sendSMS(client.phone, smsMessage)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notifications sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to send notifications'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
