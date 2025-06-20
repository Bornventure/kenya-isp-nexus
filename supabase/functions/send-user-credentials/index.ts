
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CredentialRequest {
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  password: string;
  role: string;
  site_url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Credential Delivery Request Started ===')

    const requestBody: CredentialRequest = await req.json()
    console.log('Sending credentials to:', requestBody.email)

    const { email, phone, first_name, last_name, password, role, site_url } = requestBody

    // Use the passed site_url or fallback to environment variable
    const loginUrl = site_url || Deno.env.get('SITE_URL') || 'https://your-domain.com'

    // Generate email content
    const emailSubject = 'Your Account Credentials - Welcome to DataDefender!'
    const emailMessage = `
Dear ${first_name} ${last_name},

Welcome to DataDefender ISP Management System! Your account has been created with the following credentials:

Login Details:
Email: ${email}
Password: ${password}
Role: ${role.replace('_', ' ').toUpperCase()}

You can access the system at: ${loginUrl}

IMPORTANT SECURITY NOTES:
• Please keep these credentials secure and confidential
• Change your password after your first login for enhanced security
• Do not share your login credentials with anyone

If you have any questions or need assistance, please contact your system administrator.

Best regards,
DataDefender Team
ISP Management System
    `.trim()

    // Generate SMS content
    const smsMessage = `Welcome to DataDefender! Your login credentials: Email: ${email}, Password: ${password}. Login at: ${loginUrl}. Please change password after first login.`

    // Send email notification
    try {
      await sendEmail(email, emailSubject, emailMessage)
      console.log('Email sent to:', email)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
    }

    // Send SMS notification if phone number exists
    if (phone) {
      try {
        await sendSMS(phone, smsMessage)
        console.log('SMS sent to:', phone)
      } catch (smsError) {
        console.error('SMS sending failed:', smsError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Credentials sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Credential delivery error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to send credentials',
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
      from: senderId || 'DataDefender'
    }),
  })

  const result = await response.text()
  console.log('SMS API response:', result)
}

async function sendEmail(email: string, subject: string, message: string) {
  const resendKey = Deno.env.get('RESEND_API_KEY')

  if (!resendKey) {
    console.log('Email service not configured - Resend API key missing')
    return
  }

  // Use your verified domain
  const fromEmail = 'noreply@qorioninnovations.com'

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `DataDefender <${fromEmail}>`,
      to: email,
      subject: subject,
      text: message,
      html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${message}</pre>`,
    }),
  })

  const result = await response.json()
  console.log('Email API response:', result)
  
  if (!response.ok) {
    throw new Error(`Email sending failed: ${result.error || 'Unknown error'}`)
  }
}
