
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  client_id: string;
  type: 'payment_success' | 'payment_reminder' | 'service_expiry' | 'service_renewal' | 'wallet_reminder' | 'receipt';
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Notification Request Started ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const requestBody: NotificationRequest = await req.json()
    console.log('Sending notification:', requestBody.type, 'to client:', requestBody.client_id)

    const { client_id, type, data } = requestBody

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
      console.error('Client not found for notification:', clientError)
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

    // Generate notification content based on type
    let message = ''
    let subject = ''

    switch (type) {
      case 'payment_success':
        subject = 'Payment Confirmation'
        message = `Dear ${client.name}, your payment of KES ${data?.amount} has been received successfully. Receipt: ${data?.receipt_number}. New balance: KES ${data?.new_balance || 0}.`
        if (data?.auto_renewed) {
          message += ` Your subscription has been automatically renewed and your internet connection is now active.`
        }
        break

      case 'service_renewal':
        subject = 'Service Renewed - Internet Connection Restored'
        message = `Dear ${client.name}, your internet service has been successfully renewed. Your subscription is now active until ${new Date(data?.service_period_end).toLocaleDateString()}. Your internet connection has been restored. Thank you for your payment!`
        break

      case 'payment_reminder':
        subject = 'Payment Reminder'
        message = `Dear ${client.name}, your service expires in ${data?.days_until_expiry} day(s). Please pay KES ${data?.amount} to continue enjoying our services.`
        break

      case 'service_expiry':
        subject = 'Service Suspended'
        message = `Dear ${client.name}, your internet service has been suspended due to non-payment. Please make payment to reactivate your service.`
        break

      case 'wallet_reminder':
        subject = 'Wallet Top-up Reminder'
        message = `Dear ${client.name}, your service expires in ${data?.days_until_expiry} day(s). Current balance: KES ${data?.current_balance}. Top up KES ${data?.required_amount} using Paybill ${data?.paybill_number}, Account: ${data?.account_number}.`
        break

      case 'receipt':
        subject = 'Payment Receipt'
        message = `Dear ${client.name}, please find your payment receipt attached. Thank you for your payment.`
        break

      default:
        subject = 'Service Notification'
        message = `Dear ${client.name}, this is a notification regarding your internet service.`
    }

    // Send SMS notification if phone number exists
    if (client.phone) {
      try {
        await sendSMS(client.phone, message)
        console.log('SMS sent to:', client.phone)
      } catch (smsError) {
        console.error('SMS sending failed:', smsError)
      }
    }

    // Send email notification if email exists
    if (client.email) {
      try {
        await sendEmail(client.email, subject, message, data?.receipt_html)
        console.log('Email sent to:', client.email)
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
      }
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
        error: 'Failed to send notifications',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function sendSMS(phoneNumber: string, message: string) {
  const apiKey = Deno.env.get('AFRICASTALKING_API_KEY')
  const username = Deno.env.get('AFRICASTALKING_USERNAME')
  const senderId = Deno.env.get('AFRICASTALKING_SENDER_ID')

  if (!apiKey || !username) {
    console.log('SMS service not configured')
    return
  }

  const response = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'apiKey': apiKey,
    },
    body: new URLSearchParams({
      username: username,
      to: phoneNumber,
      message: message,
      from: senderId || 'ISP'
    }),
  })

  const result = await response.text()
  console.log('SMS API response:', result)
}

async function sendEmail(email: string, subject: string, message: string, htmlContent?: string) {
  const resendKey = Deno.env.get('RESEND_API_KEY')

  if (!resendKey) {
    console.log('Email service not configured')
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@yourisp.co.ke',
      to: email,
      subject: subject,
      text: message,
      html: htmlContent || `<p>${message}</p>`,
    }),
  })

  const result = await response.json()
  console.log('Email API response:', result)
}
