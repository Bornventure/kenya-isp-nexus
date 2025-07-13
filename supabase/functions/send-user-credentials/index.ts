
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, companyName, companyId, licenseKey, contactName } = await req.json()

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to DataDefender ISP Management Portal</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .credentials { background: #fff; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to DataDefender</h1>
            <p>ISP Management Portal</p>
          </div>
          
          <div class="content">
            <h2>Hello ${contactName},</h2>
            
            <p>Congratulations! Your ISP company <strong>${companyName}</strong> has been successfully registered with DataDefender. Below are your login credentials and license information:</p>
            
            <div class="credentials">
              <h3>🔐 Login Credentials</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Company ID:</strong> ${companyId}</p>
              <p><strong>License Key:</strong> ${licenseKey}</p>
            </div>
            
            <h3>📋 Next Steps:</h3>
            <ol>
              <li><strong>Login to your dashboard</strong> using the credentials above</li>
              <li><strong>Activate your license</strong> by entering your Company ID and License Key in the activation page</li>
              <li><strong>Start managing your ISP operations</strong> - add clients, manage billing, monitor network</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '.vercel.app') || 'https://your-app-domain.com'}" class="button">
                Access Your Dashboard
              </a>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4>🔒 Security Notice:</h4>
              <p>Please change your password after your first login. Keep your Company ID and License Key secure - they are required for system activation.</p>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>DataDefender Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} DataDefender. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const emailData = {
      from: 'DataDefender <noreply@datadefender.com>',
      to: [email],
      subject: `Welcome to DataDefender - Your ISP Account is Ready`,
      html: emailHtml,
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      throw new Error(`Failed to send email: ${error}`)
    }

    const result = await response.json()
    console.log('Email sent successfully:', result)

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending credentials email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
