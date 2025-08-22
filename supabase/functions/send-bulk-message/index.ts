
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkMessageRequest {
  recipients: Array<{
    id: string;
    name: string;
    email?: string;
    phone: string;
  }>;
  subject?: string;
  message: string;
  messageType: 'sms' | 'email' | 'both';
  senderType: 'sales' | 'admin';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { recipients, subject, message, messageType, senderType }: BulkMessageRequest = await req.json();

    console.log(`Sending bulk ${messageType} message to ${recipients.length} recipients`);

    let successCount = 0;
    let errorCount = 0;

    for (const recipient of recipients) {
      try {
        // Send SMS if required
        if (messageType === 'sms' || messageType === 'both') {
          const smsResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-sms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
            },
            body: JSON.stringify({
              phone: recipient.phone,
              message: `Dear ${recipient.name}, ${message}`
            })
          });

          if (!smsResponse.ok) {
            console.error(`Failed to send SMS to ${recipient.phone}`);
            errorCount++;
            continue;
          }
        }

        // Send Email if required
        if ((messageType === 'email' || messageType === 'both') && recipient.email) {
          const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
            },
            body: JSON.stringify({
              to: recipient.email,
              subject: subject || 'Important Update',
              html: `
                <h2>Dear ${recipient.name},</h2>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <br>
                <p>Best regards,<br>Your ISP Team</p>
              `
            })
          });

          if (!emailResponse.ok) {
            console.error(`Failed to send email to ${recipient.email}`);
            errorCount++;
            continue;
          }
        }

        successCount++;

        // Log the message in notification_logs
        await supabaseClient
          .from('notification_logs')
          .insert({
            client_id: recipient.id,
            type: 'bulk_message',
            channels: messageType === 'both' ? ['sms', 'email'] : [messageType],
            recipients: messageType === 'both' 
              ? [recipient.phone, recipient.email].filter(Boolean)
              : messageType === 'sms' ? [recipient.phone] : [recipient.email].filter(Boolean),
            status: 'sent',
            trigger_event: 'manual_bulk_message'
          });

      } catch (error) {
        console.error(`Error sending message to ${recipient.name}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Bulk message sent successfully`,
        stats: {
          total: recipients.length,
          successful: successCount,
          failed: errorCount
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in send-bulk-message function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
