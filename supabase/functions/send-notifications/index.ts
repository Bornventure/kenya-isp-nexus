
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
  type: 'wallet_reminder' | 'payment_success' | 'service_expiry' | 'service_activation' | 'wallet_credit';
  data?: any;
}

// Africa's Talking SMS function with sender ID
async function sendSMS(phoneNumber: string, message: string) {
  const apiKey = Deno.env.get('AFRICASTALKING_API_KEY')
  const username = Deno.env.get('AFRICASTALKING_USERNAME')
  const senderId = Deno.env.get('AFRICASTALKING_SENDER_ID') || 'AFRICASTKNG'
  
  if (!apiKey || !username) {
    console.log('Africa\'s Talking credentials not configured')
    return { success: false, error: 'SMS service not configured' }
  }

  try {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('to', phoneNumber)
    formData.append('message', message)
    formData.append('from', senderId)

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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount).replace('KES', 'KES ')
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
      case 'wallet_reminder':
        const daysText = data?.days_until_expiry === 1 ? 'Today!' : 
                        data?.days_until_expiry === 2 ? '2 Days!' : '3 Days!'
        const requiredAmount = formatCurrency(data?.required_amount || 0)
        
        emailSubject = `Plan Expiry Alert - ${daysText}`
        emailContent = `
          <h2>Plan Expiry Reminder</h2>
          <p>Dear ${client.name},</p>
          <p>Your plan expires in <strong>${daysText}</strong></p>
          <p>Current wallet balance: ${formatCurrency(data?.current_balance || 0)}</p>
          <p>Plan amount: ${formatCurrency(data?.package_amount || 0)}</p>
          ${data?.required_amount > 0 ? `
            <p><strong>Top-up required: ${requiredAmount}</strong></p>
            <p>To credit your account, pay exactly ${requiredAmount} via M-Pesa Paybill ${data?.paybill_number || '123456'} using ${data?.account_number || client.phone} as the account number.</p>
          ` : `
            <p>✅ Your wallet has sufficient balance for auto-renewal!</p>
          `}
          <p>Plan and top-up before expiry to avoid interruptions.</p>
        `
        
        smsMessage = `Dear ${client.name}, your plan expires in ${daysText} ${data?.required_amount > 0 ? 
          `Top-up ${requiredAmount} via M-Pesa Paybill ${data?.paybill_number || '123456'}, Account: ${data?.account_number || client.phone}` : 
          'Your wallet has sufficient balance for auto-renewal!'
        }`
        break

      case 'wallet_credit':
        emailSubject = 'Wallet Credit Confirmation'
        emailContent = `
          <h2>Wallet Credited Successfully!</h2>
          <p>Dear ${client.name},</p>
          <p>Your wallet has been credited with ${formatCurrency(data?.amount)}.</p>
          <p>New wallet balance: ${formatCurrency(data?.new_balance)}</p>
          ${data?.auto_renewed ? '<p>✅ Your subscription has been automatically renewed!</p>' : ''}
          <p>Thank you for your payment!</p>
        `
        smsMessage = `Wallet credited: ${formatCurrency(data?.amount)}. New balance: ${formatCurrency(data?.new_balance)}. ${data?.auto_renewed ? 'Subscription auto-renewed!' : ''}`
        break

      case 'payment_success':
        emailSubject = 'Payment Confirmation - Wallet Credited'
        emailContent = `
          <h2>Payment Successful!</h2>
          <p>Dear ${client.name},</p>
          <p>Your payment of ${formatCurrency(data?.amount)} has been received and added to your wallet.</p>
          <p>Receipt Number: ${data?.receipt_number}</p>
          <p>Thank you for your payment!</p>
        `
        smsMessage = `Payment of ${formatCurrency(data?.amount)} received and added to wallet. Receipt: ${data?.receipt_number}. Thank you!`
        break

      case 'service_expiry':
        emailSubject = 'Service Expired - Wallet Top-up Required'
        emailContent = `
          <h2>Service Expired</h2>
          <p>Dear ${client.name},</p>
          <p>Your internet service has expired and has been temporarily suspended.</p>
          <p>Please top-up your wallet to restore your connection.</p>
          <p>Top-up via M-Pesa Paybill ${data?.paybill_number || '123456'} using ${client.phone} as account number.</p>
        `
        smsMessage = `Your internet service has expired. Top-up your wallet via M-Pesa Paybill ${data?.paybill_number || '123456'}, Account: ${client.phone} to restore connection.`
        break

      case 'service_activation':
        emailSubject = 'Service Activated - Welcome Back!'
        emailContent = `
          <h2>Service Activated</h2>
          <p>Dear ${client.name},</p>
          <p>Your internet service has been activated and is now fully operational.</p>
          <p>Current wallet balance: ${formatCurrency(data?.wallet_balance || 0)}</p>
          <p>Enjoy your high-speed internet connection!</p>
        `
        smsMessage = `Your internet service is now active! Wallet balance: ${formatCurrency(data?.wallet_balance || 0)}. Enjoy your connection!`
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
